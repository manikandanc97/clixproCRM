"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Label } from "@/shared/ui/label";
import { FileUploader, FileWithPreview } from "./FileUploader";
import { ScreenCapture } from "./ScreenCapture";
import { VideoRecorder } from "./VideoRecorder";
import { toast } from "sonner";
import { CheckCircle2, Copy, Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import ReactMarkdown from "react-markdown";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Card, CardContent } from "@/shared/ui/card";

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_FILES = 10;

const ticketSchema = z.object({
  subject: z.string().min(1, "Subject is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  description: z.string().min(30, "Description must be at least 30 characters"),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const CATEGORIES = [
  "Bug Report",
  "Feature Request",
  "UI Issue",
  "Performance Issue",
  "Login / Authentication",
  "Permission Issue",
  "Dashboard Issue",
  "Leads",
  "Customers",
  "Employees",
  "Quotations",
  "Reports",
  "Settings",
  "Integrations",
  "API Issue",
  "Billing",
  "Other",
];

export function SupportTicketForm() {
  const { user } = useAuth();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; time: string } | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
  } = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      priority: "Medium",
    },
  });

  const descriptionValue = watch("description");

  const getDiagnostics = () => {
    return {
      currentUserName: user?.name || "Unknown",
      email: user?.email || "Unknown",
      role: user?.role || "Unknown",
      tenantId: user?.id || "Unknown",
      currentUrl: window.location.href,
      currentPage: window.location.pathname,
      browser: navigator.userAgent,
      operatingSystem: navigator.platform,
      deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      appVersion: "1.0.0",
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    };
  };

  const onSubmit = async (data: TicketFormValues) => {
    if (data.category === "Bug Report" && files.length === 0) {
      toast.warning("It is recommended to attach a screenshot or video for Bug Reports.");
    }

    try {
      setIsSubmitting(true);
      
      const formData = new FormData();
      formData.append("subject", data.subject);
      formData.append("category", data.category);
      formData.append("priority", data.priority);
      formData.append("description", data.description);
      formData.append("diagnostics", JSON.stringify(getDiagnostics()));
      
      files.forEach((file) => {
        formData.append("attachments", file);
      });

      const response = await fetch("/api/support/ticket", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit ticket");
      }

      const result = await response.json();
      setSuccessData({
        id: result.ticketId,
        time: result.estimatedResponseTime || "Within 24 hours",
      });
      toast.success("Ticket submitted successfully");
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the ticket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyTicketId = () => {
    if (successData?.id) {
      navigator.clipboard.writeText(successData.id);
      toast.success("Ticket ID copied to clipboard!");
    }
  };

  const handleCapture = (file: File) => {
    const fileWithPreview = Object.assign(file, {
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substring(7),
      progress: 100,
      status: "success" as const,
    });
    setFiles((prev) => [...prev, fileWithPreview]);
  };

  if (successData) {
    return (
      <Card className="w-full max-w-2xl mx-auto border-dashed">
        <CardContent className="flex flex-col items-center justify-center p-12 text-center space-y-6">
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold">Ticket Submitted Successfully</h3>
            <p className="text-muted-foreground">We have received your request and will get back to you soon.</p>
          </div>
          
          <div className="bg-muted/50 p-6 rounded-2xl w-full border border-border">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-muted-foreground">Ticket ID</span>
              <div className="flex items-center gap-2 bg-background px-3 py-1.5 rounded-lg border">
                <span className="font-mono font-bold text-primary">{successData.id}</span>
                <button onClick={copyTicketId} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Est. Response Time</span>
              <span className="font-medium">{successData.time}</span>
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={() => {
              setSuccessData(null);
              reset();
              setFiles([]);
            }}>
              <Plus className="w-4 h-4 mr-2" /> Create Another Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-0">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input 
                id="subject" 
                placeholder="Brief summary of the issue..." 
                {...register("subject")} 
                className={errors.subject ? "border-destructive" : ""}
              />
              {errors.subject && <span className="text-xs text-destructive">{errors.subject.message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Issue Category *</Label>
              <Controller
                control={control}
                name="category"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.category && <span className="text-xs text-destructive">{errors.category.message}</span>}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low - General query or minor issue</SelectItem>
                      <SelectItem value="Medium">Medium - Feature not working, non-critical</SelectItem>
                      <SelectItem value="High">High - Core functionality impaired</SelectItem>
                      <SelectItem value="Critical">Critical - System down, data loss</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description *</Label>
              <Tabs defaultValue="write" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-[200px] mb-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write" className="mt-0">
                  <Textarea 
                    placeholder="Detailed description of the issue... (Markdown supported)" 
                    className={`min-h-[150px] resize-y ${errors.description ? "border-destructive" : ""}`}
                    {...register("description")}
                  />
                </TabsContent>
                <TabsContent value="preview" className="mt-0 min-h-[150px] p-4 border rounded-md max-w-none text-sm bg-muted/20 overflow-y-auto [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-2 [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-2 [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ul]:mb-2 [&>ol]:list-decimal [&>ol]:ml-4 [&>ol]:mb-2 [&>p]:mb-2 [&>a]:text-primary [&>a]:underline [&>blockquote]:border-l-4 [&>blockquote]:border-muted-foreground [&>blockquote]:pl-4 [&>blockquote]:italic">
                  {descriptionValue ? (
                    <ReactMarkdown>{descriptionValue}</ReactMarkdown>
                  ) : (
                    <span className="text-muted-foreground italic">Nothing to preview...</span>
                  )}
                </TabsContent>
              </Tabs>
              {errors.description && <span className="text-xs text-destructive">{errors.description.message}</span>}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium">Attachments</h3>
              <p className="text-sm text-muted-foreground">Upload screenshots, videos, or logs to help us resolve the issue faster.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ScreenCapture onCapture={handleCapture} />
              <VideoRecorder onRecord={handleCapture} />
            </div>
            
            <FileUploader 
              files={files} 
              setFiles={setFiles} 
              maxFiles={MAX_FILES} 
              maxSizeMB={MAX_FILE_SIZE / (1024 * 1024)} 
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-8">
            <Button type="button" variant="outline" onClick={() => { reset(); setFiles([]); }} disabled={isSubmitting}>
              Clear
            </Button>
            <Button type="submit" disabled={isSubmitting} className="min-w-[120px]">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                </>
              ) : (
                "Submit Ticket"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
