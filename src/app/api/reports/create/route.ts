import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth"
import { db } from "@/app/db";
import { reports } from "@/app/db/schema";
import { checkReportOwnership } from "@/services/reportService";
// POST create report 
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || !checkReportOwnership(session.user.id)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await request.json();
  const report = await db.insert(reports).values({
    title,
    description,
    user_id: session.user.id,
    created_at: new Date(),
    updated_at: new Date(),
    tags: [],
  });
  return NextResponse.json(report);

}
