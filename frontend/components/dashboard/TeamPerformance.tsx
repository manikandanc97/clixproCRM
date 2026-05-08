"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const team = [
  { id: 1, name: "Alex Rivera", role: "Sr. Account Exec", sales: 42, target: 85, avatar: "AR", color: "bg-info" },
  { id: 2, name: "Jordan Lee", role: "Sales Rep", sales: 28, target: 60, avatar: "JL", color: "bg-primary" },
  { id: 3, name: "Taylor Smith", role: "SDR", sales: 15, target: 45, avatar: "TS", color: "bg-warning" },
];

export default function TeamPerformance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="w-full"
    >
      <Card className="border-none shadow-premium bg-gradient-to-br from-card to-background/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <CardTitle>Team Performance</CardTitle>
          </div>
          <Button variant="ghost" className="text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary/10 rounded-xl px-4 h-9">Full Report</Button>
        </CardHeader>
        <CardContent className="p-6 lg:p-8 pt-0 flex-1">
          <div className="space-y-6">
            {team.map((member, index) => {
              const progress = Math.min(100, Math.round((member.sales / member.target) * 100));
              return (
                <motion.div 
                  key={member.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.9 + (index * 0.1) }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 cursor-pointer">
                      <div className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center font-bold text-white shadow-sm group-hover:scale-110 transition-transform`}>
                        {member.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{member.name}</h4>
                        <p className="text-xs font-medium text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-foreground text-sm">{member.sales} / {member.target}</span>
                      <span className="text-[10px] font-bold text-success flex items-center gap-0.5 justify-end"><TrendingUp className="w-3 h-3"/> Deals</span>
                    </div>
                  </div>
                  {/* Progress Bar */}
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: 1 + (index * 0.1), ease: "easeOut" }}
                      className={`h-full rounded-full ${member.color}`}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
