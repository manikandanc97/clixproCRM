"use client";

import React, { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import html2canvas from "html2canvas";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

interface ScreenCaptureProps {
  onCapture: (file: File) => void;
}

export function ScreenCapture({ onCapture }: ScreenCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = async () => {
    try {
      setIsCapturing(true);
      // Wait a moment for any modals to finish animating
      await new Promise((resolve) => setTimeout(resolve, 300));
      
      const canvas = await html2canvas(document.body, {
        useCORS: true,
        allowTaint: true,
        logging: false,
        ignoreElements: (element) => {
          // Ignore elements like the modal itself so it doesn't obscure the CRM screen behind it
          return element.hasAttribute("data-ignore-capture") || element.id === "support-ticket-modal-overlay";
        },
      });

      canvas.toBlob((blob) => {
        if (!blob) {
          toast.error("Failed to capture screen");
          return;
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const file = new File([blob], `screenshot-${timestamp}.png`, { type: "image/png" });
        onCapture(file);
        toast.success("Screen captured successfully");
      }, "image/png");
    } catch (error) {
      console.error("Screen capture failed:", error);
      toast.error("Failed to capture screen");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <Button 
      type="button" 
      variant="outline" 
      onClick={handleCapture}
      disabled={isCapturing}
      className="w-full justify-start gap-2 h-10 border-dashed hover:border-primary hover:text-primary transition-colors"
    >
      {isCapturing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
      {isCapturing ? "Capturing..." : "Capture Current Screen"}
    </Button>
  );
}
