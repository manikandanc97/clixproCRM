"use client";

import { 
  Plus, 
  UserPlus, 
  Briefcase, 
  FileText, 
  CheckSquare, 
  DollarSign,
  IndianRupee,
  ArrowRight,
  Calendar,
  Shield,
  Users
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/components/auth-provider";
import { useGlobalModalStore } from "@/shared/store/useGlobalModalStore";
import { PERMISSIONS } from "@/shared/lib/auth/rbac/permissions";
import { useCurrency } from "@/shared/hooks/use-currency";

export default function CreateNewMenu() {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const { openModal } = useGlobalModalStore();
  const { currency } = useCurrency();
  const CurrencyIcon = currency === "INR" ? IndianRupee : DollarSign;

  const actions = [
    { label: "New Lead", icon: <UserPlus className="w-4 h-4 text-emerald-500" />, path: "/leads?new=true", color: "hover:bg-emerald-500/5 hover:text-emerald-600", permission: PERMISSIONS.LEADS_CREATE },
    { label: "New Customer", icon: <Briefcase className="w-4 h-4 text-blue-500" />, path: "/customers?new=true", color: "hover:bg-blue-500/5 hover:text-blue-600", permission: PERMISSIONS.CUSTOMERS_CREATE },
    { label: "New Quote", icon: <FileText className="w-4 h-4 text-violet-500" />, path: "/quotations?new=true", color: "hover:bg-violet-500/5 hover:text-violet-600", permission: PERMISSIONS.QUOTATIONS_CREATE },
    { label: "New Task", icon: <CheckSquare className="w-4 h-4 text-amber-500" />, path: "/tasks?new=true", color: "hover:bg-amber-500/5 hover:text-amber-600", permission: PERMISSIONS.TASKS_CREATE },
    { label: "New Deal", icon: <CurrencyIcon className="w-4 h-4 text-rose-500" />, path: "/pipeline?new=true", color: "hover:bg-rose-500/5 hover:text-rose-600", permission: PERMISSIONS.PIPELINE_CREATE },
    { label: "New Meeting", icon: <Calendar className="w-4 h-4 text-orange-500" />, onClick: () => openModal("meeting"), color: "hover:bg-orange-500/5 hover:text-orange-600", permission: "leads.view" },
    { label: "New Employee", icon: <Users className="w-4 h-4 text-indigo-500" />, path: "/employees?new=true", color: "hover:bg-indigo-500/5 hover:text-indigo-600", permission: PERMISSIONS.EMPLOYEES_MANAGE },
    { label: "New Role", icon: <Shield className="w-4 h-4 text-slate-500" />, path: "/role-management?new=true", color: "hover:bg-slate-500/5 hover:text-slate-600", permission: PERMISSIONS.ROLES_MANAGE },
  ].filter((action) => hasPermission(action.permission));

  if (actions.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 bg-primary bg-gradient-to-b from-white/15 to-transparent text-primary-foreground px-5 h-[46px] rounded-md font-medium text-sm transition-all duration-200 shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 active:shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background">
          <Plus className="w-5 h-5" strokeWidth={2} />
          <span className="hidden lg:block tracking-wide">Create New</span>
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
            onClick={() => action.onClick ? action.onClick() : router.push(action.path!)}
            className={`cursor-pointer py-3 px-3 rounded-xl focus:bg-accent group flex items-center justify-between ${action.color} transition-all duration-300`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted dark:bg-slate-800 flex items-center justify-center group-focus:bg-card/70 transition-colors">
                {action.icon}
              </div>
              <span className="font-bold text-sm">{action.label}</span>
            </div>
            <ArrowRight className="w-3 h-3 opacity-0 group-focus:opacity-100 transition-all" />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}












