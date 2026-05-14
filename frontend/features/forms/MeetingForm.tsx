"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect, FormDatePicker } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { Video, MapPin } from "lucide-react";

const meetingSchema = z.object({
  title: z.string().min(2, "Meeting title is required"),
  client: z.string().min(2, "Client/Lead name is required"),
  type: z.enum(["online", "in-person"]),
  date: z.date(),
  location: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const MeetingForm = ({ onSuccess, onCancel }: MeetingFormProps) => {
  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      client: "",
      type: "online",
      location: "Zoom",
    },
  });

  const onSubmit = async (data: MeetingFormValues) => {
    toast.promise(new Promise(resolve => setTimeout(resolve, 1200)), {
      loading: "Scheduling meeting and sending invitations...",
      success: () => {
        onSuccess?.();
        return "Meeting scheduled successfully! Invitations sent to all attendees.";
      },
      error: "Failed to schedule meeting.",
    });
  };

  const meetingType = form.watch("type");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput 
          name="title" 
          label="Meeting Subject" 
          placeholder="e.g. Q3 Discovery Call" 
        />
        
        <FormInput 
          name="client" 
          label="Lead / Customer" 
          placeholder="Search for a contact..." 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect 
            name="type" 
            label="Meeting Type" 
            options={[
              { label: "Online (Video Call)", value: "online" },
              { label: "In-Person (Physical)", value: "in-person" },
            ]} 
          />
          <FormDatePicker name="date" label="Date & Time" />
        </div>

        <FormInput 
          name="location" 
          label={meetingType === "online" ? "Meeting Link / Platform" : "Office Address / Location"} 
          placeholder={meetingType === "online" ? "Zoom, Google Meet, or Link" : "e.g. 123 Business St, New York"} 
          icon={meetingType === "online" ? <Video className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-32 font-bold bg-amber-500 hover:bg-amber-600">
            Schedule Meeting
          </Button>
        </div>
      </form>
    </Form>
  );
};
