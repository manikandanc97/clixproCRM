"use client";

import React, { useState, useRef, useCallback } from "react";
import { Video, Square, Loader2 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";

interface VideoRecorderProps {
  onRecord: (file: File) => void;
}

export function VideoRecorder({ onRecord }: VideoRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const startRecording = async () => {
    try {
      setIsStarting(true);
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: false,
      });
      
      streamRef.current = stream;
      
      // Stop recording if the user clicks "Stop sharing" on the browser UI
      stream.getVideoTracks()[0].addEventListener("ended", () => {
        stopRecording();
      });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const file = new File([blob], `recording-${timestamp}.webm`, { type: "video/webm" });
        onRecord(file);
        
        // Clean up stream
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        setIsRecording(false);
        toast.success("Recording saved successfully");
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Failed to start recording:", error);
      toast.error("Failed to start recording. Permission denied.");
    } finally {
      setIsStarting(false);
    }
  };

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  return (
    <Button 
      type="button" 
      variant="outline" 
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isStarting}
      className={`w-full justify-start gap-2 h-10 border-dashed transition-colors ${
        isRecording 
          ? "border-destructive text-destructive hover:bg-destructive/10" 
          : "hover:border-primary hover:text-primary"
      }`}
    >
      {isStarting ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <Square className="w-4 h-4 fill-current" />
      ) : (
        <Video className="w-4 h-4" />
      )}
      {isStarting 
        ? "Starting..." 
        : isRecording 
          ? "Stop Recording" 
          : "Record Screen"
      }
    </Button>
  );
}
