"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Zap,
  BarChart,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAiInsights } from "@/hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import { CRMCard } from "@/components/shared/crm/CRMCard";

type TabType = "recommendations" | "alerts" | "trends";

export default function AIInsights() {
  const [activeTab, setActiveTab] = useState<TabType>("recommendations");
  const { data, isLoading: loading } = useAiInsights();
  const [insights, setInsights] = useState<{
    recommendations: any[];
    alerts: any[];
    trends: any[];
  }>({
    recommendations: [],
    alerts: [],
    trends: [],
  });

  useEffect(() => {
    if (data) {
      setInsights({
        recommendations: data.recommendations || [],
        alerts: data.alerts || [],
        trends: data.trends || [],
      });
    }
  }, [data]);

  const handleDismiss = (e: React.MouseEvent, tab: TabType, id: string) => {
    e.stopPropagation();
    setInsights((prev) => ({
      ...prev,
      [tab]: prev[tab].filter((item) => item.id !== id),
    }));
    toast.success("Insight dismissed", {
      description: "We'll adjust future recommendations based on your feedback.",
    });
  };

  const handleCardClick = (title: string) => {
    toast.info(`Insight Detail: ${title}`, {
      description: "Opening intelligent deep-dive analysis...",
    });
  };

  const handleHubClick = () => {
    toast.success("Intelligence Hub", {
      description: "Navigating to centralized AI analytics workspace.",
    });
  };

  const getIcon = (tab: TabType) => {
    switch (tab) {
      case "recommendations": return Zap;
      case "alerts": return AlertCircle;
      case "trends": return TrendingUp;
      default: return Sparkles;
    }
  };

  if (loading) {
    return (
      <div className="w-full h-[400px] rounded-2xl border border-primary/20 bg-[#0d111c] p-6 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg bg-white/5" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24 bg-white/5" />
            <Skeleton className="h-3 w-16 bg-white/5" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-lg bg-white/5" />
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-lg bg-white/5" />
          <Skeleton className="h-20 w-full rounded-lg bg-white/5" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <CRMCard 
        accentSeed="AI Insights"
        noPadding
        className="relative flex flex-col overflow-hidden bg-[#0d111c] border-primary/20 shadow-2xl"
      >
        {/* Subtle Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 p-5 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-primary to-primary/80 rounded-lg shadow-lg">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white tracking-tight">AI Insights</h3>
                <p className="text-[9px] font-medium text-primary/80 uppercase tracking-wider">Neural Engine</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-bold text-primary-foreground uppercase tracking-tight">Live</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-5 p-1 bg-white/5 rounded-lg border border-white/5 backdrop-blur-xl overflow-hidden">
            {(["recommendations", "alerts", "trends"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md relative outline-none focus:outline-none ${
                  activeTab === tab
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="ai-tab-pill-restored"
                    className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 rounded-md"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab === "recommendations" ? "Recs" : tab}
                  {insights[tab].length > 0 && (
                    <span className={`px-1 rounded-sm text-[8px] ${
                      activeTab === tab ? "bg-white/20" : "bg-white/10"
                    }`}>
                      {insights[tab].length}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* List */}
          <div className="overflow-y-auto overflow-x-hidden pr-1 space-y-3 no-scrollbar max-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 overflow-hidden"
              >
                {insights[activeTab].length > 0 ? (
                  insights[activeTab].map((item) => {
                    const Icon = getIcon(activeTab);
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleCardClick(item.title)}
                        className="group relative bg-white/[0.03] border border-white/5 p-3.5 rounded-lg transition-all cursor-pointer overflow-hidden backdrop-blur-sm"
                      >
                        <div className="flex items-start gap-3.5">
                          <div className={`p-2.5 ${item.bgColor} rounded-lg ${item.color} shrink-0 transition-transform`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[11px] mb-1 text-white tracking-tight line-clamp-1">
                              {item.title}
                            </h4>
                            <p className="text-white/50 text-[10px] leading-relaxed line-clamp-2">
                              {item.description}
                            </p>
                          </div>
                          <button
                            onClick={(e) => handleDismiss(e, activeTab, item.id)}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded transition-all text-white/30"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-white/20">
                    <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">No {activeTab}</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <button 
            onClick={handleHubClick}
            className="w-full mt-5 flex items-center justify-center gap-2 py-2.5 text-[10px] font-bold uppercase tracking-wider text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all active:scale-[0.98]"
          >
            Intelligence Hub
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </CRMCard>
    </motion.div>
  );
}
