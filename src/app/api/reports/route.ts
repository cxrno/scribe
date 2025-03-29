import { db } from "@/app/db/index";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { reports } from "@/app/db/schema";
import { checkReportOwnership } from "@/services/reportService";
// GET all reports
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !checkReportOwnership(session.user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const myReports = await db.query.reports.findMany({
    where: eq(reports.user_id, session.user.id),
  });
  return NextResponse.json(myReports);
}