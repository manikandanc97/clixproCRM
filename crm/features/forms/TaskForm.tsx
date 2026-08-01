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
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  assignedToId: z.string().optional(),
  reminderAt: z.date().optional(),
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
    },
  });

  const onSubmit = async (data: TaskFormValues) => {
    try {
      await createTask.mutateAsync({
        title: data.title,
        description: data.description || "",
        dueDate: data.dueDate ? data.dueDate.toISOString() : undefined,
        priority: data.priority,
        status: data.status,
        // Using any since these fields aren't in the create task payload type yet,
        // but backend might support them or they can be ignored for now.
        assignedToId: data.assignedToId === "unassigned" ? undefined : data.assignedToId,
        reminderAt: data.reminderAt ? data.reminderAt.toISOString() : undefined,
      } as any);
      onSuccess?.();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
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
          <FormSelect 
            name="assignedToId" 
            label="Assigned To" 
            options={[
              { label: "Unassigned", value: "unassigned" },
              { label: "Current User", value: "me" }
            ]} 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormDatePicker name="reminderAt" label="Reminder" />
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
