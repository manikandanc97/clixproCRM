"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormTextarea } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { toast } from "sonner";
import { Shield } from "lucide-react";

const roleSchema = z.object({
  name: z.string().min(2, "Role name must be at least 2 characters"),
  description: z.string().min(5, "Please provide a brief description"),
});

type RoleFormValues = z.infer<typeof roleSchema>;

interface RoleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const RoleForm = ({ onSuccess, onCancel }: RoleFormProps) => {
  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: RoleFormValues) => {
    // In a real app, this would be a mutation
    toast.promise(new Promise(resolve => setTimeout(resolve, 1500)), {
      loading: "Creating custom security role...",
      success: () => {
        onSuccess?.();
        return "Role created and registered in security engine.";
      },
      error: "Failed to create role.",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput 
          name="name" 
          label="Role Name" 
          placeholder="e.g. Compliance Auditor" 
        />
        
        <FormTextarea 
          name="description" 
          label="Role Description" 
          placeholder="Define what this role is responsible for..." 
        />

        <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-primary">Initial Permissions</h5>
            <p className="text-xs text-muted-foreground leading-relaxed mt-1">
              By default, new roles have no permissions. You can configure granular module access after the role is created.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-32 font-bold">
            Create Role
          </Button>
        </div>
      </form>
    </Form>
  );
};
