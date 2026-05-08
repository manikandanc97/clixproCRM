"use client";

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

interface TaskDetailsDrawerProps {
  task: TaskType | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailsDrawer = ({ task, isOpen, onClose }: TaskDetailsDrawerProps) => {
  if (!task) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-2xl border-l border-slate-200 p-0 bg-slate-50/50 backdrop-blur-xl">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-8 pb-4 bg-white border-b border-slate-100">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <Badge className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider
                  ${task.priority === 'High' ? 'bg-rose-50 text-rose-600' : 
                    task.priority === 'Medium' ? 'bg-blue-50 text-blue-600' : 
                    'bg-slate-50 text-slate-500'}`}>
                  {task.priority} Priority
                </Badge>
                {task.isUrgent && (
                  <Badge className="bg-amber-50 text-amber-600 border-none px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider animate-pulse">
                    Urgent
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4" /> Share
                </Button>
                <Button variant="ghost" size="icon-sm">
                  <MoreVertical className="w-4 h-4 text-slate-400" />
                </Button>
              </div>
            </div>
            <SheetTitle className="text-2xl font-bold text-slate-900 leading-tight">
              {task.title}
            </SheetTitle>
            <SheetDescription className="text-slate-500 mt-2 text-sm">
              Task ID: {task.id} • Created by Admin
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full">
              <div className="p-8 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Status</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${task.status === "Completed" ? "bg-emerald-500" : "bg-blue-500 animate-pulse"}`} />
                      <span className="text-sm font-bold text-slate-700">{task.status}</span>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Progress</p>
                    <span className="text-sm font-bold text-slate-700">{task.progress}%</span>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Due Date</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {task.dueDate}
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Estimated</p>
                    <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {task.estimatedTime || "2h 30m"}
                    </div>
                  </div>
                </div>

                {/* AI Summary */}
                {task.aiSummary && (
                  <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Zap className="w-12 h-12 text-violet-600" />
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-violet-600 fill-violet-600" />
                      <span className="text-xs font-bold text-violet-700 uppercase tracking-wider">AI Summary & Prediction</span>
                    </div>
                    <p className="text-sm text-violet-900 leading-relaxed">
                      {task.aiSummary}
                    </p>
                    <div className="mt-4 flex items-center gap-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-violet-400 uppercase">Risk Level</span>
                        <span className="text-xs font-bold text-violet-700">Low</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-violet-400 uppercase">Priority Score</span>
                        <span className="text-xs font-bold text-violet-700">{task.aiPriorityScore}/100</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Description</h3>
                  <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {task.description || "No detailed description provided for this task. Use the edit button to add more information about the objectives and requirements."}
                    </p>
                  </div>
                </div>

                {/* Assignees */}
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">Collaborators</h3>
                  <div className="flex items-center gap-2">
                    {task.collaborators?.map((c) => (
                      <div key={c.id} className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={c.avatar} />
                          <AvatarFallback className="text-[8px] font-bold">{c.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-600">{c.name}</span>
                      </div>
                    )) || (
                      <div className="flex items-center gap-2 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[8px] font-bold">{task.assignedTo.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold text-slate-600">{task.assignedTo}</span>
                      </div>
                    )}
                    <Button variant="ghost" size="icon-xs" className="border border-dashed border-slate-300 text-slate-400 hover:text-emerald-600 hover:border-emerald-600">
                      +
                    </Button>
                  </div>
                </div>

                {/* Tabs for Comments, Activity, Files */}
                <Tabs defaultValue="comments" className="w-full">
                  <TabsList className="bg-slate-100 p-1 rounded-xl w-full justify-start gap-2 h-auto mb-6">
                    <TabsTrigger value="comments" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-bold text-xs gap-2">
                      <MessageSquare className="w-3.5 h-3.5" /> Comments
                    </TabsTrigger>
                    <TabsTrigger value="activity" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-bold text-xs gap-2">
                      <History className="w-3.5 h-3.5" /> Activity
                    </TabsTrigger>
                    <TabsTrigger value="files" className="rounded-lg py-2 px-4 data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-sm font-bold text-xs gap-2">
                      <Paperclip className="w-3.5 h-3.5" /> Files
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="comments" className="space-y-4">
                    <div className="flex gap-4">
                      <Avatar className="w-8 h-8 rounded-lg shadow-sm border border-white">
                        <AvatarFallback className="bg-emerald-50 text-emerald-600 text-[10px] font-bold">ME</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                          <textarea 
                            placeholder="Add a comment or mention @someone..." 
                            className="w-full bg-transparent border-none focus:ring-0 text-sm text-slate-600 resize-none min-h-[80px]"
                          />
                          <div className="flex justify-between items-center mt-2">
                            <div className="flex gap-2">
                              <Button variant="ghost" size="icon-xs" className="text-slate-400"><Paperclip className="w-4 h-4" /></Button>
                              <Button variant="ghost" size="icon-xs" className="text-slate-400 font-bold">@</Button>
                            </div>
                            <Button size="xs" className="px-4">
                              Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 pt-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex gap-4 group">
                          <Avatar className="w-8 h-8 rounded-lg shadow-sm border border-white">
                            <AvatarFallback className="bg-blue-50 text-blue-600 text-[10px] font-bold">JD</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-slate-900">John Doe</span>
                              <span className="text-[10px] font-medium text-slate-400">2 hours ago</span>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm group-hover:shadow-md transition-all">
                              <p className="text-sm text-slate-600">
                                {i === 1 ? "I've started working on the initial research phase. Will update once I have the first draft ready." : "Could you please review the latest attachments and let me know if they align with the project goals?"}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="activity">
                    <div className="space-y-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex gap-4">
                          <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 z-10 relative">
                              {i === 1 ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Clock className="w-4 h-4 text-blue-500" />}
                            </div>
                            {i < 3 && <div className="absolute top-8 left-1/2 -translate-x-1/2 w-[1px] h-full bg-slate-200" />}
                          </div>
                          <div className="flex-1 pb-6">
                            <p className="text-sm text-slate-600">
                              <span className="font-bold text-slate-900">Sarah Miller</span> {i === 1 ? "marked the task as in progress" : i === 2 ? "updated the priority to high" : "created the task"}
                            </p>
                            <span className="text-[10px] font-medium text-slate-400">May 08, 2026 • 10:45 AM</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4 text-slate-500">
              <div className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-600 transition-colors">
                <Play className="w-4 h-4 fill-emerald-500 text-emerald-500" />
                <span className="text-xs font-bold">Start Timer</span>
              </div>
              <div className="w-[1px] h-4 bg-slate-200" />
              <div className="text-xs font-medium">Time tracked: <span className="font-bold text-slate-900">0h 00m</span></div>
            </div>
            <Button 
              onClick={() => {}}
              className="px-6"
            >
              Complete Task
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TaskDetailsDrawer;
