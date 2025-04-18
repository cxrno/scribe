"use client";

import { useState, useRef, useEffect } from "react";
import { FaImage, FaVideo, FaCheck, FaPencilAlt, FaEraser, FaUndo, FaRedo, FaTrash, FaFileAlt, FaMusic } from "react-icons/fa";
import { createAttachment, updateAttachmentInfo, addAttachmentMedia, getAttachment, removeAttachmentMedia } from "@/services/attachmentService";
import Image from "next/image";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

interface MediaAttachmentCreatorProps {
  reportId: string;
  onClose: () => void;
  onComplete: () => void;
  existingAttachment?: any;
  mediaType: 'picture' | 'video' | 'sketch' | 'document' | 'audio';
}

export default function MediaAttachmentCreator({ 
  reportId, 
  onClose, 
  onComplete,
  existingAttachment,
  mediaType
}: MediaAttachmentCreatorProps) {
  const [title, setTitle] = useState(getDefaultTitle());
  const [description, setDescription] = useState(existingAttachment?.description || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingAttachment?.media_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(!!existingAttachment);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEraser, setIsEraser] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  
  const isEditing = !!existingAttachment;

  function getDefaultTitle() {
    if (existingAttachment?.title) return existingAttachment.title;
    
    switch (mediaType) {
      case 'picture': return 'New Image';
      case 'video': return 'New Video';
      case 'sketch': return 'New Sketch';
      case 'document': return 'New Document';
      case 'audio': return 'New Audio';
      default: return 'New Attachment';
    }
  }

  function getMediaTypeLabel() {
    switch (mediaType) {
      case 'picture': return 'Image';
      case 'video': return 'Video';
      case 'sketch': return 'Sketch';
      case 'document': return 'Document';
      case 'audio': return 'Audio';
      default: return 'Attachment';
    }
  }

  useEffect(() => {
    if (existingAttachment) {
      fetchAttachmentDetails();
    }
  }, [existingAttachment]);

  const fetchAttachmentDetails = async () => {
    if (!existingAttachment) return;
    
    try {
      setIsLoading(true);
      const attachmentData = await getAttachment(existingAttachment.id);
      if (attachmentData) {
        setTitle(attachmentData.title || "");
        setDescription(attachmentData.description || "");
        setPreviewUrl(attachmentData.media_url);
      }
    } catch (error) {
      console.error("Error fetching attachment details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      createFilePreview(file);
    }
  };

  const createFilePreview = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setPreviewUrl(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleClearCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  };
  
  const handleUndoCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.undo();
    }
  };
  
  const handleRedoCanvas = () => {
    if (canvasRef.current) {
      canvasRef.current.redo();
    }
  };
  
  const handleToggleEraser = () => {
    if (canvasRef.current) {
      const newEraserMode = !isEraser;
      canvasRef.current.eraseMode(newEraserMode);
      setIsEraser(newEraserMode);
    }
  };
  
  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setStrokeColor(newColor);
  };
  
  const handleExportSketch = async () => {
    if (!canvasRef.current) return null;
    
    try {
      const imageData = await canvasRef.current.exportImage("png");
      setPreviewUrl(imageData);
      
      const res = await fetch(imageData);
      const blob = await res.blob();
      const file = new File([blob], "sketch.png", { type: "image/png" });
      setSelectedFile(file);
      return file;
    } catch (error) {
      console.error("Error exporting sketch:", error);
      return null;
    }
  };

  const handleComplete = async () => {
    try {
      setIsUploading(true);
      
      if (mediaType === 'sketch' && !selectedFile && canvasRef.current) {
        const sketchFile = await handleExportSketch();
        if (!sketchFile) return;
      }
      
      if (isEditing) {
        await updateExistingAttachment();
      } else {
        await createNewAttachment();
      }
      
      onComplete();
    } catch (error) {
      console.error("Error with attachment:", error);
      alert(`Failed to save ${getMediaTypeLabel().toLowerCase()}. Please try again.`);
    } finally {
      setIsUploading(false);
    }
  };

  const updateExistingAttachment = async () => {
    if (!existingAttachment) return;
    
    await updateAttachmentInfo(
      existingAttachment.id,
      title,
      description
    );
    
    if (selectedFile && mediaType !== 'document') {
      await removeAttachmentMedia(existingAttachment.id);
      await addAttachmentMedia(existingAttachment.id, selectedFile);
    }
  };

  const createNewAttachment = async () => {
    if (mediaType === 'document') {
      await createAttachment(
        reportId,
        null,
        mediaType,
        title,
        description
      );
      return;
    }
    
    if (!selectedFile && mediaType !== 'sketch') return;
    
    if (mediaType === 'sketch' && !selectedFile && canvasRef.current) {
      const sketchFile = await handleExportSketch();
      if (!sketchFile) return;
    }
    
    if (!selectedFile) return;
    
    await createAttachment(
      reportId,
      selectedFile,
      mediaType,
      title,
      description
    );
  };

  const renderDocumentEditor = () => {
    return (
        <div> </div>
    );
  };

  const renderAudioSelector = () => {
    return (
      <>
        <div className="flex justify-center items-center mb-4">
          {previewUrl ? (
            <div className="w-full h-64 bg-[#2A2E52] rounded-lg flex items-center justify-center">
              <audio 
                src={previewUrl} 
                controls
                className="w-3/4" 
              />
            </div>
          ) : (
            <div className="w-full h-64 bg-[#2A2E52] rounded-lg flex items-center justify-center">
              <FaMusic className="text-white text-4xl opacity-50" />
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept="audio/*"
          className="hidden"
        />
        
        <button
          onClick={triggerFileInput}
          className="bg-gray-500 text-white py-2 px-4 rounded-md w-full mb-4"
        >
          {isEditing ? `Attach New ${getMediaTypeLabel()}` : `Attach ${getMediaTypeLabel()} File`}
        </button>
      </>
    );
  };

  const renderSketchEditor = () => {
    return (
      <div className="flex flex-col mb-4">
        {previewUrl ? (
          <div className="relative w-full h-64 bg-[#2A2E52] rounded-lg overflow-hidden mb-2">
            <Image 
              src={previewUrl} 
              alt="Sketch preview" 
              fill 
              style={{ objectFit: 'contain' }} 
            />
          </div>
        ) : (
          <div className="w-full h-64 bg-[#2A2E52] rounded-lg mb-2">
            <ReactSketchCanvas
              ref={canvasRef}
              width="100%"
              height="100%"
              strokeWidth={4}
              strokeColor={strokeColor}
              backgroundImage=""
              exportWithBackgroundImage={false}
              style={{
                border: "0.0625rem solid #9c9c9c",
                borderRadius: "0.25rem",
              }}
            />
          </div>
        )}
        
        <div className="flex flex-wrap gap-2 justify-center">
          {!previewUrl ? (
            <>
              <button 
                onClick={handleClearCanvas}
                className="bg-gray-600 text-white py-2 px-3 rounded-md flex items-center gap-1"
              >
                <FaTrash size={14} /> Clear
              </button>
              <button 
                onClick={handleUndoCanvas}
                className="bg-gray-600 text-white py-2 px-3 rounded-md flex items-center gap-1"
              >
                <FaUndo size={14} /> Undo
              </button>
              <button 
                onClick={handleRedoCanvas}
                className="bg-gray-600 text-white py-2 px-3 rounded-md flex items-center gap-1"
              >
                <FaRedo size={14} /> Redo
              </button>
              <button 
                onClick={handleToggleEraser}
                className={`${isEraser ? 'bg-red-500' : 'bg-gray-600'} text-white py-2 px-3 rounded-md flex items-center gap-1`}
              >
                {isEraser ? <FaPencilAlt size={14} /> : <FaEraser size={14} />} 
                {isEraser ? "Use Pen" : "Use Eraser"}
              </button>
              <div className="flex items-center bg-gray-600 text-white py-1 px-3 rounded-md">
                <label htmlFor="colorPicker" className="mr-2">Color:</label>
                <input 
                  id="colorPicker"
                  type="color" 
                  value={strokeColor} 
                  onChange={handleColorChange}
                  className="w-6 h-6 cursor-pointer"
                />
              </div>
              <button 
                onClick={handleExportSketch}
                className="bg-blue-500 text-white py-2 px-3 rounded-md"
              >
                Save Sketch
              </button>
            </>
          ) : (
            <button 
              onClick={() => setPreviewUrl(null)}
              className="bg-blue-500 text-white py-2 px-3 rounded-md"
            >
              New Sketch
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderMediaSelector = () => {
    return (
      <>
        <div className="flex justify-center items-center mb-4">
          {previewUrl ? (
            <div className="relative w-full h-64 bg-[#2A2E52] rounded-lg overflow-hidden">
              {mediaType === 'picture' ? (
                <Image 
                  src={previewUrl} 
                  alt="Selected image" 
                  fill 
                  style={{ objectFit: 'contain' }} 
                />
              ) : (
                <video 
                  src={previewUrl} 
                  controls
                  className="w-full h-full object-contain" 
                />
              )}
            </div>
          ) : (
            <div className="w-full h-64 bg-[#2A2E52] rounded-lg flex items-center justify-center">
              {mediaType === 'picture' ? (
                <FaImage className="text-white text-4xl opacity-50" />
              ) : (
                <FaVideo className="text-white text-4xl opacity-50" />
              )}
            </div>
          )}
        </div>
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          accept={mediaType === 'picture' ? "image/*" : "video/*"}
          capture={mediaType === 'video' ? "environment" : undefined}
          className="hidden"
        />
        
        <button
          onClick={triggerFileInput}
          className="bg-gray-500 text-white py-2 px-4 rounded-md w-full mb-4"
        >
          {isEditing ? `Attach New ${getMediaTypeLabel()}` : `Attach ${getMediaTypeLabel()}`}
        </button>
      </>
    );
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#1B1F3F] flex items-center justify-center z-50">
        <div className="text-white text-xl">Loading attachment details...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[#1B1F3F] flex flex-col z-50">
      <div className="p-4 bg-[#2A2E52] flex items-center justify-center">
        <h2 className="text-white text-xl font-bold">
          {isEditing ? `Edit ${getMediaTypeLabel()}` : `New ${getMediaTypeLabel()}`}
        </h2>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-[#2A2E52] text-white p-3 rounded-md mb-4"
          placeholder="Title"
        />
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#2A2E52] text-white p-3 rounded-md mb-4 h-40"
          placeholder={`Description (e.g., ${getMediaTypeLabel()} of vehicle damage)`}
        />
        
        {mediaType === 'document' 
          ? renderDocumentEditor() 
          : mediaType === 'sketch' 
            ? renderSketchEditor() 
            : mediaType === 'audio'
              ? renderAudioSelector()
              : renderMediaSelector()}
      </div>
      
      <div className="p-4 flex justify-center gap-2 bg-[#2A2E52]">
        <button 
          onClick={onClose}
          className="text-white p-3 rounded-full"
        >
          Exit
        </button>
        <button 
          onClick={handleComplete}
          disabled={(isEditing ? false : (!selectedFile && mediaType !== 'sketch' && mediaType !== 'document')) || isUploading}
          className={`bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 ${((isEditing ? false : (!selectedFile && mediaType !== 'sketch' && mediaType !== 'document')) || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaCheck />
          Complete
        </button>
      </div>
    </div>
  );
} 