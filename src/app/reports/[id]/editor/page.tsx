"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { getReport, discardEmptyReport, updateReport, deleteReport } from "@/services/reportService";
import { FaTrash, FaPen } from "react-icons/fa";

export default function Editor() {
  const router = useRouter();
  const params = useParams();
  const reportId = params.id as string;
  
  const [report, setReport] = useState({
    title: "Unnamed Report",
    description: "",
    tags: [] as string[],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editedReport, setEditedReport] = useState({
    title: "",
    description: "",
    tags: [] as string[]
  });
  const [newTag, setNewTag] = useState("");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const data = await getReport(reportId);
        setReport({
          title: data.title || "Untitled Report",
          description: data.description || "No description",
          tags: data.tags || []
        });
        
        setEditedReport({
          title: data.title || "Untitled Report",
          description: data.description || "No description",
          tags: data.tags || []
        });
        
        const updated = new Date(data.updated_at);
        setLastUpdated(updated.toLocaleDateString() + " at " + updated.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}));
        
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch report:", error);
        setIsLoading(false);
      }
    };
    
    fetchReport();
  }, [reportId]);

  const handleExit = async () => {
    try {
      await discardEmptyReport(reportId);
      router.push("/reports");
    } catch (error) {
      console.error("Error discarding report:", error);
      router.push("/reports");
    }
  };

  const handleDelete = async () => {
    if (report.title === "Untitled Report" && report.description === "No description" && report.tags.length === 0) {
      try {
        await discardEmptyReport(reportId);
        router.push("/reports");
      } catch (error) {
        console.error("Error discarding report:", error);
        router.push("/reports");
      }
    } else {
      setShowDeleteConfirm(true);
    }
  }

  const confirmDelete = async () => {
    try {
      await deleteReport(reportId);
      router.push("/reports");
    } catch (error) {
      console.error("Failed to delete report:", error);
    }
    setShowDeleteConfirm(false);
  }

  const handleEditClick = () => {
    setEditedReport({...report});
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    try {
      await updateReport(reportId, {
        title: editedReport.title,
        description: editedReport.description,
        tags: editedReport.tags
      });
      setReport({...editedReport});
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to update report:", error);
    }
  };

  const addTag = (tag: string) => {
    if (tag && !editedReport.tags.includes(tag)) {
      setEditedReport({...editedReport, tags: [...editedReport.tags, tag]});
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditedReport({
      ...editedReport, 
      tags: editedReport.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleAddNewTag = () => {
    if (newTag.trim() !== "") {
      addTag(newTag.trim());
      setNewTag("");
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-[#121235]">
      <div className="p-6 bg-[#1B1F3F] flex flex-row justify-between">
        <Image src="/logo.png" alt="logo" width={120} height={100} />
        <h1 className="text-white text-2xl text-center mt-2">Report Editor</h1>
        <button 
          onClick={handleDelete}
          className="bg-[#FF5757] w-12 h-12 flex items-center justify-center rounded-lg"
        >
          <FaTrash className="w-5 h-5 text-white" />
        </button>
      </div>

      <div className="p-6 bg-[#1B1F3F] m-4 rounded-lg">
        <div className="flex flex-row justify-between items-start">
          <div>
            <h2 className="text-white text-xl font-bold">{report.title}</h2>
            <p className="text-gray-400 text-sm">Created {lastUpdated}</p>
            <p className="text-gray-400 text-sm">Last updated {lastUpdated}</p>
            {report.tags.length > 0 ? (
              <div className="flex flex-row gap-2 mt-2">
                {report.tags.map((tag, index) => (
                  <span key={index} className="bg-blue-500 text-white px-2 py-1 rounded-md text-xs">
                    {tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No tags added</p>
            )}
          </div>
        </div>

        <hr className="my-4 border-gray-700" />

        <div className="mt-4">
          {report.description ? (
            <p className="text-white">{report.description}</p>
          ) : (
            <p className="text-gray-400 italic">No description yet...</p>
          )}
        </div>
        
        <button 
          className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-md flex items-center gap-2"
          onClick={handleEditClick}
        >
          <FaPen className="w-4 h-4" />
          Edit Report Details
        </button>
      </div>

      <div className="p-6 bg-[#1B1F3F] m-4 rounded-lg">
        <h3 className="text-white text-lg font-bold">Attachments</h3>
        <p className="text-gray-400 text-sm">No attachments added yet.</p>
      </div>

      <div className="mt-auto p-4 flex justify-between">
        <button 
          onClick={handleExit}
          className="bg-[#1B1F3F] text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          Exit
        </button>
        <button 
          className="bg-[#0073E6] text-white px-6 py-3 rounded-lg flex items-center gap-2"
        >
          New Attachment
        </button>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-[#1B1F3F]/80 flex items-center justify-center z-50">
          <div className="bg-[#1B1F3F] p-6 rounded-lg w-full max-w-md">
            <h2 className="text-white text-xl font-bold mb-4">Report Details</h2>
            
            <div className="mb-4">
              <input
                type="text"
                value={editedReport.title}
                onChange={(e) => setEditedReport({...editedReport, title: e.target.value})}
                className="w-full bg-[#2A2E52] text-white p-3 rounded-md"
                placeholder="Case #12345"
              />
            </div>
            
            <div className="mb-4">
              <textarea
                value={editedReport.description}
                onChange={(e) => setEditedReport({...editedReport, description: e.target.value})}
                className="w-full bg-[#2A2E52] text-white p-3 rounded-md min-h-[100px]"
                placeholder="Description"
              />
            </div>
            
         
            <div className="mb-4 flex items-center">
              <div className="bg-[#2A2E52] text-white p-3 rounded-md w-full flex items-center">
                <span className="text-blue-400 mr-2">📍</span>
                <span>todo</span>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  className="flex-grow bg-[#2A2E52] text-white p-2 rounded-md"
                  placeholder="Add New Tag"
                />
                <button 
                  onClick={handleAddNewTag}
                  className="ml-2 bg-blue-500 text-white px-3 py-2 rounded-md"
                >
                  Add
                </button>
              </div>

              <div className="mb-2">
                <p className="text-gray-400 text-sm mb-1">Previously used</p>
                <div className="flex flex-wrap gap-2">
                    { /* todo */ }
                </div>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm mb-1">Tags added</p>
                <div className="flex flex-wrap gap-2">
                  {editedReport.tags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-blue-500 text-white px-2 py-1 rounded-md text-sm">
                      <span>{tag}</span>
                      <button 
                        onClick={() => removeTag(tag)}
                        className="ml-2 text-white"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <button 
                onClick={() => setShowEditModal(false)}
                className="bg-red-500 text-white p-3 rounded-md"
              >
                <FaTrash />
              </button>
              <button 
                onClick={handleSaveEdit}
                className="bg-blue-500 text-white px-6 py-3 rounded-md flex items-center gap-2"
              >
                <span>✓</span> Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-[#1B1F3F]/50 flex items-center justify-center z-50">
          <div className="bg-[#1B1F3F] p-6 rounded-lg text-center">
            <p className="text-white text-lg mb-6">Please confirm deletion.<br />This cannot be undone.</p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-[#0073E6] text-white px-6 py-3 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="bg-[#FF5757] text-white px-6 py-3 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
