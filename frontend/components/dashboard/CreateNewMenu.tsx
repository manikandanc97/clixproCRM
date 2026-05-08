"use client";

import { 
  Plus, 
  UserPlus, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  DollarSign,
  ArrowRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";

export default function CreateNewMenu() {
  const router = useRouter();
  const { hasPermission } = useAuth();

  const actions = [
    { label: "New Lead", icon: <UserPlus className="w-4 h-4 text-emerald-500" />, path: "/leads?new=true", color: "hover:bg-emerald-500/5 hover:text-emerald-600", permission: "leads.create" },
    { label: "New Customer", icon: <Briefcase className="w-4 h-4 text-blue-500" />, path: "/customers?new=true", color: "hover:bg-blue-500/5 hover:text-blue-600", permission: "customers.create" },
    { label: "New Quote", icon: <FileText className="w-4 h-4 text-violet-500" />, path: "/quotations?new=true", color: "hover:bg-violet-500/5 hover:text-violet-600", permission: "quotations.create" },
    { label: "New Task", icon: <CheckSquare className="w-4 h-4 text-amber-500" />, path: "/tasks?new=true", color: "hover:bg-amber-500/5 hover:text-amber-600", permission: "tasks.create" },
    { label: "New Deal", icon: <DollarSign className="w-4 h-4 text-rose-500" />, path: "/pipeline?new=true", color: "hover:bg-rose-500/5 hover:text-rose-600", permission: "pipeline.create" },
  ].filter((action) => hasPermission(action.permission));

  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2.5 bg-primary text-primary-foreground px-4 sm:px-6 rounded-xl h-12 font-bold text-xs uppercase tracking-widest transition-all shadow-elevated shadow-primary/20 hover:scale-[1.02] active:scale-95 outline-none">
          <Plus className="w-4 h-4" />
          <span className="hidden lg:block">Create New</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 rounded-xl p-2 shadow-elevated border-border bg-popover/95 backdrop-blur-xl" align="end" sideOffset={8}>
        <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {actions.map((action) => (
          <DropdownMenuItem 
            key={action.label} 
            onClick={() => router.push(action.path)}
            className={`cursor-pointer py-3 px-3 rounded-xl focus:bg-accent group flex items-center justify-between ${action.color} transition-all duration-300`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted dark:bg-slate-800 flex items-center justify-center group-focus:bg-card/70 transition-colors">
                {action.icon}
              </div>
              <span className="font-bold text-sm">{action.label}</span>
            </div>
            <ArrowRight className="w-3 h-3 opacity-0 group-focus:opacity-100 -translate-x-2 group-focus:translate-x-0 transition-all" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
