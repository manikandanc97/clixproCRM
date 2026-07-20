"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { useCreateCustomer } from "@/shared/hooks/use-crm";
import { Loader2 } from "lucide-react";

const customerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company must be at least 2 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "PREMIUM", "INACTIVE"]),
  revenue: z.string().optional(),
  manager: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

interface CustomerFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const CustomerForm = ({ onSuccess, onCancel }: CustomerFormProps) => {
  const createCustomer = useCreateCustomer();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: "",
      company: "",
      email: "",
      status: "ACTIVE",
      revenue: "",
      manager: "Unassigned",
    },
  });

  const onSubmit = async (data: CustomerFormValues) => {
    try {
      const mappedStatus = 
        data.status === "ACTIVE" ? "Active" :
        data.status === "PREMIUM" ? "Premium" : "Inactive";

      await createCustomer.mutateAsync({
        name: data.name,
        company: data.company,
        email: data.email || "",
        status: mappedStatus,
        revenue: data.revenue || "",
        manager: data.manager || "",
      });
      onSuccess?.();
    } catch (error) {
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
          <FormInput name="revenue" label="Annual Revenue ($)" placeholder="50000" />
        </div>

        <FormInput name="manager" label="Account Manager" placeholder="e.g. Robert Brown" />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={createCustomer.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createCustomer.isPending} className="min-w-32">
            {createCustomer.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Customer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
