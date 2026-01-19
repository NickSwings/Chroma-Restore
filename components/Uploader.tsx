import React, { useCallback, useState } from 'react';
import { UploadIcon } from './Icons';

interface UploaderProps {
  onFileSelect: (file: File) => void;
}

const Uploader: React.FC<UploaderProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`relative group cursor-pointer border-2 border-dashed rounded-2xl transition-all duration-300 ease-out 
      ${isDragging 
        ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' 
        : 'border-slate-700 hover:border-indigo-400 hover:bg-slate-800/50 bg-slate-800/20'
      } flex flex-col items-center justify-center p-12 h-80`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        type="file"
        id="fileInput"
        className="hidden"
        accept="image/*"
        onChange={handleFileInput}
      />
      
      <div className={`p-4 rounded-full mb-4 transition-colors duration-300 ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-slate-400 group-hover:text-indigo-400 group-hover:bg-indigo-500/20'}`}>
        <UploadIcon className="w-10 h-10" />
      </div>

      <h3 className="text-xl font-semibold text-slate-200 mb-2">Upload Photo</h3>
      <p className="text-slate-400 text-center max-w-sm">
        Drag & drop your black and white photo here, or <span className="text-indigo-400 underline decoration-indigo-400/30 underline-offset-4 group-hover:decoration-indigo-400 transition-all">browse files</span>
      </p>
      <p className="text-slate-500 text-xs mt-4">Supports JPG, PNG, WEBP (Max 10MB)</p>
    </div>
  );
};

export default Uploader;
