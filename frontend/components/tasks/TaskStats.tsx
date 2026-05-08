import { CheckCircle2, Clock, AlertCircle, LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCardType } from "@/types/common";

const iconMap: Record<string, LucideIcon> = {
  "Completed Tasks": CheckCircle2,
  "Pending Tasks": Clock,
  "Overdue Tasks": AlertCircle,
};

interface TaskStatsProps {
  stats: MetricCardType[];
}

const TaskStats = ({ stats }: TaskStatsProps) => {
  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
      {stats.map((item) => {
        const Icon = iconMap[item.title] || Clock;
        return (
          <Card key={item.title} className="bg-white rounded-xl border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all group text-left">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110
                  ${item.title === 'Completed Tasks' ? 'bg-emerald-50 text-emerald-600' : 
                    item.title === 'Pending Tasks' ? 'bg-blue-50 text-blue-600' : 
                    'bg-rose-50 text-rose-600'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <Badge variant="outline" className={`border-none font-bold text-[10px] uppercase tracking-widest ${item.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {item.change}
                </Badge>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.title}</p>
                <h2 className="mt-1 text-2xl font-bold text-slate-900 leading-none">
                  {item.value}
                </h2>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TaskStats;
