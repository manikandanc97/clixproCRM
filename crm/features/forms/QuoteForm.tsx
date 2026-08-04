"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect, FormDatePicker } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { FormSubmitButton } from "@/shared/components/form-submit-button";
import { useDirtyForm } from "@/shared/hooks/use-dirty-form";
import { useCreateQuotation } from "@/shared/hooks/use-crm";
import { Loader2 } from "lucide-react";
import { useCurrency } from "@/shared/hooks/use-currency";

const quoteSchema = z.object({
  client: z.string().min(2, "Client name is required"),
  amount: z.string().min(1, "Amount is required"),
  status: z.enum(["PENDING", "APPROVED", "REJECTED", "EXPIRED"]),
  validTill: z.date().optional(),
});

type QuoteFormValues = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const QuoteForm = ({ onSuccess, onCancel }: QuoteFormProps) => {
  const createQuote = useCreateQuotation();
  const { currencySymbol } = useCurrency();

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      client: "",
      amount: "",
      status: "PENDING",
    },
  });

  const { isDirty, resetDirty } = useDirtyForm(form, form.formState.defaultValues);

  const onSubmit = async (data: QuoteFormValues) => {
    try {
      await createQuote.mutateAsync({
        client: data.client,
        amount: data.amount,
        status: data.status,
        validTill: data.validTill ? data.validTill.toISOString() : undefined,
      });
      resetDirty(form.getValues());
      onSuccess?.();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      // Error handled by hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput name="client" label="Client/Company Name" placeholder="e.g. Nexus Inc" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput name="amount" label={`Quote Amount (${currencySymbol})`} placeholder="1250.00" />
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
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={createQuote.isPending}>
            Cancel
          </Button>
          <FormSubmitButton
            isDirty={isDirty}
            isPending={createQuote.isPending}
            loadingText="Generating..."
          >
            Generate Quote
          </FormSubmitButton>
        </div>
      </form>
    </Form>
  );
};
