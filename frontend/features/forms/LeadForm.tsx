"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect, FormDatePicker } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { useCreateLead } from "@/shared/hooks/use-crm";
import { Loader2 } from "lucide-react";

const leadSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  status: z.enum(["NEW", "CONTACTED", "PROPOSAL_SENT", "WON", "LOST"]),
  value: z.string().optional().transform(v => v ? Number(v) : 0),
  followUpAt: z.date().optional(),
  assignedTo: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const LeadForm = ({ onSuccess, onCancel }: LeadFormProps) => {
  const createLead = useCreateLead();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      status: "NEW",
      value: 0,
      assignedTo: "Unassigned",
    },
  });

  const onSubmit = async (data: LeadFormValues) => {
    try {
      await createLead.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
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
        
        <FormInput name="email" label="Email Address" placeholder="john@example.com" />
        
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
          <FormInput name="assignedTo" label="Assign To" placeholder="e.g. Jane Smith" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={createLead.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createLead.isPending} className="min-w-32">
            {createLead.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Lead"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
