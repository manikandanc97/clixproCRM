"use client";

import { useState, useEffect } from "react";
import { 
  Sparkles, 
  TrendingUp, 
  Zap, 
  Target, 
  Users, 
  ArrowRight,
  BrainCircuit,
  MessageSquare,
  BarChart3,
  Calendar,
  Lightbulb
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { 
  CRMPageContainer, 
  CRMPageHeader, 
  CRMMetricsGrid, 
  MetricCard, 
  CRMCard,
  ActivityTimeline,
  CRMPageSection
} from "@/shared/components/crm";
import { Button } from "@/shared/ui/button";
import { useAiInsights } from "@/shared/hooks/use-dashboard";
import { PageLoadingState } from "@/shared/components/page-states";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip,
  CartesianGrid 
} from "recharts";
import { motion } from "framer-motion";
import { toast } from "sonner";

const chartData = [
  { name: "Week 1", revenue: 4000, prediction: 4200 },
  { name: "Week 2", revenue: 3000, prediction: 3500 },
  { name: "Week 3", revenue: 5000, prediction: 5500 },
  { name: "Week 4", revenue: 4500, prediction: 6000 },
  { name: "Week 5", revenue: 6000, prediction: 7500 },
  { name: "Week 6", revenue: 5500, prediction: 8200 },
];

import { ChartContainer } from "@/shared/components/charts/ChartContainer";

export default function AiInsightsPage() {
  const { data: insightsData, isLoading: loading } = useAiInsights();

  const recommendations = insightsData?.recommendations || [];
  const aiStats = insightsData?.stats || [];
  const aiTimeline = insightsData?.timeline || [];

  const handleAskAI = () => {
    toast.success("AI Assistant", {
      description: "How can I help you analyze your business data today?",
    });
  };

  if (loading) {
    return <PageLoadingState label="Consulting the neural engine..." />;
  }

  return (
    <CRMPageContainer>
      <CRMPageHeader
        title="AI Intelligence Hub"
        subtitle="Harness neural forecasting and intelligent recommendations to scale your business."
        badge="Neural Engine v4.2"
        icon={BrainCircuit}
        iconColor="text-indigo-500"
        actions={[
          {
            label: "Export AI Report",
            icon: BarChart3,
            onClick: () => toast.info("Generating AI Analysis Report..."),
            variant: "outline",
          },
          {
            label: "Ask Assistant",
            icon: MessageSquare,
            onClick: handleAskAI,
            variant: "default",
          },
        ]}
      />

      {/* AI Stats Grid */}
      <CRMMetricsGrid>
        {aiStats.map((stat: any, i: number) => (
          <MetricCard
            key={i}
            {...stat}
            delay={i * 0.1}
          />
        ))}
      </CRMMetricsGrid>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 min-w-0">
        {/* Main Insights Panel */}
        <div className="lg:col-span-2 space-y-8 min-w-0">
          <CRMPageSection 
            title="Performance Predictions" 
            subtitle="Revenue vs AI Forecast for the next 6 weeks."
            className="min-w-0"
          >
            <CRMCard className="h-[400px] min-h-[400px] p-6 min-w-0">
              <ChartContainer 
                height="100%" 
                hasData={!!(insightsData?.forecastData || chartData)}
                className="w-full h-full"
              >
                <AreaChart data={insightsData?.forecastData || chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 600 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#6366f1" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="prediction" 
                    stroke="#10b981" 
                    strokeWidth={3}
                    strokeDasharray="5 5"
                    fillOpacity={1} 
                    fill="url(#colorPrediction)" 
                  />
                </AreaChart>
              </ChartContainer>
            </CRMCard>
          </CRMPageSection>

          <CRMPageSection 
            title="Smart Recommendations" 
            subtitle="AI-generated actions to optimize your sales funnel."
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations.map((rec: any, i: number) => (
                <CRMCard 
                  key={rec.id} 
                  className="p-5 flex flex-col justify-between"
                  accentSeed={rec.title}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className={cn("p-2 rounded-lg", rec.bgColor, rec.color)}>
                        {/* Fallback for icon if it's a component or just use Sparkles as default */}
                        {typeof rec.icon === 'function' ? <rec.icon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                        rec.priority === 'high' ? 'bg-rose-500/10 text-rose-500' : 
                        rec.priority === 'medium' ? 'bg-orange-500/10 text-orange-500' : 'bg-emerald-500/10 text-emerald-500'
                      )}>
                        {rec.tag}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold tracking-tight mb-1">{rec.title}</h4>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {rec.description}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="w-full mt-4 justify-between group h-9">
                    Take Action
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CRMCard>
              ))}
              
              {/* AI Assistant Widget Card */}
              <CRMCard className="p-5 bg-indigo-500/[0.03] border-indigo-500/20 flex flex-col items-center justify-center text-center space-y-4">
                <div className="p-3 bg-indigo-500 rounded-2xl shadow-lg shadow-indigo-500/20">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-sm font-bold tracking-tight mb-1">Need deeper insights?</h4>
                  <p className="text-[11px] text-muted-foreground px-4">
                    Ask our AI assistant any question about your data.
                  </p>
                </div>
                <Button 
                  onClick={handleAskAI}
                  className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold h-10"
                >
                  Start Chat
                </Button>
              </CRMCard>
            </div>
          </CRMPageSection>
        </div>

        {/* Sidebar Insights */}
        <div className="space-y-8">
          <CRMPageSection 
            title="Intelligence Timeline" 
            subtitle="Recent neural observations."
          >
            <CRMCard className="p-6">
              <ActivityTimeline items={aiTimeline} />
              <Button variant="outline" className="w-full mt-8 text-xs font-bold uppercase tracking-wider h-10">
                View All Events
              </Button>
            </CRMCard>
          </CRMPageSection>

          <CRMCard className="p-6 overflow-hidden relative group">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="relative space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-600 rounded-lg">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <h4 className="text-sm font-bold tracking-tight">Quick Tip</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Based on current trends, Tuesday afternoons are the most effective time for your sales team to make discovery calls.
              </p>
              <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest pt-2">
                <TrendingUp className="w-3 h-3" />
                High Impact Insight
              </div>
            </div>
          </CRMCard>
        </div>
      </div>
    </CRMPageContainer>
  );
}












