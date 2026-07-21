"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createEmployee, updateEmployee } from "@/shared/lib/api/crm";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.enum(["ADMIN", "MANAGER", "SALES", "EMPLOYEE"]),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  initialData?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const EmployeeForm = ({ initialData, onSuccess, onCancel }: EmployeeFormProps) => {
  const queryClient = useQueryClient();
  const isEditing = !!initialData;
  
  const createMutation = useMutation({
    mutationFn: createEmployee,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee created successfully");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create employee");
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmployeeFormValues) => updateEmployee(initialData.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast.success("Employee updated successfully");
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
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name || "",
        email: initialData.email || "",
        password: "",
        role: initialData.role || "EMPLOYEE",
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: EmployeeFormValues) => {
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
          <FormInput name="password" label="Temporary Password" placeholder="••••••••" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} className="min-w-32 font-bold">
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Onboarding..."}
              </>
            ) : (
              isEditing ? "Update Employee" : "Create Employee"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
