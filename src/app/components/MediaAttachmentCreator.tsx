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
  const [isDefaultTitle, setIsDefaultTitle] = useState(true);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState(existingAttachment?.description || "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingAttachment?.media_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(!!existingAttachment);
  const [location, setLocation] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEraser, setIsEraser] = useState(false);
  const [strokeColor, setStrokeColor] = useState("#000000");
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const backgroundInputRef = useRef<HTMLInputElement>(null);
  const [canvasAspectRatio, setCanvasAspectRatio] = useState<number>(16/9); // Default aspect ratio
  const [canvasHeight, setCanvasHeight] = useState<number>(264); // Default height

  const isEditing = !!existingAttachment;

  useEffect(() => {
    setTitle(getDefaultTitle());
  }, [existingAttachment, mediaType]);

  function getDefaultTitle() {
    if (existingAttachment?.title) {
      setIsDefaultTitle(false);
      return existingAttachment.title;
    }
    
    setIsDefaultTitle(true);
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
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude},${longitude}`);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, [existingAttachment]);

  useEffect(() => {
    if (existingAttachment && existingAttachment.media_url) {
      // Load the image to get its dimensions
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setCanvasAspectRatio(aspectRatio);
      };
      img.src = existingAttachment.media_url;
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
  
  const triggerBackgroundInput = () => {
    if (backgroundInputRef.current) {
      backgroundInputRef.current.click();
    }
  };

  const handleBackgroundSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const dataUrl = e.target.result as string;
          setBackgroundImage(dataUrl);
          
          // Create an image element to get dimensions
          const img = new window.Image();
          img.onload = () => {
            const aspectRatio = img.width / img.height;
            setCanvasAspectRatio(aspectRatio);
          };
          img.src = dataUrl;
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExportSketch = async () => {
    if (!canvasRef.current) return null;
    
    try {
      const imageData = await canvasRef.current.exportImage("png");
      setPreviewUrl(imageData);
      
      // Preserve the aspect ratio when exporting
      const img = new window.Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        setCanvasAspectRatio(aspectRatio);
      };
      img.src = imageData;
      
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

  const clearBackground = () => {
    setBackgroundImage(null);
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
        description,
        location || undefined
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
      description,
      location || undefined
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
          <div 
            className="relative w-full bg-[#2A2E52] rounded-lg overflow-hidden mb-2 flex justify-center"
            style={{ 
              height: canvasHeight,
              maxHeight: '300px'
            }}
          >
            <div style={{ 
              width: `${canvasHeight * canvasAspectRatio}px`,
              height: canvasHeight,
              maxWidth: '100%',
              position: 'relative'
            }}>
              <Image 
                src={previewUrl} 
                alt="Sketch preview" 
                fill 
                style={{ objectFit: 'contain' }} 
              />
            </div>
          </div>
        ) : (
          <div 
            className="w-full bg-[#2A2E52] rounded-lg mb-2 flex justify-center"
            style={{ 
              height: canvasHeight,
              maxHeight: '300px'
            }}
          >
            <div style={{ 
              width: backgroundImage ? `${canvasHeight * canvasAspectRatio}px` : '100%',
              height: canvasHeight,
              maxWidth: '100%'
            }}>
              <ReactSketchCanvas
                ref={canvasRef}
                width="100%"
                height="100%"
                strokeWidth={4}
                strokeColor={strokeColor}
                backgroundImage={backgroundImage || ""}
                exportWithBackgroundImage={true}
                style={{
                  border: "0.0625rem solid #9c9c9c",
                  borderRadius: "0.25rem",
                }}
              />
            </div>
          </div>
        )}
        
        {!previewUrl ? (
          <div className="flex flex-col gap-2 max-w-md mx-auto w-full">
            <div className="flex justify-center gap-2 mb-1">
              <input
                type="file"
                ref={backgroundInputRef}
                onChange={handleBackgroundSelect}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              
              <button 
                onClick={triggerBackgroundInput}
                className="bg-gray-600 text-white py-2 px-3 rounded-md flex items-center gap-1 flex-1 justify-center"
              >
                <FaImage size={14} /> {backgroundImage ? "Change Photo" : "Add Photo"}
              </button>
              
              {backgroundImage && (
                <button 
                  onClick={clearBackground}
                  className="bg-red-500 text-white py-2 px-3 rounded-md flex items-center gap-1"
                >
                  <FaTrash size={14} /> Remove
                </button>
              )}
            </div>
            
            <div className="flex justify-center gap-2 mb-1">
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
                <FaUndo size={14} />
              </button>
              <button 
                onClick={handleRedoCanvas}
                className="bg-gray-600 text-white py-2 px-3 rounded-md flex items-center gap-1"
              >
                <FaRedo size={14} />
              </button>
              <button 
                onClick={handleToggleEraser}
                className={`${isEraser ? 'bg-red-500' : 'bg-gray-600'} text-white py-2 px-3 rounded-md flex items-center gap-1`}
              >
                {isEraser ? <FaPencilAlt size={14} /> : <FaEraser size={14} />}
              </button>
              <div className="flex items-center bg-gray-600 text-white py-1 px-3 rounded-md">
                <input 
                  type="color" 
                  value={strokeColor} 
                  onChange={handleColorChange}
                  className="w-6 h-6 cursor-pointer"
                  aria-label="Select color"
                />
              </div>
            </div>
            
            <div className="flex justify-center">
              <button 
                onClick={handleExportSketch}
                className="bg-blue-500 text-white py-2 px-4 rounded-md flex items-center gap-1 w-full justify-center"
              >
                <FaCheck size={14} /> Save Sketch
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-2 max-w-md mx-auto">
            <button 
              onClick={() => setPreviewUrl(null)}
              className="bg-blue-500 text-white py-2 px-3 rounded-md flex items-center gap-1"
            >
              <FaPencilAlt size={14} /> New Sketch
            </button>
            <button 
              onClick={() => {
                setBackgroundImage(previewUrl);
                setPreviewUrl(null);
              }}
              className="bg-green-500 text-white py-2 px-3 rounded-md flex items-center gap-1"
            >
              <FaPencilAlt size={14} /> Edit This Sketch
            </button>
          </div>
        )}
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

  const handleTitleFocus = () => {
    if (isDefaultTitle) {
      setTitle("");
      setIsDefaultTitle(false);
    }
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
      <div className="p-3 bg-[#2A2E52] flex items-center justify-center">
        <h2 className="text-white text-lg font-bold">
          {isEditing ? `Edit ${getMediaTypeLabel()}` : `New ${getMediaTypeLabel()}`}
        </h2>
      </div>
      
      <div className="p-3 flex-1 flex flex-col overflow-y-auto">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            setIsDefaultTitle(false);
          }}
          onFocus={handleTitleFocus}
          className="w-full bg-[#2A2E52] text-white p-2 rounded-md mb-3 text-sm"
          placeholder="Title"
        />
        
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-[#2A2E52] text-white p-2 rounded-md mb-3 h-24 text-sm"
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
      
      <div className="p-3 flex justify-center gap-2 bg-[#2A2E52]">
        <button 
          onClick={onClose}
          className="text-white p-2 rounded-full text-sm"
        >
          Exit
        </button>
        <button 
          onClick={handleComplete}
          disabled={(isEditing ? false : (!selectedFile && mediaType !== 'sketch' && mediaType !== 'document')) || isUploading}
          className={`bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-1 text-sm ${((isEditing ? false : (!selectedFile && mediaType !== 'sketch' && mediaType !== 'document')) || isUploading) ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          <FaCheck className="w-3 h-3" />
          Complete
        </button>
      </div>
    </div>
  );
} 