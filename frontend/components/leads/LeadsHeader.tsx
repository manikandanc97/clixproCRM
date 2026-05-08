// leads page header

import { Users, UserPlus, Filter, Download, ArrowUpRight, ArrowDownRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LeadType } from "@/types/lead";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { motion } from "framer-motion";

interface LeadsHeaderProps {
  leads: LeadType[];
}

const Sparkline = ({ data, color }: { data: { value: number }[], color: string }) => (
  <div className="h-10 w-20">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
            <stop offset="95%" stopColor={color} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <Area 
          type="monotone" 
          dataKey="value" 
          stroke={color} 
          strokeWidth={2} 
          fillOpacity={1} 
          fill={`url(#gradient-${color})`} 
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

const AnimatedCounter = ({ value }: { value: number }) => (
  <motion.span
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: "easeOut" }}
  >
    {value}
  </motion.span>
);

const LeadsHeader = ({ leads }: LeadsHeaderProps) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const newThisMonth = leads.filter((lead) => {
    const createdAt = new Date(lead.createdAt);
    return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
  }).length;
  
  const activeDeals = leads.filter((lead) => !["Won", "Lost"].includes(lead.status)).length;

  // Mock data for sparklines
  const totalLeadsData = [
    { value: 400 }, { value: 300 }, { value: 600 }, { value: 800 }, { value: 500 }, { value: 900 }, { value: 1100 }
  ];
  const newLeadsData = [
    { value: 100 }, { value: 150 }, { value: 120 }, { value: 200 }, { value: 180 }, { value: 250 }, { value: 300 }
  ];
  const activeDealsData = [
    { value: 50 }, { value: 70 }, { value: 60 }, { value: 90 }, { value: 85 }, { value: 110 }, { value: 130 }
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700">
               <Sparkles className="w-4 h-4" />
             </div>
             <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Lead Intelligence</span>
          </div>
          <h1 className="font-black text-foreground text-4xl tracking-tight">Leads Management</h1>
          <p className="mt-1 text-muted-foreground font-medium">
            Track, qualify, and convert potential opportunities into customers.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-1">
          <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-muted px-5 py-6 rounded-xl border-border font-bold text-foreground transition-all shadow-sm group">
            <Download className="w-4 h-4 group-hover:scale-110 transition-transform" />
            Export Data
          </Button>
          
          <Button className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 px-6 py-6 rounded-xl font-bold text-white transition-all shadow-elevated shadow-slate-200 active:scale-95 group">
            <UserPlus className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Add New Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { 
            label: "Total Leads", 
            value: leads.length, 
            icon: Users, 
            color: "#3b82f6", 
            bg: "bg-blue-50", 
            trend: "+12.5%", 
            isUp: true,
            data: totalLeadsData 
          },
          { 
            label: "New This Month", 
            value: newThisMonth, 
            icon: UserPlus, 
            color: "#10b981", 
            bg: "bg-emerald-50", 
            trend: "+18.2%", 
            isUp: true,
            data: newLeadsData 
          },
          { 
            label: "Active Deals", 
            value: activeDeals, 
            icon: Filter, 
            color: "#f59e0b", 
            bg: "bg-amber-50", 
            trend: "-2.4%", 
            isUp: false,
            data: activeDealsData 
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="bg-card rounded-xl border-border shadow-sm transition-all hover:shadow-elevated hover:shadow-slate-200 group overflow-hidden relative border-b-4 border-b-transparent hover:border-b-current" style={{ borderBottomColor: stat.color }}>
              <CardContent className="p-7 relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-4 rounded-xl ${stat.bg}`} style={{ color: stat.color }}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <Sparkline data={stat.data} color={stat.color} />
                </div>
                
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm font-bold uppercase tracking-wider mb-1">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <h3 className="text-4xl font-black text-foreground">
                        <AnimatedCounter value={stat.value} />
                      </h3>
                      <div className={`flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${stat.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        {stat.isUp ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                        {stat.trend}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              
              <div 
                className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none"
                style={{ backgroundColor: stat.color }}
              />
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default LeadsHeader;
