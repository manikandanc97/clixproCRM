"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from "recharts";
import { MoreHorizontal, BarChart3, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ConversionChartPointType } from "@/types/report";
import { motion } from "framer-motion";

const COLORS = ['#3b82f6', '#2dd4bf', '#fbbf24', '#f87171', '#a78bfa', '#f472b6', '#22d3ee'];

interface ConversionChartProps {
  data: ConversionChartPointType[];
}

const ConversionChart = ({ data }: ConversionChartProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden group">
        <CardHeader className="flex flex-row items-center justify-between p-8 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="font-bold text-foreground text-xl tracking-tight">Lead Conversion</CardTitle>
              <BarChart3 className="w-4 h-4 text-emerald-500" />
            </div>
            <CardDescription className="text-muted-foreground text-sm mt-1">Weekly conversion percentage</CardDescription>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-xl transition-colors h-9 w-9">
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </Button>
        </CardHeader>

        <CardContent className="p-8 pt-0">
          <div className="h-[350px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.05)', radius: 12 }} 
                  contentStyle={{
                    borderRadius: "20px",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
                    padding: "16px 20px",
                    backgroundColor: "rgba(15, 23, 42, 0.9)",
                    backdropFilter: "blur(12px)",
                    color: "white",
                  }}
                  itemStyle={{
                    fontWeight: 900,
                    fontSize: "16px",
                  }}
                  labelStyle={{
                    color: "rgba(255, 255, 255, 0.5)",
                    fontWeight: 800,
                    fontSize: "10px",
                    marginBottom: "6px",
                    textTransform: "uppercase",
                    letterSpacing: "0.2em",
                  }}
                  formatter={(value) => [`${Number(value ?? 0)}%`, "Conversion Rate"]}
                />
                <Bar 
                  dataKey="value" 
                  radius={[12, 12, 4, 4]}
                  barSize={40}
                  animationDuration={2000}
                  animationBegin={800}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConversionChart;
