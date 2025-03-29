import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../../auth";
import { db } from "@/app/db";
import { reports } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { checkReportOwnership } from "@/services/reportService";
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id || !checkReportOwnership(params.id)) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { title, description, tags} = await request.json();
    const report = await db.update(reports).set({
        title,
        description,
        tags,
        updated_at: new Date(),
    }).where(eq(reports.id, params.id));
    return NextResponse.json(report);

}
