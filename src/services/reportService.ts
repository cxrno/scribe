'use server'

import { auth } from "../../auth";
import { db } from "@/app/db";
import { reports } from "@/app/db/schema";
import { eq } from "drizzle-orm";


export async function updateReport(reportId: string, reportData: { title: string, description: string, tags: string[] }) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    
    await db.update(reports).set({
        title: reportData.title,
        description: reportData.description,
        tags: reportData.tags,
        updated_at: new Date(),
    }).where(eq(reports.id, reportId));
    
    return { success: true };
}

export async function deleteReport(reportId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    
    await db.delete(reports).where(eq(reports.id, reportId));
    return { success: true };
}

export async function getReport(reportId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    
    const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
    });
    
    if (!report) {
        throw new Error("Report not found");
    }
    
    return {
        id: report.id,
        title: report.title,
        description: report.description,
        user_id: report.user_id,
        created_at: report.created_at,
        updated_at: report.updated_at,
        tags: report.tags,
    };
}

export async function getReports() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    
    const myReports = await db.query.reports.findMany({
        where: eq(reports.user_id, session.user.id),
    });
    
    return myReports.map(report => ({
        id: report.id,
        title: report.title,
        description: report.description,
        user_id: report.user_id,
        created_at: report.created_at,
        updated_at: report.updated_at,
        tags: report.tags,
    }));
}

export async function createEmptyReport() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    
    const result = await db.insert(reports).values({
        title: "Untitled Report",
        description: "No description",
        user_id: session.user.id,
        created_at: new Date(),
        updated_at: new Date(),
        tags: [],
    }).returning({ id: reports.id });
    
    return result[0].id;
}

export async function discardEmptyReport(reportId: string) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }
    
    const report = await db.query.reports.findFirst({
        where: eq(reports.id, reportId),
    });
    
    if (report?.title === "Untitled Report" && report?.description === "No description") {
        await db.delete(reports).where(eq(reports.id, reportId));
        return true;
    }
    
    return null;
}







