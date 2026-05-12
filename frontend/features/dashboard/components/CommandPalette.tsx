"use client";

import { useEffect, useState, useMemo } from "react";
import { Command } from "cmdk";
import { 
  Search, 
  FileText, 
  User, 
  Settings, 
  LayoutDashboard, 
  Calendar, 
  ArrowRight,
  Plus,
  Briefcase,
  TrendingUp,
  Clock,
  LogOut,
  Moon,
  Sun,
  Palette
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { DialogTitle, DialogDescription } from "@/shared/ui/dialog";
import { useTheme } from "next-themes";
import { useSettings } from "./SettingsContext";

// Mock data for search suggestions - in a real app these would come from an API
const SUGGESTIONS = [
  { id: "L-1", title: "John Doe", type: "Lead", path: "/leads" },
  { id: "L-2", title: "Sarah Smith", type: "Lead", path: "/leads" },
  { id: "C-1", title: "Acme Corp", type: "Customer", path: "/customers" },
  { id: "Q-1", title: "Q-2024-001", type: "Quotation", path: "/quotations" },
  { id: "T-1", title: "Follow up with Acme", type: "Task", path: "/tasks" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [recent, setRecent] = useState<typeof SUGGESTIONS>(() => {
    if (typeof window === "undefined") return [];
    const savedRecent = localStorage.getItem("crm-recent-searches");
    if (!savedRecent) return [];
    try {
      return JSON.parse(savedRecent);
    } catch {
      return [];
    }
  });
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const { setAccentColor } = useSettings();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = (command: () => void, item?: typeof SUGGESTIONS[0]) => {
    setOpen(false);
    command();
    
    if (item) {
      const newRecent = [item, ...recent.filter(r => r.id !== item.id)].slice(0, 5);
      setRecent(newRecent);
      localStorage.setItem("crm-recent-searches", JSON.stringify(newRecent));
    }
  };

  const filteredItems = useMemo(() => {
    if (!search) return [];
    return SUGGESTIONS.filter(item => 
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  return (
    <AnimatePresence>
      {open && (
        <Command.Dialog 
          open={open} 
          onOpenChange={setOpen} 
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 pt-[15vh] sm:p-6"
        >
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm z-0" 
            onClick={() => setOpen(false)}
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative z-10 w-full max-w-2xl overflow-hidden rounded-xl bg-white/90 dark:bg-card/90 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.15)] dark:shadow-[0_0_40px_rgba(0,0,0,0.6)] border border-border dark:border-border/60"
          >
            <DialogTitle className="sr-only">Command Palette</DialogTitle>
            <DialogDescription className="sr-only">
              Quickly access commands, leads, and settings.
            </DialogDescription>
            <Command className="w-full flex flex-col overflow-hidden bg-transparent">
              <div className="flex items-center px-5 border-b border-border/50 dark:border-border/50" cmdk-input-wrapper="">
                <Search className="w-5 h-5 text-primary shrink-0 mr-4" />
                <Command.Input 
                  autoFocus
                  value={search}
                  onValueChange={setSearch}
                  placeholder="Type a command or search..." 
                  className="flex-1 h-16 bg-transparent outline-none border-none text-foreground dark:text-slate-100 placeholder:text-muted-foreground font-semibold text-lg"
                />
                <kbd className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-black text-muted-foreground bg-muted dark:bg-slate-800 rounded-lg shadow-sm border border-border">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[450px] overflow-y-auto p-3 scrollbar-none">
                <Command.Empty className="py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Search className="w-10 h-10 text-slate-300 dark:text-foreground" />
                    <p className="text-muted-foreground font-medium">No results found for &quot;{search}&quot;</p>
                  </div>
                </Command.Empty>
                
                {search && filteredItems.length > 0 && (
                  <Command.Group heading="Search Results" className="px-3 py-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] opacity-80">
                    {filteredItems.map(item => (
                      <Command.Item 
                        key={item.id}
                        onSelect={() => runCommand(() => router.push(item.path), item)}
                        className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-sm font-bold text-foreground dark:text-slate-200 aria-selected:bg-primary/10 dark:aria-selected:bg-primary/20 aria-selected:text-primary cursor-pointer transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted dark:bg-slate-800 flex items-center justify-center group-aria-selected:bg-primary group-aria-selected:text-white transition-colors">
                          {item.type === "Lead" && <User className="w-4 h-4" />}
                          {item.type === "Customer" && <Briefcase className="w-4 h-4" />}
                          {item.type === "Quotation" && <FileText className="w-4 h-4" />}
                          {item.type === "Task" && <Clock className="w-4 h-4" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm">{item.title}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.type}</span>
                        </div>
                        <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-aria-selected:opacity-100 -translate-x-2 group-aria-selected:translate-x-0 transition-all" />
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                {!search && recent.length > 0 && (
                  <Command.Group heading="Recent Searches" className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
                    {recent.map(item => (
                      <Command.Item 
                        key={item.id}
                        onSelect={() => runCommand(() => router.push(item.path))}
                        className="flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground dark:text-slate-300 aria-selected:bg-muted dark:aria-selected:bg-slate-800 cursor-pointer transition-colors group"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        {item.title}
                        <span className="text-[10px] text-muted-foreground ml-auto">{item.type}</span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}

                <Command.Group heading="Navigation" className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">
                  <Command.Item onSelect={() => runCommand(() => router.push("/dashboard"))} className="cmd-item">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard Overview</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push("/leads"))} className="cmd-item">
                    <TrendingUp className="w-4 h-4" />
                    <span>Leads & Opportunities</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push("/tasks"))} className="cmd-item">
                    <Calendar className="w-4 h-4" />
                    <span>Task Manager</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Quick Actions" className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">
                  <Command.Item onSelect={() => runCommand(() => router.push("/leads?new=true"))} className="cmd-item text-emerald-600 dark:text-emerald-400">
                    <Plus className="w-4 h-4" />
                    <span>Create New Lead</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push("/tasks?new=true"))} className="cmd-item text-blue-600 dark:text-blue-400">
                    <Plus className="w-4 h-4" />
                    <span>Schedule New Task</span>
                  </Command.Item>
                </Command.Group>

                <Command.Group heading="Settings & Theme" className="px-3 py-2 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-2">
                  <Command.Item onSelect={() => setTheme(theme === "dark" ? "light" : "dark")} className="cmd-item">
                    {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                    <span>Switch to {theme === "dark" ? "Light" : "Dark"} Mode</span>
                  </Command.Item>
                  <Command.Item onSelect={() => runCommand(() => router.push("/settings"))} className="cmd-item">
                    <Settings className="w-4 h-4" />
                    <span>System Settings</span>
                  </Command.Item>
                </Command.Group>
              </Command.List>

              <div className="flex items-center gap-4 px-6 py-4 bg-muted/50 dark:bg-background/50 border-t border-border/50 dark:border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-border dark:border-border bg-white dark:bg-card shadow-sm">↵</kbd>
                  <span>Select</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <kbd className="px-1.5 py-0.5 rounded border border-border dark:border-border bg-white dark:bg-card shadow-sm">↑↓</kbd>
                  <span>Navigate</span>
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                  <kbd className="px-1.5 py-0.5 rounded border border-border dark:border-border bg-white dark:bg-card shadow-sm">⌘</kbd>
                  <kbd className="px-1.5 py-0.5 rounded border border-border dark:border-border bg-white dark:bg-card shadow-sm">K</kbd>
                  <span>to close</span>
                </div>
              </div>
            </Command>
          </motion.div>
          <style jsx global>{`
            .cmd-item {
              @apply flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-bold text-foreground dark:text-slate-200 aria-selected:bg-muted dark:aria-selected:bg-slate-800 cursor-pointer transition-colors;
            }
            .cmd-item svg {
              @apply w-4 h-4 text-muted-foreground;
            }
          `}</style>
        </Command.Dialog>
      )}
    </AnimatePresence>
  );
}












