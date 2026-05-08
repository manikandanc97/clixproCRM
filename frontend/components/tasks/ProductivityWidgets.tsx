import { Card, CardContent } from "@/components/ui/card";
import { 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export const ProductivityWidgets = () => {
  return (
    <div className="space-y-6">
      {/* AI Recommendations */}
      <Card className="bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-600 border-none rounded-2xl overflow-hidden shadow-lg group">
        <CardContent className="p-6 relative">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <Sparkles className="w-20 h-20 text-white" />
          </div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
              <Zap className="w-3.5 h-3.5 text-white fill-white" />
            </div>
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">AI Insight</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2 leading-tight tracking-tight">Focus on Project Alpha</h3>
          <p className="text-white/80 text-[11px] leading-relaxed mb-4">
            Based on upcoming deadlines, completing the "Design Review" today will reduce bottleneck risk by 45%.
          </p>
          <Button variant="ghost" className="w-full bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white font-bold text-xs rounded-xl transition-all h-10 tracking-normal normal-case">
            View Recommendation
          </Button>
        </CardContent>
      </Card>

      {/* Today's Focus */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
              <Target className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Today's Focus</h3>
          </div>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px] uppercase tracking-widest rounded-lg">3 Tasks</Badge>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer group border border-transparent hover:border-slate-100">
              <div className="w-1.5 h-8 bg-emerald-100 group-hover:bg-emerald-500 transition-colors rounded-full" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {i === 1 ? "Update design system" : i === 2 ? "Client meeting preparation" : "Review project milestones"}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">4h left</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Productivity Pulse */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Weekly Pulse</h3>
          </div>
          <div className="flex items-center text-emerald-600 text-[10px] font-bold gap-1 uppercase tracking-widest">
            <ArrowUpRight className="w-3 h-3" /> 12%
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              <span>Completion Rate</span>
              <span className="text-slate-900">85%</span>
            </div>
            <Progress value={85} className="h-1.5 bg-slate-100" />
          </div>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Created</p>
              <p className="text-lg font-bold text-slate-900">24</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Finished</p>
              <p className="text-lg font-bold text-slate-900">18</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Workload */}
      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Workload Balance</h3>
          </div>
        </div>
        <div className="space-y-4">
          {[
            { name: "Alex Chen", taskCount: 8, load: 90, color: "bg-rose-500" },
            { name: "Sarah Miller", taskCount: 5, load: 60, color: "bg-emerald-500" },
            { name: "Mike Ross", taskCount: 3, load: 35, color: "bg-blue-500" }
          ].map((member) => (
            <div key={member.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6 border border-white shadow-sm rounded-lg">
                    <AvatarFallback className="text-[8px] font-bold">{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <span className="text-[11px] font-bold text-slate-700">{member.name}</span>
                </div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{member.taskCount} tasks</span>
              </div>
              <Progress value={member.load} className="h-1 bg-slate-100" indicatorClassName={member.color} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
