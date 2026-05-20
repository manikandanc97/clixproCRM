"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form } from "@/shared/ui/form";
import { FormInput, FormSelect, FormDatePicker, FormTextarea } from "@/shared/components/form-fields";
import { Button } from "@/shared/ui/button";
import { useCreateTask } from "@/shared/hooks/use-crm";
import { Loader2 } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  dueDate: z.date().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  assignedTo: z.string().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
});

type TaskFormValues = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export const TaskForm = ({ onSuccess, onCancel }: TaskFormProps) => {
  const createTask = useCreateTask();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "MEDIUM",
      status: "PENDING",
      assignedTo: "Unassigned",
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    try {
      const mappedPriority = 
        data.priority === "HIGH" ? "High" :
        data.priority === "MEDIUM" ? "Medium" : "Low";

      const mappedStatus = 
        data.status === "PENDING" ? "Pending" :
        data.status === "IN_PROGRESS" ? "In Progress" : "Completed";

      await createTask.mutateAsync({
        title: data.title,
        description: data.description || "",
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        priority: mappedPriority,
        assignedTo: data.assignedTo || "",
        status: mappedStatus,
      });
      onSuccess?.();
    } catch (error) {
      // Error handled by hook
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormInput name="title" label="Task Title" placeholder="e.g. Follow up with client" />
        
        <FormTextarea name="description" label="Description" placeholder="Add some details about the task..." />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect 
            name="priority" 
            label="Priority" 
            options={[
              { label: "High", value: "HIGH" },
              { label: "Medium", value: "MEDIUM" },
              { label: "Low", value: "LOW" },
            ]} 
          />
          <FormDatePicker name="dueDate" label="Due Date" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormSelect 
            name="status" 
            label="Initial Status" 
            options={[
              { label: "Pending", value: "PENDING" },
              { label: "In Progress", value: "IN_PROGRESS" },
              { label: "Completed", value: "COMPLETED" },
            ]} 
          />
          <FormInput name="assignedTo" label="Assign To" placeholder="e.g. Mike Smith" />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Button type="button" variant="outline" onClick={onCancel} disabled={createTask.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={createTask.isPending} className="min-w-32">
            {createTask.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Task"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
