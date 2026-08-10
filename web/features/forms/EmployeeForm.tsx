"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { FormSubmitButton } from "@/shared/components/form-submit-button";
import { useDirtyForm } from "@/shared/hooks/use-dirty-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee, updateEmployee } from "@/shared/lib/api/crm";
import { toast } from "sonner";

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character")
    .optional()
    .or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]),
  status: z.enum(["ACTIVE", "INACTIVE", "SUSPENDED"]).optional(),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeInitialData {
  id?: string;
  name?: string;
  email?: string;
  role?: "EMPLOYEE" | "ADMIN" | "MANAGER" | "SALES";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
}

interface EmployeeFormProps {
  initialData?: EmployeeInitialData;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EmployeeForm = ({ initialData, onSuccess, onCancel }: EmployeeFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      if (data.temporaryPassword) {
        toast.success("Employee created!", {
          description: `Temporary Password: ${data.temporaryPassword} - COPY THIS NOW!`,
          duration: 15000,
        });
      } else {
        toast.success("Employee created successfully");
      }
      resetDirty(form.getValues());
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmployeeFormValues) => updateEmployee(initialData?.id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
      resetDirty(form.getValues());
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update employee");
    },
  });

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      password: "",
      role: initialData?.role || "EMPLOYEE",
      status: initialData?.status || "ACTIVE",
    },
  });

  const { isDirty, resetDirty } = useDirtyForm(form, form.formState.defaultValues);

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        role: initialData.role || "EMPLOYEE",
        status: initialData.status || "ACTIVE",
      });
    }
  }, [initialData, form]);

  const onSubmit: SubmitHandler<EmployeeFormValues> = async (data) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput name="name" label="Name" placeholder="Name" />
        
        <FormInput name="email" label="Email" placeholder="Email" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect 
            name="role" 
            label="Role" 
            options={[
              { label: "Admin", value: "ADMIN" },
              { label: "Manager", value: "MANAGER" },
              { label: "Sales", value: "SALES" },
              { label: "Employee", value: "EMPLOYEE" },
            ]} 
          />
          <FormSelect 
            name="status" 
            label="Status" 
            options={[
              { label: "Active", value: "ACTIVE" },
              { label: "Inactive", value: "INACTIVE" },
              { label: "Suspended", value: "SUSPENDED" },
            ]} 
          />
        </div>
        
        <FormInput name="password" label="Temporary Password" placeholder="••••••••" />

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <FormSubmitButton
            isDirty={isDirty}
            isPending={isPending}
            loadingText={isEditing ? "Updating..." : "Onboarding..."}
          >
            {isEditing ? "Update Employee" : "Create Employee"}
          </FormSubmitButton>
        </div>
      </form>
    </Form>
  );
};
