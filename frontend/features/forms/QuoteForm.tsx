"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect, FormDatePicker } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { useCreateQuotation } from "@/shared/hooks/use-crm";
import { Loader2 } from "lucide-react";

const quoteSchema = z.object({
  client: z.string().min(2, "Client name is required"),
  amount: z.string().min(1, "Amount is required").transform(v => Number(v)),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]),
  validTill: z.date().optional(),
  createdBy: z.string().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const QuoteForm = ({ onSuccess, onCancel }: QuoteFormProps) => {
  const createQuote = useCreateQuotation();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      client: "",
      amount: 0,
      status: "PENDING",
      createdBy: "System",
    },
  });

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      await createQuote.mutateAsync(data);
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput name="client" label="Client/Company Name" placeholder="e.g. Nexus Inc" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput name="amount" label="Quote Amount ($)" placeholder="1250.00" />
          <FormSelect 
            name="status" 
            label="Initial Status" 
            options={[
              { label: "Pending", value: "PENDING" },
              { label: "Approved", value: "APPROVED" },
              { label: "Rejected", value: "REJECTED" },
              { label: "Expired", value: "EXPIRED" },
            ]} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormDatePicker name="validTill" label="Valid Until" />
          <FormInput name="createdBy" label="Created By" placeholder="e.g. Sales Team" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={createQuote.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createQuote.isPending} className="min-w-32">
            {createQuote.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Quote"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
