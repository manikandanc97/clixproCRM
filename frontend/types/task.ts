// task types

import { MetricCardType } from "./common";

export interface TaskType {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueDateValue: string | null;
  priority: "High" | "Medium" | "Low";
  assignedTo: string;
  status: "Pending" | "In Progress" | "Completed";
  // New premium fields
  progress: number;
  estimatedTime?: string;
  isOverdue?: boolean;
  subtaskCount?: { total: number; completed: number };
  category?: string;
  timeTracked?: string;
  tags?: string[];
  lastActivity?: string;
  notesCount?: number;
  attachmentsCount?: number;
  isUrgent?: boolean;
  collaborators?: { name: string; avatar: string; id: string }[];
  aiPriorityScore?: number;
  aiSummary?: string;
}

export interface TasksDataType {
  stats: MetricCardType[];
  tasks: TaskType[];
}
