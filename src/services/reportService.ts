import { db } from "@/app/db";
import { reports } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "next-auth/react";
import { auth } from "../../auth";


export const checkReportOwnership = async (reportId: string) => {
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
    return report.user_id === session.user.id;
    
}

export const reportService = {
    async createReport(title: string, description: string) {
        const session = await auth();
        if (!session?.user?.id) {
            throw new Error("Unauthorized");
        }
        const response = await fetch('/api/reports/create', {
            method: 'POST',
            body: JSON.stringify({ title, description }),
        });
        return response.json();
    },
    async updateReport(reportId: string, title: string, description: string, tags: string[]) {
        const session = await auth();
        if (!session?.user?.id || !checkReportOwnership(reportId)) {
            throw new Error("Unauthorized");
        }
        const response = await fetch(`/api/reports/${reportId}/update`, {
            method: 'PATCH',
            body: JSON.stringify({ title, description, tags }),
        });
        return response.json();
    },
    async deleteReport(reportId: string) {
        const session = await auth();
        if (!session?.user?.id || !checkReportOwnership(reportId)) {
            throw new Error("Unauthorized");
        }
        const response = await fetch(`/api/reports/${reportId}/delete`, {
            method: 'DELETE',
        });
        return response.json();
    },
    async getReport(reportId: string) {
        const response = await fetch(`/api/reports/${reportId}`);
        return response.json();
    },
    async getReports() {
        const response = await fetch('/api/reports');
        return response.json();
    }

}






