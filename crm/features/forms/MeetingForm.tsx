"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect, FormDatePicker, FormTextarea } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const meetingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.date(),
  time: z.string().min(1, "Time is required"),
  duration: z.string().min(1, "Duration is required"),
  location: z.string().optional(),
  attendees: z.string().optional(),
  notes: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultLeadId?: string;
}

export const MeetingForm = ({ onSuccess, onCancel }: MeetingFormProps) => {
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      time: "10:00 AM",
      duration: "30",
      location: "",
      attendees: "",
      notes: "",
    },
  });

  const onSubmit = async (data: MeetingFormValues) => {
    try {
      // For now, simulate a backend request
      await new Promise(resolve => setTimeout(resolve, 800));
      console.log("Scheduling meeting:", data);
      toast.success("Meeting scheduled successfully");
      onSuccess?.();
    } catch (_error) {
      toast.error("Failed to schedule meeting");
    }
  };

  const isPending = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput name="title" label="Meeting Title" placeholder="e.g. Discovery Call" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormDatePicker name="date" label="Date" />
          <FormInput name="time" label="Time (e.g., 10:00 AM)" placeholder="10:00 AM" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect 
            name="duration" 
            label="Duration" 
            options={[
              { label: "15 Minutes", value: "15" },
              { label: "30 Minutes", value: "30" },
              { label: "45 Minutes", value: "45" },
              { label: "1 Hour", value: "60" },
              { label: "90 Minutes", value: "90" },
            ]} 
          />
          <FormInput name="location" label="Location (Link or Address)" placeholder="Zoom / Office" />
        </div>

        <FormInput name="attendees" label="Attendees (Emails)" placeholder="john@example.com, jane@example.com" />
        
        <FormTextarea name="notes" label="Notes" placeholder="Agenda or any additional details..." />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-32">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scheduling...
              </>
            ) : (
              "Schedule Meeting"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
