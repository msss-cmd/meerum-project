import React, { useCallback } from 'react';
import { UploadCloud, FileText } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (isProcessing) return;
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type === 'application/pdf') {
          onFileSelect(file);
        } else {
          alert("Please upload a PDF file.");
        }
      }
    },
    [onFileSelect, isProcessing]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${
        isProcessing
          ? 'border-slate-300 bg-slate-50 cursor-wait opacity-50'
          : 'border-indigo-300 bg-white hover:bg-indigo-50 hover:border-indigo-500 cursor-pointer shadow-sm hover:shadow-md'
      }`}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        className="hidden"
        id="pdf-upload"
        disabled={isProcessing}
      />
      <label htmlFor="pdf-upload" className="flex flex-col items-center justify-center cursor-pointer w-full h-full">
        <div className="bg-indigo-100 p-4 rounded-full mb-4">
          {isProcessing ? (
             <FileText className="w-8 h-8 text-indigo-600 animate-pulse" />
          ) : (
             <UploadCloud className="w-8 h-8 text-indigo-600" />
          )}
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          {isProcessing ? 'Processing Paper...' : 'Upload Research Paper'}
        </h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          {isProcessing 
            ? 'We are extracting text and analyzing content. This may take a moment.' 
            : 'Drag & drop your PDF here, or click to browse.'}
        </p>
      </label>
    </div>
  );
};

export default FileUpload;