// recent activity section

import { User, CheckCircle2, FileText, ArrowRight } from "lucide-react";
import { ActivityType } from "@/types/dashboard";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface RecentActivitiesProps {
  activities: ActivityType[];
}

const RecentActivities = ({ activities }: RecentActivitiesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
      className="w-full"
    >
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-background/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activities</CardTitle>
          <Button variant="ghost" className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4">View All</Button>
        </CardHeader>

        <CardContent className="flex-1">
          <div className="space-y-8 relative">
            {/* Timeline Line */}
            <div className="absolute left-[21px] top-2 bottom-2 w-px bg-gradient-to-b from-border via-border to-transparent" />

            {activities.map((activity, index) => {
              const isLeadActivity = activity.title.toLowerCase().includes("lead");
              const isQuotationActivity = activity.title.toLowerCase().includes("quotation");
              const isTaskActivity = activity.title.toLowerCase().includes("task");
              
              const Icon = isQuotationActivity ? FileText : isTaskActivity ? CheckCircle2 : User;
              const colorClass = isQuotationActivity
                ? "bg-gradient-to-br from-warning to-orange-500 shadow-orange-500/20"
                : isTaskActivity
                  ? "bg-gradient-to-br from-success to-teal-500 shadow-teal-500/20"
                  : isLeadActivity
                    ? "bg-gradient-to-br from-info to-indigo-500 shadow-blue-500/20"
                    : "bg-gradient-to-br from-muted-foreground to-slate-500 shadow-slate-500/20";

              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  key={activity.id} 
                  className="flex items-start gap-5 group cursor-pointer relative z-10"
                >
                  <div className={`h-11 w-11 rounded-2xl ${colorClass} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shrink-0 border border-white/20`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start gap-2">
                      <p className="font-bold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                        {activity.title}
                      </p>
                      <span className="text-[10px] font-bold text-muted-foreground whitespace-nowrap pt-0.5">{activity.time}</span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-muted rounded-md text-[9px] font-bold text-muted-foreground uppercase tracking-widest border border-border">
                        Activity
                      </span>
                      <ArrowRight className="w-3 h-3 text-muted-foreground/30 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RecentActivities;
