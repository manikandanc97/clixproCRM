"use client";

import React, { useCallback, useState } from "react";
import { UploadCloud, X, File, Image as ImageIcon, Video, FileText, CheckCircle2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Progress } from "@/shared/ui/progress";

export interface FileWithPreview extends File {
  preview?: string;
  id: string;
  progress?: number;
  status?: "uploading" | "success" | "error";
}

interface FileUploaderProps {
  files: FileWithPreview[];
  setFiles: React.Dispatch<React.SetStateAction<FileWithPreview[]>>;
  maxFiles?: number;
  maxSizeMB?: number;
}

export function FileUploader({ files, setFiles, maxFiles = 10, maxSizeMB = 100 }: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);

  const onDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles = Array.from(newFiles).filter((file) => {
      if (file.size > maxSizeMB * 1024 * 1024) {
        alert(`File ${file.name} exceeds ${maxSizeMB}MB`);
        return false;
      }
      return true;
    });

    if (files.length + validFiles.length > maxFiles) {
      alert(`You can only upload a maximum of ${maxFiles} files.`);
      validFiles.splice(maxFiles - files.length);
    }

    const mappedFiles = validFiles.map((file) =>
      Object.assign(file, {
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        id: Math.random().toString(36).substring(7),
        progress: 100, // Simulating instant local "upload"
        status: "success" as const,
      })
    );

    setFiles((prev) => [...prev, ...mappedFiles]);
  }, [files.length, maxFiles, maxSizeMB, setFiles]);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const removeFile = (idToRemove: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === idToRemove);
      if (fileToRemove?.preview) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return prev.filter((f) => f.id !== idToRemove);
    });
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="w-6 h-6 text-blue-500" />;
    if (type.startsWith("video/")) return <Video className="w-6 h-6 text-purple-500" />;
    if (type === "application/pdf") return <FileText className="w-6 h-6 text-red-500" />;
    return <File className="w-6 h-6 text-slate-500" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer group hover:bg-muted/50",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
        )}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          className="hidden"
          onChange={onFileInputChange}
          accept="image/*,video/*,.pdf,.zip"
        />
        <div className="p-4 bg-primary/10 rounded-full mb-3 text-primary group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>
        <h4 className="font-semibold text-sm mb-1">Drag & drop files here</h4>
        <p className="text-xs text-muted-foreground mb-4">
          or click to browse (Max {maxFiles} files, {maxSizeMB}MB each)
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">
          <span className="bg-muted px-2 py-1 rounded-md">Images</span>
          <span className="bg-muted px-2 py-1 rounded-md">Videos</span>
          <span className="bg-muted px-2 py-1 rounded-md">PDF</span>
          <span className="bg-muted px-2 py-1 rounded-md">ZIP</span>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
          {files.map((file) => (
            <div
              key={file.id}
              className="flex items-center p-3 border rounded-lg bg-card shadow-sm gap-3 group relative"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {file.preview ? (
                  <img src={file.preview} alt="preview" className="w-full h-full object-cover" />
                ) : (
                  getFileIcon(file.type)
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{formatSize(file.size)}</span>
                  {file.status === "uploading" && <Progress value={file.progress} className="h-1 flex-1" />}
                  {file.status === "success" && (
                    <span className="text-[10px] text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Uploaded
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(file.id);
                }}
                className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
