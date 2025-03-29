import { auth } from "../../../../../../auth";
import { db } from "@/app/db";
import { reports } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { checkReportOwnership } from "@/services/reportService";

// DELETE report by id
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id || !checkReportOwnership(params.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const report = await db.delete(reports).where(eq(reports.id, params.id));
  return NextResponse.json(report);
}
