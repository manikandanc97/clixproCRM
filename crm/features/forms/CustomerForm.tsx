"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { useCreateCustomer, useUpdateCustomer } from "@/shared/hooks/use-crm";
import { Loader2 } from "lucide-react";
import { CustomerType } from "@/shared/types/customer";
import { useCurrency } from "@/shared/hooks/use-currency";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "PREMIUM", "INACTIVE"]),
  revenue: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  initialData?: CustomerType;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CustomerForm = ({ initialData, onSuccess, onCancel }: CustomerFormProps) => {
  const { mutateAsync: createMutate, isPending: isCreating } = useCreateCustomer();
  const { mutateAsync: updateMutate, isPending: isUpdating } = useUpdateCustomer();
  const { currencySymbol } = useCurrency();

  const isPending = isCreating || isUpdating;

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialData?.name || "",
      company: initialData?.company || "",
      email: initialData?.email || "",
      status: (initialData?.status?.toUpperCase() as "ACTIVE" | "PREMIUM" | "INACTIVE") || "ACTIVE",
      revenue: initialData?.revenueValue?.toString() || "",
    },
  });

  const onSubmit: SubmitHandler<CustomerFormValues> = async (data) => {
    try {
      if (initialData) {
        await updateMutate({
          id: initialData.id,
          data: {
            name: data.name,
            company: data.company,
            email: data.email || "",
            status: data.status,
            revenueValue: parseFloat(data.revenue || "0"),
          }
        });
      } else {
        await createMutate({
          name: data.name,
          company: data.company,
          email: data.email || "",
          status: data.status,
          revenueValue: parseFloat(data.revenue || "0"),
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
          <FormInput name="name" label="Customer Name" placeholder="e.g. Alice Johnson" />
          <FormInput name="company" label="Company Name" placeholder="e.g. Global Tech" />
        </div>
        
        <FormInput name="email" label="Email Address" placeholder="alice@example.com" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect 
            name="status" 
            label="Client Status" 
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Premium", value: "PREMIUM" },
              { label: "Inactive", value: "INACTIVE" },
            ]} 
          />
          <FormInput name="revenue" label={`Annual Revenue (${currencySymbol})`} placeholder="50000" />
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
              initialData ? "Update Customer" : "Create Customer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
