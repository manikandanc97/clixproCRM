"use client";

import { useEffect, useState, useRef } from "react";
import { DollarSign, UserPlus, Briefcase, TrendingUp, LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCardType } from "@/types/common";
import { motion, useSpring, useTransform, animate } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";

const iconMap: Record<string, LucideIcon> = {
  "Monthly Revenue": DollarSign,
  "Lead Conversion": UserPlus,
  "Closed Deals": Briefcase,
  "Growth Rate": TrendingUp,
};

// Mock sparkline data for demo purposes
const generateSparklineData = (positive: boolean) => {
  return Array.from({ length: 10 }, (_, i) => ({
    value: positive 
      ? 20 + Math.random() * 40 + i * 2 
      : 60 - Math.random() * 40 - i * 2
  }));
};

const AnimatedCounter = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState("0");
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  const prefix = value.match(/^[^0-9]*/)?.[0] || "";
  const suffix = value.match(/[0-9.]*([^0-9]*)$/)?.[1] || "";

  useEffect(() => {
    const controls = animate(0, numericValue, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate(value) {
        if (numericValue % 1 === 0) {
          setDisplayValue(Math.floor(value).toString());
        } else {
          setDisplayValue(value.toFixed(1));
        }
      },
    });
    return () => controls.stop();
  }, [numericValue]);

  return <span>{prefix}{displayValue}{suffix}</span>;
};

interface ReportStatsProps {
  stats: MetricCardType[];
}

const ReportStats = ({ stats }: ReportStatsProps) => {
  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((item, idx) => {
        const Icon = iconMap[item.title] || TrendingUp;
        const sparklineData = generateSparklineData(item.positive);
        const colorClass = item.title === 'Monthly Revenue' ? 'blue' : 
                          item.title === 'Lead Conversion' ? 'amber' : 
                          item.title === 'Closed Deals' ? 'emerald' : 
                          'indigo';

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="group relative overflow-hidden bg-white rounded-xl border-slate-200/60 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500">
              {/* Subtle background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-${colorClass}-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <CardContent className="relative p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3
                    ${item.title === 'Monthly Revenue' ? 'bg-blue-50 text-blue-600' : 
                      item.title === 'Lead Conversion' ? 'bg-amber-50 text-amber-600' : 
                      item.title === 'Closed Deals' ? 'bg-emerald-50 text-emerald-600' : 
                      'bg-indigo-50 text-indigo-600'}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge 
                      variant="outline" 
                      className={`border-none font-bold text-xs flex items-center gap-1 px-2 py-1 rounded-lg ${
                        item.positive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {item.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {item.change}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">{item.title}</p>
                  <div className="flex items-end justify-between gap-2">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                      <AnimatedCounter value={item.value} />
                    </h2>
                    
                    <div className="h-10 w-20 mb-1 opacity-60 group-hover:opacity-100 transition-opacity duration-500">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={sparklineData}>
                          <Line 
                            type="monotone" 
                            dataKey="value" 
                            stroke={item.positive ? '#10b981' : '#f43f5e'} 
                            strokeWidth={2} 
                            dot={false}
                            animationDuration={1500}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default ReportStats;
