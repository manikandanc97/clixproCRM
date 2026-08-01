"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect, FormDatePicker } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { useCreateLead, useUpdateLead } from "@/shared/hooks/use-crm";
import { Loader2 } from "lucide-react";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  status: z.enum(["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"]),
  value: z.string().optional(),
  followUpAt: z.date().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  initialData?: import("@/shared/types/lead").LeadType;
  initialStage?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LeadForm = ({ initialData, initialStage, onSuccess, onCancel }: LeadFormProps) => {
  const { mutateAsync: createMutate, isPending: isCreating } = useCreateLead();
  const { mutateAsync: updateMutate, isPending: isUpdating } = useUpdateLead();

  const isPending = isCreating || isUpdating;

  const stageToStatus: Record<string, string> = {
    "New Lead": "NEW",
    "Contacted": "CONTACTED",
    "Proposal Sent": "PROPOSAL_SENT",
    "Won": "WON",
    "Lost": "LOST",
  };

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: initialData?.name || "",
      company: initialData?.company || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      status: initialData?.status 
        ? (Object.values(stageToStatus).includes(initialData.status) ? initialData.status as any : "NEW") 
        : ((initialStage && stageToStatus[initialStage]) ? stageToStatus[initialStage] as LeadFormValues['status'] : "NEW"),
      value: initialData?.value?.replace(/[^0-9.]/g, '') || "",
      followUpAt: initialData?.followUpAt ? new Date(initialData.followUpAt) : undefined,
    },
  });

  const onSubmit = async (data: LeadFormValues) => {
    try {
      let formattedPhone = data.phone;
      if (formattedPhone && formattedPhone.trim() !== '' && !formattedPhone.trim().startsWith('+')) {
        formattedPhone = `+91 ${formattedPhone.trim()}`;
      }

      if (initialData) {
        await updateMutate({
          id: initialData.id,
          data: {
            name: data.name,
            company: data.company,
            email: data.email,
            phone: formattedPhone,
            status: data.status,
            value: data.value ? data.value.replace(/[^0-9.]/g, '') : "0",
            followUpAt: data.followUpAt ? data.followUpAt.toISOString() : null,
          }
        });
      } else {
        await createMutate({
          name: data.name,
          company: data.company,
          email: data.email,
          phone: formattedPhone,
          status: data.status,
          value: data.value ? data.value.replace(/[^0-9.]/g, '') : "0",
          followUpAt: data.followUpAt ? data.followUpAt.toISOString() : null,
        });
      }
      onSuccess?.();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Error handled by hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput name="name" label="Full Name" placeholder="e.g. John Doe" />
          <FormInput name="company" label="Company" placeholder="e.g. Acme Corp" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput name="email" label="Email Address" placeholder="john@example.com" />
          <FormInput name="phone" label="Phone Number" placeholder="+91 98765 43210" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect 
            name="status" 
            label="Status" 
            options={[
              { label: "New Lead", value: "NEW" },
              { label: "Contacted", value: "CONTACTED" },
              { label: "Proposal Sent", value: "PROPOSAL_SENT" },
              { label: "Won", value: "WON" },
              { label: "Lost", value: "LOST" },
            ]} 
          />
          <FormInput name="value" label="Estimated Value ($)" placeholder="5000" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormDatePicker name="followUpAt" label="Follow-up Date" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-32">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {initialData ? "Updating..." : "Creating..."}
              </>
            ) : (
              initialData ? "Update Lead" : "Create Lead"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
