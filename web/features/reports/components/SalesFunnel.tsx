"use client";

import React, { useMemo, useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Sector } from "recharts";
import { Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { FunnelPointType } from "@/shared/types/report";
import { ChartContainer } from "@/shared/components/charts/ChartContainer";

const STAGE_COLORS: Record<string, string> = {
  "New Lead": "#3b82f6",     // blue-500
  "Contacted": "#10b981",    // emerald-500
  "Proposal Sent": "#f59e0b",// amber-500
  "Won": "#8b5cf6",          // violet-500
  "Lost": "#ef4444",         // red-500
};

const DEFAULT_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1'];

const renderActiveShape = (props: ReturnType<typeof JSON.parse>) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  
  return (
    <g>
      <text x={cx} y={cy - 12} dy={8} textAnchor="middle" fill={fill} className="text-xl font-black tracking-tight">
        {payload.name}
      </text>
      <text x={cx} y={cy + 16} dy={8} textAnchor="middle" fill="#94a3b8" className="text-[11px] font-bold uppercase tracking-wider">
        {value} ({ (percent * 100).toFixed(0) }%)
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

const SalesFunnel = ({ data }: { data: FunnelPointType[] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const conversion = data.length > 1 && data[0].count > 0
    ? Math.round((data[data.length - 1].count / data[0].count) * 1000) / 10
    : 0;

  const chartData = useMemo(() => data.map((item, index) => ({
    name: item.stage,
    value: item.count,
    fill: STAGE_COLORS[item.stage] || DEFAULT_COLORS[index % DEFAULT_COLORS.length]
  })), [data]);

  const onPieEnter = (_: ReturnType<typeof JSON.parse>, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="h-full flex flex-col min-w-0">
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden group min-w-0 h-full flex flex-col flex-1 relative">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-0 min-w-0 z-10">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-xl shadow-sm border border-emerald-500/20">
              <Filter className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <CardTitle className="font-bold text-foreground text-lg tracking-tight truncate">Sales Funnel</CardTitle>
              <CardDescription className="text-muted-foreground text-xs mt-1">Pipeline stages breakdown</CardDescription>
            </div>
          </div>
          <div className="text-right shrink-0">
             <div className="text-2xl font-black text-emerald-500">{conversion}%</div>
             <div className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Conversion</div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 min-w-0 flex-1 flex flex-col relative z-10">
          <ChartContainer 
            height="100%" 
            hasData={data && data.length > 0}
            className="flex-1 min-h-[220px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  {...({ activeIndex, activeShape: renderActiveShape } as ReturnType<typeof JSON.parse>)}
                  data={chartData}
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
                  {chartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.fill} 
                      className="cursor-pointer drop-shadow-sm hover:brightness-110 transition-all duration-300"
                    />
                  ))}
                </Pie>
                <Legend 
                  verticalAlign="bottom" 
                  height={30} 
                  iconType="square" 
                  formatter={(value) => <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default React.memo(SalesFunnel);
