"use client";

import { useState, useMemo } from "react";
import { Bell, Check, Clock, UserPlus, FileCheck, AlertCircle, Settings, Calendar, DollarSign, IndianRupee, Briefcase } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { formatDistanceToNow, parseISO } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useNotifications } from "@/shared/hooks/use-dashboard";
import { useCurrency } from "@/shared/hooks/use-currency";
import { Skeleton } from "@/shared/ui/skeleton";
import { EmptyState } from "@/shared/components/EmptyState";

type Notification = {
  id: string;
  title: string;
  description: string;
  time: string | Date;
  read: boolean;
  type: "lead" | "task" | "quote" | "system" | "lead_assigned" | "task_due" | "task_completed" | "customer_added" | "invoice_paid" | "meeting_reminder" | "employee_added";
};

function safeFormatDistanceToNow(time: string | Date | number | null | undefined): string {
  if (!time) return "Recently";
  
  try {
    let dateObj: Date;

    if (time instanceof Date) {
      dateObj = time;
    } else if (typeof time === "number") {
      dateObj = new Date(time);
    } else if (typeof time === "string") {
      dateObj = parseISO(time);
      if (isNaN(dateObj.getTime())) {
        dateObj = new Date(time);
      }
      if (isNaN(dateObj.getTime())) {
        return time;
      }
    } else {
      return "Recently";
    }

    if (isNaN(dateObj.getTime())) {
      return "Recently";
    }

    return formatDistanceToNow(dateObj, { addSuffix: true }).replace(/^about\s+/, '');
  } catch {
    return typeof time === "string" ? time : "Recently";
  }
}

export default function NotificationPanel() {
  const { data, isLoading: loading } = useNotifications();
  const { currency } = useCurrency();
  const CurrencyIcon = currency === "INR" ? IndianRupee : DollarSign;
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const notifications = useMemo(() => {
    if (!data?.notifications) return [];
    return data.notifications.map(n => ({
      ...n,
      read: n.read || readIds.has(n.id)
    }));
  }, [data, readIds]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadIds(new Set([...readIds, ...allIds]));
  };

  const markAsRead = (id: string) => {
    setReadIds(new Set([...readIds, id]));
  };

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "lead": 
      case "lead_assigned": return <UserPlus className="w-4 h-4 text-emerald-500" />;
      case "quote": return <FileCheck className="w-4 h-4 text-blue-500" />;
      case "task_due": return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case "task_completed": return <Check className="w-4 h-4 text-emerald-500" />;
      case "customer_added": return <Briefcase className="w-4 h-4 text-blue-500" />;
      case "invoice_paid": return <CurrencyIcon className="w-4 h-4 text-emerald-600" />;
      case "meeting_reminder": return <Calendar className="w-4 h-4 text-violet-500" />;
      case "employee_added": return <UserPlus className="w-4 h-4 text-amber-600" />;
      default: return <Settings className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative flex items-center justify-center w-10 h-10 hover:bg-muted rounded-full transition-all duration-200 group outline-none focus-visible:ring-1 focus-visible:ring-primary">
          <Bell className="w-5 h-5 text-muted-foreground transition-colors group-hover:text-foreground" strokeWidth={1.5} />
          {unreadCount > 0 && (
            <span className="top-2 right-2 absolute flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive/40 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive border-2 border-background"></span>
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 sm:w-96 rounded-xl p-0 shadow-elevated border-border bg-popover/95 backdrop-blur-xl overflow-hidden" align="end" sideOffset={8}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm tracking-tight">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                {unreadCount} New
              </span>
            )}
          </div>
          <button 
            onClick={markAllAsRead}
            className="text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1.5"
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {notifications.length > 0 ? (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className={`relative flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors cursor-pointer border-b border-border/30 last:border-0 ${!notification.read ? 'bg-primary/[0.02]' : ''}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    {!notification.read && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full shadow-[0_0_8px_var(--primary)]" />
                    )}
                    <div className={`mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-border/50 ${!notification.read ? 'bg-background' : 'bg-muted'}`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm tracking-tight truncate ${!notification.read ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
                          {notification.title}
                        </p>
                        <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {safeFormatDistanceToNow(notification.time)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                        {notification.description}
                      </p>
                    </div>
                  </motion.div>
                ))
              ) : (
                <EmptyState 
                  icon={Bell}
                  title="All caught up!"
                  description="You don't have any new notifications."
                  size="sm"
                  className="py-8 border-none bg-transparent shadow-none"
                />
              )}
            </AnimatePresence>
          )}
        </div>
        
        <div className="p-3 border-t border-border/50 bg-muted/20">
          <button className="w-full py-2 px-4 rounded-xl border border-border bg-background hover:bg-muted text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-sm">
            View All Notifications
          </button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}












