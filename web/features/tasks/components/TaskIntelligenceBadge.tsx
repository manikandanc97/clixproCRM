import { Progress } from "@/shared/ui/progress";
import { Badge } from "@/shared/ui/badge";
import { Clock, CheckSquare, Tag, Zap, AlertTriangle } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface TaskIntelligenceBadgeProps {
  type: "progress" | "time" | "subtasks" | "category" | "ai-score" | "overdue";
  value: number | string | boolean | { total: number; completed: number };
  className?: string;
}

export const TaskIntelligenceBadge = ({ type, value, className }: TaskIntelligenceBadgeProps) => {
  switch (type) {
    case "progress":
      if (typeof value !== "number") return null;
      return (
        <div className={cn("flex flex-col gap-1 min-w-[100px]", className)}>
          <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
            <span>Progress</span>
            <span>{value}%</span>
          </div>
          <Progress value={value} className="h-1.5 bg-muted" indicatorClassName="bg-gradient-to-r from-emerald-500 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
        </div>
      );
    case "time":
      if (typeof value !== "string") return null;
      return (
        <div className={cn("flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50/50 text-blue-600 border border-blue-100/50 text-[11px] font-bold", className)}>
          <Clock className="w-3.5 h-3.5" />
          {value}
        </div>
      );
    case "subtasks":
      if (typeof value !== "object") return null;
      const { total, completed } = value;
      const percentage = total > 0 ? (completed / total) * 100 : 0;
      return (
        <div className={cn("flex items-center gap-2", className)}>
          <div className="flex items-center gap-1 text-muted-foreground text-[11px] font-bold">
            <CheckSquare className="w-3.5 h-3.5" />
            {completed}/{total}
          </div>
          <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      );
    case "category":
      if (typeof value !== "string") return null;
      return (
        <Badge variant="outline" className={cn("bg-white border-border text-muted-foreground font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm", className)}>
          <Tag className="w-3 h-3 text-muted-foreground" />
          {value}
        </Badge>
      );
    case "ai-score":
      if (typeof value !== "number") return null;
      return (
        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100 text-[10px] font-bold animate-pulse", className)}>
          <Zap className="w-3 h-3 fill-violet-600" />
          AI Priority: {value}/100
        </div>
      );
    case "overdue":
      return value ? (
        <div className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold", className)}>
          <AlertTriangle className="w-3 h-3" />
          OVERDUE
        </div>
      ) : null;
    default:
      return null;
  }
};












