"use client";

import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { LeadSourceType } from "@/shared/types/report";
import { motion } from "framer-motion";
import { ChartContainer } from "@/shared/components/charts/ChartContainer";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'];

interface LeadSourceChartProps {
  data: LeadSourceType[];
  loading?: boolean;
}

const renderActiveShape = (props: ReturnType<typeof JSON.parse>) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 12} dy={8} textAnchor="middle" fill={fill} className="text-xl font-black tracking-tight">
        {payload.name}
      </text>
      <text x={cx} y={cy + 16} dy={8} textAnchor="middle" fill="#94a3b8" className="text-[11px] font-bold uppercase tracking-wider">
        {value} Leads ({(percent * 100).toFixed(0)}%)
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 18}
        fill={fill}
        opacity={0.2}
        cornerRadius={4}
      />
    </g>
  );
};

const LeadSourceChart = ({ data, loading }: LeadSourceChartProps) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const onPieEnter = (_: ReturnType<typeof JSON.parse>, index: number) => {
    setActiveIndex(index);
  };

  const total = useMemo(() => data.reduce((acc, curr) => acc + curr.value, 0), [data]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="min-w-0 h-full flex flex-col"
    >
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden group min-w-0 h-full flex flex-col flex-1 relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-0 z-10 min-w-0">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="font-bold text-foreground text-lg tracking-tight">Lead Sources</CardTitle>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <PieChartIcon className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <CardDescription className="text-muted-foreground text-xs mt-1">Distribution by origin</CardDescription>
          </div>
          <div className="text-right shrink-0">
             <div className="text-2xl font-black text-foreground">{total}</div>
             <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Total Leads</div>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-2 min-w-0 flex-1 flex flex-col relative z-10">
          <ChartContainer 
            height="100%" 
            loading={loading}
            hasData={Boolean(data && data.length > 0 && data.some((d) => (d.value || 0) > 0))}
            emptyMessage="No lead source distribution data"
            className="flex-1 min-h-[220px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  {...({ activeIndex, activeShape: renderActiveShape } as ReturnType<typeof JSON.parse>)}
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={6}
                  dataKey="value"
                  onMouseEnter={onPieEnter}
                  animationDuration={1500}
                  cornerRadius={6}
                  stroke="none"
                >
                  {data?.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                      className="cursor-pointer drop-shadow-sm hover:brightness-110 transition-all duration-300"
                    />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={30} 
                  iconType="circle" 
                  formatter={(value) => <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(LeadSourceChart);
