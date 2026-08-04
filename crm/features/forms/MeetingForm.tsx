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
import { useCreateMeeting } from "@/shared/hooks/use-crm";

const meetingSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  date: z.date(),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  defaultLeadId?: string;
  defaultTaskId?: string;
}

export const MeetingForm = ({ onSuccess, onCancel, defaultLeadId, defaultTaskId }: MeetingFormProps) => {
  const { mutate: createMeeting, isPending } = useCreateMeeting();

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      time: "10:00 AM",
      notes: "",
    },
  });

  const onSubmit = (data: MeetingFormValues) => {
    // Combine date and time into a single Date object for startTime
    const [hours, minutesAndPeriod] = data.time.split(":");
    const [minutes, period] = minutesAndPeriod.split(" ");
    let hoursInt = parseInt(hours);
    if (period === "PM" && hoursInt !== 12) hoursInt += 12;
    if (period === "AM" && hoursInt === 12) hoursInt = 0;
    
    const startTime = new Date(data.date);
    startTime.setHours(hoursInt, parseInt(minutes), 0, 0);
    
    // Hardcode duration to 30 mins
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + 30);

    createMeeting({
      title: data.title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      location: null,
      type: "MEETING",
      description: data.notes,
      leadId: defaultLeadId,
      taskId: defaultTaskId,
    }, {
      onSuccess: () => {
        onSuccess?.();
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput name="title" label="Meeting Title" placeholder="e.g. Discovery Call" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormDatePicker name="date" label="Date" />
          <FormInput name="time" label="Time (e.g., 10:00 AM)" placeholder="10:00 AM" />
        </div>
        
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
