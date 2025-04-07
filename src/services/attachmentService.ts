import { auth } from "../../auth";
import { db } from "@/app/db";
import { reports, attachments, mediaType } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { uploadFile, deleteFile } from "./vercelBlobService";


async function verifyUserOwnership(attachmentId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const attachmentReport = await db.query.reports.findFirst({
        where: eq(reports.id, attachmentId),
    });

    if (!attachmentReport) {
        throw new Error("Report not found");
    }

    if (attachmentReport.user_id !== session.user.id) {
        throw new Error("Unauthorized");
    }

    return true;
}

export async function createAttachment(reportId: string, file: File, mediaTypeValue: typeof mediaType.enumValues[number], title?: string, description?: string) {
    const session = await auth();
    if (!session?.user?.id)
        throw new Error("Unauthorized");
    
    const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
    });
    
    if (!report) 
        throw new Error("Report not found");

    if (report.user_id !== session.user.id) 
        throw new Error("Unauthorized");
    

    // vercel blob
    const mediaUrl = await uploadFile(file, mediaTypeValue);
    
    if (!mediaUrl) {
        throw new Error("Failed to upload file");
    }

    // database
    const [attachment] = await db.insert(attachments).values({
        report_id: reportId,
        media_type: mediaTypeValue,
        title: title || "Untitled Attachment",
        description: description || "No description",
        media_url: mediaUrl,
        location: null,
        metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
    }).returning();

    return attachment;
}

export async function addAttachmentMedia(attachmentId: string, file: File) {
    const session = await auth();
    if (!session?.user?.id || !(await verifyUserOwnership(attachmentId)))
        throw new Error("Unauthorized");

    const attachment = await db.query.attachments.findFirst({
        where: eq(attachments.id, attachmentId),
    });

    if (!attachment)
        throw new Error("Attachment not found");

    // blob
    const mediaUrl = await uploadFile(file, attachment.media_type);

    if (!mediaUrl) {
        throw new Error("Failed to upload file");
    }

    await db.update(attachments).set({
        media_url: mediaUrl,
        updated_at: new Date(),
    }).where(eq(attachments.id, attachmentId));

    return true;
}
export async function removeAttachmentMedia(attachmentId: string) {
    const session = await auth();
    if (!session?.user?.id || !(await verifyUserOwnership(attachmentId)))
        throw new Error("Unauthorized");

    const attachment = await db.query.attachments.findFirst({
        where: eq(attachments.id, attachmentId),
    });

    if (!attachment)
        throw new Error("Attachment not found");

    // blob 
    await deleteFile(attachment.media_url);

    // database
    await db.update(attachments).set({
        media_url: "null",
        updated_at: new Date(),
    }).where(eq(attachments.id, attachmentId));

    return true;
}

export async function updateAttachmentInfo(attachmentId: string, title?: string, description?: string) {

    const session = await auth();
    if (!session?.user?.id || !(await verifyUserOwnership(attachmentId)))
        throw new Error("Unauthorized");

    const attachment = await db.query.attachments.findFirst({
        where: eq(attachments.id, attachmentId),
    });

    if (!attachment)
        throw new Error("Attachment not found");


    await db.update(attachments).set({
        title: title,
        description: description,
        updated_at: new Date(),
    }).where(eq(attachments.id, attachmentId));

    return true;
}

export async function deleteAttachment(attachmentId: string) {
    const session = await auth();
    if (!session?.user?.id || !(await verifyUserOwnership(attachmentId)))
        throw new Error("Unauthorized");

    const attachment = await db.query.attachments.findFirst({
        where: eq(attachments.id, attachmentId),
    });

    if (!attachment)
        throw new Error("Attachment not found");

    await removeAttachmentMedia(attachmentId);

    await db.delete(attachments).where(eq(attachments.id, attachmentId));

    return true;
}

export async function getAttachments(reportId: string) {
    const session = await auth();
    if (!session?.user?.id || !(await verifyUserOwnership(reportId)))
        throw new Error("Unauthorized");

    const allAttachments = await db.query.attachments.findMany({
        where: eq(attachments.report_id, reportId),
    });

    return allAttachments;
}

export async function getAttachment(attachmentId: string) {
    const session = await auth();
    if (!session?.user?.id || !(await verifyUserOwnership(attachmentId)))
        throw new Error("Unauthorized");

    const attachment = await db.query.attachments.findFirst({
        where: eq(attachments.id, attachmentId),
    });

    return attachment;


}

export async function getAttachmentCountsByType(reportId: string) {
    const session = await auth();
    if (!session?.user?.id || !(await verifyUserOwnership(reportId)))
        throw new Error("Unauthorized");

    const allAttachments = await db.query.attachments.findMany({
        where: eq(attachments.report_id, reportId),
    });

    const counts: Record<typeof mediaType.enumValues[number], number> = {} as any;
    
    for (const type of mediaType.enumValues) {
        counts[type] = 0;
    }
    
    for (const attachment of allAttachments) {
        counts[attachment.media_type]++;
    }
    
    return counts;
}
