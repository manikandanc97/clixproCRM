"use client";

import { Sparkles, TrendingUp, Users, Target, ArrowRight, Lightbulb } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";

const AnalyticsSummary = () => {
  const insights = [
    {
      title: "Revenue Growth",
      description: "Revenue is up 12.5% compared to last month. Projection suggests a further 5% increase if current trends continue.",
      icon: TrendingUp,
      color: "blue",
    },
    {
      title: "Lead Quality",
      description: "High-intent leads have increased by 20%. Consider increasing follow-up frequency for the 'Tech' sector.",
      icon: Target,
      color: "emerald",
    },
    {
      title: "Team Performance",
      description: "Sarah Jenkins is currently outperforming targets by 15%. Team average conversion is stable at 24%.",
      icon: Users,
      color: "amber",
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-xl tracking-tight">AI Insights</h2>
            <p className="text-slate-400 text-sm">Automated analysis of your CRM data</p>
          </div>
        </div>
        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
          View all insights
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {insights.map((insight, idx) => (
          <Card key={idx} className="group relative overflow-hidden bg-white rounded-xl border-slate-200/60 shadow-sm hover:shadow-xl transition-all duration-500 border-l-4" style={{ borderLeftColor: insight.color === 'blue' ? '#3b82f6' : insight.color === 'emerald' ? '#10b981' : '#f59e0b' }}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-2xl ${
                  insight.color === 'blue' ? 'bg-blue-50 text-blue-600' : 
                  insight.color === 'emerald' ? 'bg-emerald-50 text-emerald-600' : 
                  'bg-amber-50 text-amber-600'
                }`}>
                  <insight.icon className="w-5 h-5" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-slate-900">{insight.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Recommendation</span>
                </div>
                <button className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider">Dismiss</button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
};

export default AnalyticsSummary;
