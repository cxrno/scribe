import { db } from "@/app/db/index";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "next-auth/react";
import { reports } from "@/app/db/schema";

// GET report by id
export async function GET(
  { params }: { params: { id: string } }
) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const report = await db.query.reports.findFirst({
        where: eq(reports.id, params.id),
    });

    if (!report) {
        return NextResponse.json({ error: "Report not found" }, { status: 404 });
    } 

    return NextResponse.json(report);
}
