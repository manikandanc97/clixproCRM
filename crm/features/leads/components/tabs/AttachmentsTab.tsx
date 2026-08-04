import React, { useRef } from "react";
import { Button } from "@/shared/ui/button";
import { Paperclip, Download, Trash2, UploadCloud, File, FileText, Image as ImageIcon } from "lucide-react";
import { format } from "date-fns";
import { useLeadAttachments, useCreateLeadAttachment } from "@/shared/hooks/use-crm";
import { formatBytes } from "@/shared/lib/utils";

const getFileIcon = (fileType: string) => {
  if (fileType.includes("image")) return <ImageIcon className="w-8 h-8 text-blue-500" />;
  if (fileType.includes("pdf")) return <FileText className="w-8 h-8 text-rose-500" />;
  return <File className="w-8 h-8 text-muted-foreground" />;
};

export function AttachmentsTab({ leadId }: { leadId: string }) {
  const { data: attachmentsResp, isLoading } = useLeadAttachments(leadId);
  const attachments = attachmentsResp?.data || [];
  
  const createAttachment = useCreateLeadAttachment();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload for now
    const dummyUrl = URL.createObjectURL(file);
    createAttachment.mutate({
      leadId,
      data: {
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        fileUrl: dummyUrl, // In real app, upload to storage first
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-bold text-foreground">Files & Documents</h3>
        <Button onClick={() => fileInputRef.current?.click()} size="sm" className="gap-2" disabled={createAttachment.isPending}>
          <UploadCloud className="w-4 h-4" /> {createAttachment.isPending ? "Uploading..." : "Upload File"}
        </Button>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-12 text-sm text-muted-foreground">Loading attachments...</div>
      ) : attachments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl bg-muted/10">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Paperclip className="w-5 h-5 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold">No Attachments</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
            Upload proposals, contracts, and other related documents.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {attachments.map((attachment: any) => (
            <div key={attachment.id} className="flex items-center gap-4 bg-card border rounded-xl p-4 shadow-sm hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                {getFileIcon(attachment.fileType)}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-foreground truncate">{attachment.fileName}</h4>
                <div className="flex items-center gap-2 text-[10px] font-medium text-muted-foreground mt-1">
                  <span>{formatBytes(attachment.fileSize)}</span>
                  <span>•</span>
                  <span>{format(new Date(attachment.createdAt), "MMM d, yyyy")}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted" asChild>
                  <a href={attachment.fileUrl} target="_blank" rel="noreferrer" download>
                    <Download className="w-4 h-4" />
                  </a>
                </Button>
                {/* Delete would go here */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
