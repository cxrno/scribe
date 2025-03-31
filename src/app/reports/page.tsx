"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import SignOutButton from "../components/sign-out";
import { FaPlusCircle, FaEdit, FaDownload, FaTrash } from "react-icons/fa";
import Image from "next/image";
import { createEmptyReport, getReports } from "@/services/reportService";
import { useEffect, useState } from "react";

// Types
interface Report {
  id: string;
  title: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  tags: string[];
}

function NewReportButton() {
  const router = useRouter();
  
  const handleCreateReport = async () => {
    try {
      const reportId = await createEmptyReport();
      router.push(`/reports/${reportId}/editor`);
    } catch (error) {
      console.error("Failed to create report:", error);
    }
  };
  
  return (
    <button 
      onClick={handleCreateReport}
      className="bg-[#0073E6] w-20 h-12 flex flex-row items-center justify-center gap-2 rounded-lg"
    > 
      <FaPlusCircle className="w-5 h-5" />
      New
    </button>
  )
}

function ReportsHeader() {
  return (
    <div className="p-6 bg-[#1B1F3F] flex flex-row justify-between">
      <Image src="/logo.png" alt="logo" width={120} height={100} />
      <h1 className="text-white text-2xl text-center mt-2">Reports</h1>
      <NewReportButton />
    </div>
  );
}

function TagSearch() {
  return (
    <div className="px-4 py-3">
      <input 
        type="text" 
        className="w-full bg-[#282434] text-white rounded-lg p-3" 
        placeholder="Search by tag" 
      />
      <div className="mt-2">
        <p className="text-gray-400 text-sm mb-1">Previously used</p>
        <div className="flex flex-wrap gap-2">
  
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report, onEdit }: { report: Report, onEdit: (id: string) => void }) {
  const formattedDate = report.created_at.toString();
  
  return (
    <div className="bg-[#1B1F3F] rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-medium">{report.title}</h3>
          <p className="text-gray-400 text-sm">{formattedDate}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {report.tags.map((tag, index) => {
              let bgColor = "bg-blue-500";
              return (
                <span 
                  key={index} 
                  className={`${bgColor} text-white px-2 py-1 rounded-md text-xs`}
                >
                  {tag}
                </span>
              );
            })}
          </div>
        </div>
        <button 
          onClick={() => onEdit(report.id)}
          className="bg-gray-700 p-2 rounded-full"
        >
          <FaEdit className="text-white" />
        </button>
      </div>
    </div>
  );
}

export default function Reports() {
  const { data: session } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(data.map(report => ({
          id: report.id,
          title: report.title || "",
          description: report.description || "",
          created_at: report.created_at,
          updated_at: report.updated_at,
          tags: report.tags || []
        })));
      } catch (error) {
        console.error("Failed to fetch reports:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleEditReport = (id: string) => {
    router.push(`/reports/${id}/editor`);
  };

  if(!session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-screen]">
      <ReportsHeader />
      <div className="flex-1 overflow-auto">
        <TagSearch />
        
        <div className="px-4 pb-20">
          {isLoading ? (
            <p className="text-white text-center mt-8">Loading reports...</p>
          ) : reports.length === 0 ? (
            <p className="text-white text-center mt-8">No reports found</p>
          ) : (
            reports.map((report) => (
              <ReportCard 
                key={report.id} 
                report={report} 
                onEdit={handleEditReport} 
              />
            ))
          )}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-[#1B1F3F] p-4 flex justify-center">
        <SignOutButton />
      </div>
    </div>
  );
}
