"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, ArrowRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

const tasks = [
  { id: 1, title: "Send proposal to TechFlow", due: "Today, 2:00 PM", priority: "high" },
  { id: 2, draw: "Follow up with Sarah Jenkins", due: "Tomorrow, 10:00 AM", priority: "medium" },
  { id: 3, title: "Prepare Q3 Sales Report", due: "Oct 15", priority: "low" },
];

export default function PendingFollowups() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className="w-full"
    >
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-background/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-info/10 text-info rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </div>
            <CardTitle>Pending Tasks</CardTitle>
          </div>
          <Button variant="ghost" className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4 h-9">View All</Button>
        </CardHeader>
        <CardContent className="pt-0 flex-1">
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <motion.div 
                key={task.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.8 + (index * 0.1) }}
                className="group flex items-start gap-4 p-3 -mx-3 rounded-xl hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="mt-0.5">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    task.priority === 'high' ? 'border-destructive/50 group-hover:border-destructive' :
                    task.priority === 'medium' ? 'border-warning/50 group-hover:border-warning' :
                    'border-border group-hover:border-info'
                  }`}>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors leading-snug">{task.title || task.draw}</h4>
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span className={task.priority === 'high' ? 'text-destructive' : ''}>{task.due}</span>
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                  <ArrowRight className="w-4 h-4 text-blue-500" />
                </div>
              </motion.div>
            ))}
          </div>
          
          <Button variant="outline" className="w-full mt-4 rounded-xl border-border bg-transparent hover:bg-muted text-muted-foreground font-bold text-[11px] uppercase tracking-wider">
            + Add New Task
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}
