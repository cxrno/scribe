"use client";

import { useState } from "react";
import { FaImage, FaVideo, FaMicrophone, FaPaintBrush, FaFileAlt } from "react-icons/fa";

interface AttachmentTypeSelectorProps {
  onClose: () => void;
  onContinue: (type: string) => void;
}

export default function AttachmentTypeSelector({ onClose, onContinue }: AttachmentTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleTypeSelect = (type: string) => {
    setSelectedType(type);
  };

  const handleContinue = () => {
    if (selectedType) {
      onContinue(selectedType);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#1B1F3F]/90 flex items-center justify-center z-50">
      <div className="bg-[#1B1F3F] p-6 rounded-lg w-full max-w-md">
        <h2 className="text-white text-xl font-bold mb-6 text-center">Select Attachment Type</h2>
        
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button 
            className={`bg-[#2A2E52] p-4 rounded-lg flex flex-col items-center justify-center gap-2 ${selectedType === 'picture' ? 'bg-[#535fb8]' : ''}`}
            onClick={() => handleTypeSelect('picture')}
          >
            <FaImage className="text-white text-2xl" />
            <span className="text-white">Image</span>
          </button>
          
          <button 
            className={`bg-[#2A2E52] p-4 rounded-lg flex flex-col items-center justify-center gap-2 ${selectedType === 'video' ? 'bg-[#535fb8]' : ''}`}
            onClick={() => handleTypeSelect('video')}
          >
            <FaVideo className="text-white text-2xl" />
            <span className="text-white">Video</span>
          </button>
          
          <button 
            className={`bg-[#2A2E52] p-4 rounded-lg flex flex-col items-center justify-center gap-2 ${selectedType === 'audio' ? 'bg-[#535fb8]' : ''}`}
            onClick={() => handleTypeSelect('audio')}
          >
            <FaMicrophone className="text-white text-2xl" />
            <span className="text-white">Audio</span>
          </button>
          
          <button 
            className={`bg-[#2A2E52] p-4 rounded-lg flex flex-col items-center justify-center gap-2 ${selectedType === 'sketch' ? 'bg-[#535fb8]' : ''}`}
            onClick={() => handleTypeSelect('sketch')}
          >
            <FaPaintBrush className="text-white text-2xl" />
            <span className="text-white">Sketch</span>
          </button>
        </div>
        
        <div className="flex justify-center mb-6">
          <button 
            className={`bg-[#2A2E52] p-4 rounded-lg flex flex-col items-center justify-center gap-2 w-1/2 ${selectedType === 'document' ? 'bg-[#535fb8]' : ''}`}
            onClick={() => handleTypeSelect('document')}
          >
            <FaFileAlt className="text-white text-2xl" />
            <span className="text-white">Note</span>
          </button>
        </div>
        
        <div className="flex justify-center gap-4">
          <button 
            onClick={onClose}
            className=" text-white p-3 rounded-full"
          >
            Exit
          </button>
          <button 
            onClick={handleContinue}
            className={`bg-blue-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 ${!selectedType ? 'opacity-50 cursor-not-allowed' : ''}`}
            disabled={!selectedType}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
} 