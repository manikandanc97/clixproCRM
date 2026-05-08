"use client";

import { Users, Star, CreditCard, LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MetricCardType } from "@/types/common";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

const iconMap: Record<string, LucideIcon> = {
  "Total Customers": Users,
  "Premium Clients": Star,
  "Monthly Revenue": CreditCard,
};

// Mock sparkline data
const generateSparklineData = (positive: boolean) => {
  const points = 7;
  return Array.from({ length: points }).map((_, i) => ({
    value: positive 
      ? 20 + Math.random() * 20 + (i * 5) 
      : 50 - Math.random() * 20 - (i * 2)
  }));
};

interface CustomerStatsProps {
  stats: MetricCardType[];
}

const Counter = ({ value }: { value: string }) => {
  const numericValue = value.replace(/[^0-9.]/g, "");
  const prefix = value.match(/^[^0-9]*/)?.[0] || "";
  const suffix = value.match(/[0-9.]*([^0-9]*)$/)?.[1] || "";

  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {prefix}
      {numericValue}
      {suffix}
    </motion.span>
  );
};

const CustomerStats = ({ stats }: CustomerStatsProps) => {
  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-3">
      {stats.map((item, index) => {
        const Icon = iconMap[item.title] || Users;
        const sparklineData = generateSparklineData(item.positive ?? true);
        
        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="relative bg-white/70 backdrop-blur-xl rounded-xl border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500 group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50/50 to-transparent rounded-bl-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-700 opacity-50" />
              
              <CardContent className="relative z-10 p-7">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 shadow-sm
                    ${item.title === 'Total Customers' ? 'bg-indigo-50 text-indigo-600 shadow-indigo-100/50' : 
                      item.title === 'Premium Clients' ? 'bg-amber-50 text-amber-600 shadow-amber-100/50' : 
                      'bg-emerald-50 text-emerald-600 shadow-emerald-100/50'}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className={`border-none font-bold text-xs px-2.5 py-1 flex items-center gap-1 shadow-sm ${item.positive ? 'bg-emerald-50 text-emerald-600 shadow-emerald-100/50' : 'bg-rose-50 text-rose-600 shadow-rose-100/50'}`}>
                      {item.positive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                      {item.change}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[0.7rem] font-bold text-slate-400 uppercase tracking-[0.15em] mb-1">{item.title}</p>
                    <h2 className="text-3xl font-black text-slate-900 leading-none tracking-tight">
                      <Counter value={item.value} />
                    </h2>
                  </div>

                  <div className="h-16 w-24">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparklineData}>
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={item.positive ? "#10b981" : "#f43f5e"} stopOpacity={0.4} />
                            <stop offset="100%" stopColor={item.positive ? "#10b981" : "#f43f5e"} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke={item.positive ? "#10b981" : "#f43f5e"}
                          strokeWidth={2.5}
                          fill={`url(#gradient-${index})`}
                          isAnimationActive={true}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
              
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-indigo-500 to-emerald-500 group-hover:w-full transition-all duration-700" />
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default CustomerStats;
