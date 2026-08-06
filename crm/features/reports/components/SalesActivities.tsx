"use client";

import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { SalesActivityType } from "@/shared/types/report";
import { motion } from "framer-motion";
import { ChartContainer } from "@/shared/components/charts/ChartContainer";

const COLORS = ['#10b981', '#f59e0b', '#3b82f6'];

interface SalesActivitiesProps {
  data: SalesActivityType[];
  loading?: boolean;
}

const SalesActivities = ({ data, loading }: SalesActivitiesProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="min-w-0 h-full flex flex-col"
    >
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden group min-w-0 h-full flex flex-col flex-1">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="font-bold text-foreground text-lg tracking-tight">Sales Activities</CardTitle>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <CardDescription className="text-muted-foreground text-xs mt-1">Meetings and tasks execution</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 pt-0 min-w-0 flex-1 flex flex-col">
          <ChartContainer 
            height="100%" 
            loading={loading}
            hasData={data && data.length > 0}
            className="mt-4 flex-1"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 30, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 12 }} 
                  contentStyle={{
                    borderRadius: "16px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    padding: "12px 16px",
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    backdropFilter: "blur(12px)",
                    color: "white",
                  }}
                  itemStyle={{
                    fontWeight: 700,
                    fontSize: "14px",
                  }}
                />
                <Bar 
                  dataKey="value" 
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                  animationDuration={1500}
                >
                  {data?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(SalesActivities);
