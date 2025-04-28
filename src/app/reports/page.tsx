"use client";

import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import SignOutButton from "../components/sign-out";
import { FaPlusCircle, FaEdit, FaDownload, FaTrash, FaImage, FaVideo, FaFileAudio, FaFile, FaPen, FaCamera, FaMicrophone, FaFileAlt } from "react-icons/fa";
import { IconType } from "react-icons";
import Image from "next/image";
import { createEmptyReport, getReports, getRecentTags } from "@/services/reportService";
import { getAttachmentCountsByType } from "@/services/attachmentService";
import { useEffect, useState } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import downloadReport from "@/services/downloadReport";

interface Report {
  id: string;
  title: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  tags: string[];
  attachmentCounts?: Record<string, number>;
}

function NumberedAttachments({ icon: Icon, number }: { icon: IconType, number: number }) {
  if (number <= 0) return null;
  
  return (
    <div className="relative inline-block">
      <div className="w-8 h-8 flex items-center justify-center text-white">
        <Icon className="w-6 h-6" />
      </div>
      <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">
        {number}
      </div>
    </div>
  );
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
      className="bg-[#0073E6] w-50 h-15 mb-4 flex flex-row items-center justify-center gap-2 rounded-lg"
    > 
      <FaPlusCircle className="w-5 h-5" />
      New Report
    </button>
  )
}
function UserInfoDropDown() {
  const { data: session } = useSession();
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex flex-row items-center gap-2">
          <Image src={session?.user?.image || ""} alt="User Avatar" width={48} height={48} className="rounded-full" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>
          <SignOutButton />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>

  )
}
function ReportsHeader() {
  return (
    <div className="p-4 bg-[#1B1F3F] flex flex-row justify-between items-center">
      <Image src="/logo.png" alt="logo" width={100} height={80} />
      <h1 className="text-white text-xl text-center">Reports</h1>
      <UserInfoDropDown />
    </div>
  );
}

function TagSearch() {
  const [recentTags, setRecentTags] = useState<string[]>([]);
  const removeDups = ( arr: string[]): string[]  => {
    let unique: string[] = 
        arr.reduce(function (acc: string[], curr: string) {
        if (!acc.includes(curr))
            acc.push(curr);
        return acc;
    }, []);
    return unique;
}
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tags = await getRecentTags();
        setRecentTags(removeDups(tags.filter((tag): tag is string => tag !== null)));
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };
    
    fetchTags();
  }, []);
  
  return (
    <div className="px-3 py-2 bg-[#1B1F3F] rounded-lg mx-3 my-2">
      <input 
        type="text" 
        className="w-full bg-[#2d3363] text-white rounded-lg p-2 text-sm" 
        placeholder="Search by tag" 
      />
      <div className="mt-2">
        <p className="text-gray-300 text-xs mb-1">Previously used</p>
        <div className="flex flex-wrap gap-1">
          {recentTags.map((tag, index) => (
            <button 
              key={index} 
              className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs cursor-pointer"
              onClick={() => {
                console.log(tag); //TODO: Implement tag search
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ReportCard({ report, onEdit, onDownload }: { report: Report, onEdit: (id: string) => void, onDownload: (id: string) => void }) {
  const date = new Date(report.created_at);
  const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} ${date.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit', hour12: true})}`;
  const description = report.description.substring(0, 50) + "...";
  
  const mediaIconMap = {
    'picture': FaCamera,
    'video': FaVideo,
    'audio': FaMicrophone,
    'sketch': FaPen,
    'document': FaFileAlt
  };
  
  return (
    <div className="bg-[#1B1F3F] rounded-lg p-4 mb-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-medium">{report.title}</h3>
          <p className="text-gray-400 text-sm">{formattedDate}</p>
          <p className="text-gray-300 text-sm">{description}</p>
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
          {report.attachmentCounts && (
            <div className="flex gap-3 mt-2">
              {Object.entries(report.attachmentCounts).map(([type, count]) => (
                count > 0 && (
                  <NumberedAttachments 
                    key={type} 
                    icon={mediaIconMap[type as keyof typeof mediaIconMap]} 
                    number={count} 
                  />
                )
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2">
        <button 
          onClick={() => onEdit(report.id)}
          className="bg-gray-700 p-2 rounded-full"
        >
          <FaEdit className="text-white" />
        </button>
        <button 
          onClick={() => onDownload(report.id)}
          className="bg-gray-700 p-2 rounded-full"
        >
          <FaDownload className="text-white" />
        </button>
        </div>
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
        const reportsWithBasicInfo = data.map(report => ({
          id: report.id,
          title: report.title || "",
          description: report.description || "",
          created_at: report.created_at,
          updated_at: report.updated_at,
          tags: report.tags || []
        }));
        
        const reportsWithAttachments = await Promise.all(
          reportsWithBasicInfo.map(async (report) => {
            try {
              const counts = await getAttachmentCountsByType(report.id);
              return { ...report, attachmentCounts: counts };
            } catch (error) {
              console.error(`Failed to fetch attachment counts for report ${report.id}:`, error);
              return report;
            }
          })
        );
        
        setReports(reportsWithAttachments);
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

  const handleDownloadReport = (id: string) => {
    downloadReport(id);
  };

  if(!session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col h-screen">
      <ReportsHeader />
      <div className="flex-1 overflow-hidden">
        <TagSearch />
        
        <div className="px-3 pb-20 overflow-y-auto h-[calc(100vh-230px)]">
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
                onDownload={handleDownloadReport}
              />
            ))
          )}
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-[#1B1F3F] p-3 flex justify-center">
        <NewReportButton />
      </div>
    </div>
  );
}
