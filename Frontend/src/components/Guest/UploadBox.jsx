import React from "react";
import { FileText, Image } from "lucide-react";

const UploadBox = ({
  dragActive,
  handleDrag,
  handleDrop,
  fileInputRef,
  selectedFiles,
  handleFileSelect,
  verifying,
  getFileIcon,
}) => {
  return (
    <div
      className={`rounded-2xl border-2 p-5 flex flex-col items-center justify-start transition-colors cursor-pointer ${
        dragActive
          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/30"
          : "border-gray-300 bg-white/80 dark:border-gray-700 dark:bg-black/40"
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />
      <div className="flex flex-col items-center justify-center gap-2 mb-4">
        <p className="text-gray-800 dark:text-gray-300 text-center">
          Drag & Drop your certificates here <br />
          or click to select files
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-400">
          (Supports up to 10 files)
        </p>
      </div>
      {selectedFiles.length > 0 && (
        <div
          // 💡 SCROLLBAR STYLING IS HERE 💡
          className="w-full max-h-40 overflow-y-auto flex flex-col gap-2 mb-4  
                     [&::-webkit-scrollbar]:w-2
                     [&::-webkit-scrollbar-thumb]:bg-black/50 
                     [&::-webkit-scrollbar-thumb]:rounded-full 
                     [&::-webkit-scrollbar-track]:bg-gray-200 
                     dark:[&::-webkit-scrollbar-track]:bg-slate-900 
                     dark:[&::-webkit-scrollbar-thumb]:bg-white/50"
        >
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 p-2 rounded-md bg-gray-100 dark:bg-slate-950 w-full"
            >
              {getFileIcon(file.name)}
              <span className="text-sm text-gray-800 dark:text-gray-200 truncate">
                {file.name}
              </span>
            </div>
          ))}
        </div>
      )}
      {verifying && (
        <p className="mt-2 text-blue-500 dark:text-blue-400 font-medium">
          Processing...
        </p>
      )}
    </div>
  );
};

export default UploadBox;