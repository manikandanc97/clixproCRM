"use client";

import React, { useState, useEffect } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { TrendingUp, BarChart3, Filter, UserPlus, Target, CalendarDays, MoreHorizontal, LayoutDashboard, Zap } from 'lucide-react';
import { CRMCard, CRMCardHeader } from '../shared/crm';
import { CardContent } from '@/components/ui/card';
import { ANALYTICS_DATA } from '@/data/analytics-mock';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const useMounted = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
};

export const RevenueOverviewChart = () => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[440px]" noPadding accentSeed="revenue">
      <CRMCardHeader 
        title="Revenue Overview" 
        subtitle={
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xl font-bold text-foreground">$428,500</span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" />
              +14%
            </span>
          </div>
        }
        icon={TrendingUp}
        iconBg="bg-gradient-to-br from-emerald-500/20 to-emerald-500/5"
        iconColor="text-emerald-600 dark:text-emerald-400"

        actions={
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span className="text-muted-foreground">Actual</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
              <span className="text-muted-foreground">Target</span>
            </div>
          </div>
        }
      />
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[300px] w-full min-h-[300px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ANALYTICS_DATA.revenueOverview}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }}
                  tickFormatter={(value) => `$${value/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorRev)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#cbd5e1" 
                  strokeWidth={2} 
                  strokeDasharray="5 5" 
                  fill="transparent" 
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const LeadsGrowthChart = () => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[440px]" noPadding accentSeed="leads">
      <CRMCardHeader 
        title="Leads Growth" 
        subtitle="Weekly sources distribution"
        icon={BarChart3}
        iconBg="bg-gradient-to-br from-blue-500/20 to-blue-500/5"
        iconColor="text-blue-600 dark:text-blue-400"

        actions={
          <button className="p-2 hover:bg-muted rounded-xl transition-colors">
            <MoreHorizontal className="w-5 h-5 text-muted-foreground" />
          </button>
        }
      />
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[300px] w-full min-h-[300px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.leadsGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="direct" stackId="a" fill="#3b82f6" radius={[0, 0, 0, 0]} />
                <Bar dataKey="social" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                <Bar dataKey="referral" stackId="a" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const PipelineOverviewChart = () => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[440px]" noPadding accentSeed="pipeline">
      <CRMCardHeader 
        title="Sales Pipeline" 
        subtitle="Stage distribution funnel"
        icon={Filter}
        iconBg="bg-gradient-to-br from-violet-500/20 to-violet-500/5"
        iconColor="text-violet-600 dark:text-violet-400"

        actions={
          <span className="text-[10px] font-bold px-2 py-1 bg-violet-500/5 text-violet-600 rounded-lg">Live Data</span>
        }
      />
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[300px] w-full flex items-center justify-center min-h-[300px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ANALYTICS_DATA.pipelineStages}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="stage"
                >
                  {ANALYTICS_DATA.pipelineStages.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const CustomerGrowthChart = () => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[440px]" noPadding accentSeed="customers">
      <CRMCardHeader 
        title="Customer Growth" 
        subtitle="Retention & churn analysis"
        icon={UserPlus}
        iconBg="bg-gradient-to-br from-cyan-500/20 to-cyan-500/5"
        iconColor="text-cyan-600 dark:text-cyan-400"

        actions={
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>New</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Churned</span>
            </div>
          </div>
        }
      />
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[300px] w-full min-h-[300px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ANALYTICS_DATA.customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="new" 
                  stroke="#10b981" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="churned" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={{ r: 3, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const MonthlyPerformanceChart = () => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[440px]" noPadding accentSeed="monthly">
      <CRMCardHeader 
        title="Monthly Performance" 
        subtitle="Total deals vs targets"
        icon={CalendarDays}
        iconBg="bg-gradient-to-br from-rose-500/20 to-rose-500/5"
        iconColor="text-rose-600 dark:text-rose-400"

        actions={
          <select className="text-[10px] font-bold bg-transparent border-none focus:ring-0 cursor-pointer text-muted-foreground hover:text-foreground transition-colors">
            <option>Last 6 Months</option>
            <option>Last 12 Months</option>
          </select>
        }
      />
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[300px] w-full min-h-[300px]">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ANALYTICS_DATA.revenueOverview}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12 }} 
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="revenue" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </CRMCard>
  );
};

export const ConversionAnalyticsChart = () => {
  const mounted = useMounted();
  return (
    <CRMCard className="h-[440px]" noPadding accentSeed="conversion">
      <CRMCardHeader 
        title="Conversion Analytics" 
        subtitle="Lead to customer conversion rate"
        icon={Target}
        iconBg="bg-gradient-to-br from-pink-500/20 to-pink-500/5"
        iconColor="text-pink-600 dark:text-pink-400"

        actions={
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-pink-600 bg-pink-500/5 px-2 py-1 rounded-lg">
            <Zap className="w-3 h-3" />
            High Performance
          </div>
        }
      />
      <CardContent className="px-6 pb-6 pt-0">
        <div className="h-[300px] w-full flex items-center justify-center min-h-[300px]">
           <div className="text-center">
              <div className="inline-flex items-center justify-center size-32 rounded-full border-8 border-pink-500/10 border-t-pink-500 mb-4 animate-spin-slow">
                 <span className="text-3xl font-black text-foreground">24.5%</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Average Conversion Rate</p>
              <div className="flex gap-4 mt-6">
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">1.2k</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Qualified</p>
                </div>
                <div className="text-center border-l border-r px-4">
                  <p className="text-lg font-bold text-foreground">312</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Won</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-foreground">15%</p>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Target</p>
                </div>
              </div>
           </div>
        </div>
      </CardContent>
    </CRMCard>
  );
};

