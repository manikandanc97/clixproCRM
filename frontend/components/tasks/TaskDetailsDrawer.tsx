"use client";

import type { ComponentType } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskType } from "@/types/task";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Calendar, 
  Clock, 
  MessageSquare, 
  History, 
  Paperclip, 
  MoreVertical,
  CheckCircle2,
  AlertCircle,
  Play,
  Share2,
  Tag as TagIcon,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TaskIntelligenceBadge } from "./TaskIntelligenceBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CRMCard } from "@/components/shared/crm";
import { cn } from "@/lib/utils";

interface TaskDetailsDrawerProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
}

type TaskStat = {
  label: string;
  value: string | number;
  icon?: ComponentType<{ className?: string; color?: string }>;
  color?: string;
};

const TaskDetailsDrawer = ({ task, isOpen, onClose }: TaskDetailsDrawerProps) => {
  if (!task) return null;

  const stats: TaskStat[] = [
    { label: "Status", value: task.status, icon: CircleIndicator, color: task.status === "Completed" ? "bg-emerald-500" : "bg-primary animate-pulse" },
    { label: "Progress", value: `${task.progress}%` },
    { label: "Due Date", value: task.dueDate, icon: Calendar },
    { label: "Estimated", value: task.estimatedTime || "2h 30m", icon: Clock },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl border-l border-border/40 p-0 bg-background shadow-elevated">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b border-border/40 bg-card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn(
                  "px-2 py-0.5 rounded-md font-black text-[8px] uppercase tracking-widest border-none",
                  task.priority === 'High' ? 'bg-rose-500/10 text-rose-500' : 
                  task.priority === 'Medium' ? 'bg-blue-500/10 text-blue-500' : 
                  'bg-muted/50 text-muted-foreground'
                )}>
                  {task.priority} Priority
                </Badge>
                {task.isUrgent && (
                  <Badge className="bg-amber-500/10 text-amber-600 border-none px-2 py-0.5 rounded-md font-black text-[8px] uppercase tracking-widest animate-pulse">
                    Urgent
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[10px] font-bold uppercase tracking-widest rounded-lg">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <SheetTitle className="text-xl font-black text-foreground leading-tight tracking-tight">
              {task.title}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground/80 mt-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
              <span className="text-primary/60">#{task.id.slice(0, 8)}</span>
              <span className="opacity-20">•</span>
              Created by Workspace Admin
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-hidden bg-muted/5">
            <ScrollArea className="h-full">
              <div className="p-6 flex flex-col gap-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {stats.map((stat) => {
                    const StatIcon = stat.icon;

                    return (
                      <div key={stat.label} className="bg-card p-3 rounded-lg border border-border/40 shadow-sm">
                        <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.15em] mb-1.5">{stat.label}</p>
                        <div className="flex items-center gap-2 text-xs font-black text-foreground">
                          {StatIcon && <StatIcon color={stat.color} className="w-3.5 h-3.5 text-muted-foreground/60" />}
                          {stat.value}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Summary */}
                {task.aiSummary && (
                  <div className="bg-primary/[0.03] border border-primary/10 rounded-xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                      <Zap className="w-16 h-16 text-primary" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="p-1 rounded-md bg-primary/10">
                        <Zap className="w-3 h-3 text-primary fill-primary/50" />
                      </div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">AI Intelligence Insight</span>
                    </div>
                    <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                      {task.aiSummary}
                    </p>
                    <div className="mt-5 flex items-center gap-6 pt-4 border-t border-primary/5">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Risk Analysis</span>
                        <span className="text-xs font-bold text-primary">Low Volatility</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black text-muted-foreground/50 uppercase tracking-widest">Probability</span>
                        <span className="text-xs font-bold text-primary">{task.aiPriorityScore}% Completion</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Detailed Description</h3>
                  <div className="bg-card rounded-xl border border-border/40 p-5 shadow-sm">
                    <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                      {task.description || "No detailed description provided for this task. Use the workspace editor to define clear objectives and success criteria."}
                    </p>
                  </div>
                </div>

                {/* Assignees */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] px-1">Collaborators</h3>
                  <div className="flex items-center gap-2">
                    {(task.collaborators || [{ id: '1', name: task.assignedTo, avatar: '' }]).map((c) => (
                      <div key={c.id} className="flex items-center gap-2 bg-card border border-border/40 px-3 py-1.5 rounded-lg shadow-sm">
                        <Avatar className="w-6 h-6 rounded-md">
                          <AvatarImage src={c.avatar} />
                          <AvatarFallback className="text-[8px] font-black bg-muted text-muted-foreground">{c.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-foreground">{c.name}</span>
                      </div>
                    ))}
                    <button className="h-8 w-8 rounded-lg border border-dashed border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all bg-card/50">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="comments" className="w-full">
                  <TabsList className="bg-muted/50 p-1 rounded-lg w-full justify-start gap-1 h-auto mb-6 border border-border/30">
                    {[
                      { id: 'comments', label: 'Comments', icon: MessageSquare },
                      { id: 'activity', label: 'Activity', icon: History },
                      { id: 'files', label: 'Files', icon: Paperclip },
                    ].map((tab) => (
                      <TabsTrigger 
                        key={tab.id} 
                        value={tab.id} 
                        className="rounded-md py-1.5 px-4 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm font-black text-[10px] uppercase tracking-widest gap-2 text-muted-foreground/60 transition-all"
                      >
                        <tab.icon className="w-3 h-3" /> {tab.label}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                  
                  <TabsContent value="comments" className="space-y-5 mt-0">
                    <div className="flex gap-4">
                      <Avatar className="w-8 h-8 rounded-lg shadow-sm border border-border shrink-0">
                        <AvatarFallback className="bg-primary/5 text-primary text-[10px] font-black">ME</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm focus-within:ring-2 focus-within:ring-primary/10 transition-all">
                          <textarea 
                            placeholder="Add a comment or mention @someone..." 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm text-foreground placeholder:text-muted-foreground/40 font-medium resize-none min-h-[90px]"
                          />
                          <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/30">
                            <div className="flex gap-1.5">
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground/60"><Paperclip className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-md text-muted-foreground/60 font-black text-xs">@</Button>
                            </div>
                            <Button size="sm" className="px-5 font-bold rounded-lg h-8">
                              Post Comment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-4 relative">
                       <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-border/20 z-0" />
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-4 group relative z-10">
                          <Avatar className="w-8 h-8 rounded-lg shadow-sm border border-card shrink-0">
                            <AvatarFallback className="bg-blue-500/10 text-blue-600 text-[10px] font-black">JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1.5">
                              <span className="text-xs font-black text-foreground tracking-tight">John Doe</span>
                              <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-widest">2 hours ago</span>
                            </div>
                            <div className="bg-card border border-border/40 rounded-lg p-4 shadow-sm group-hover:shadow-md transition-all">
                              <p className="text-sm text-muted-foreground font-medium leading-relaxed">
                                {i === 1 ? "I've started working on the initial research phase. Will update once I have the first draft ready." : "Could you please review the latest attachments and let me know if they align with the project goals?"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="activity">
                    <div className="space-y-6 relative ml-1">
                       <div className="absolute left-[15px] top-0 bottom-0 w-[1px] bg-border/20 z-0" />
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-5 relative z-10">
                          <div className="w-8 h-8 rounded-full bg-card flex items-center justify-center border border-border/40 shadow-sm shrink-0">
                            {i === 1 ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <Clock className="w-3.5 h-3.5 text-primary" />}
                          </div>
                          <div className="flex-1 pb-6">
                            <p className="text-sm text-foreground/80 font-medium">
                              <span className="font-black text-foreground">Sarah Miller</span> {i === 1 ? "marked the task as in progress" : i === 2 ? "updated the priority to high" : "created the task"}
                            </p>
                            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest mt-1 inline-block">May 08, 2026 • 10:45 AM</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>

          <div className="p-5 bg-card border-t border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-5 text-muted-foreground">
              <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-all group">
                <div className="h-7 w-7 rounded-lg bg-primary/5 flex items-center justify-center group-hover:bg-primary/10 transition-all">
                  <Play className="w-3.5 h-3.5 fill-primary text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Start Timer</span>
              </div>
              <div className="w-[1px] h-4 bg-border/40" />
              <div className="text-[10px] font-bold uppercase tracking-widest">Tracked: <span className="font-black text-foreground ml-1">0h 00m</span></div>
            </div>
            <Button 
              className="px-6 font-black rounded-lg h-10 text-xs uppercase tracking-widest shadow-lg shadow-primary/10"
            >
              Complete Task
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// Sub-components
const CircleIndicator = ({ color }: { color?: string }) => (
  <div className={cn("w-2 h-2 rounded-full", color)} />
);

const Plus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export default TaskDetailsDrawer;
