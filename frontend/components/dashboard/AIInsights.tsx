"use client";

import { useState } from "react";
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

const INITIAL_INSIGHTS = {
  recommendations: [
    {
      id: 1,
      title: "High conversion probability",
      desc: "Acme Corp lead interaction has increased by 40% this week.",
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/20",
    },
    {
      id: 2,
      title: "Optimized outreach",
      desc: "Best time to contact Michael Chang is Tuesday at 10 AM.",
      icon: Zap,
      color: "text-amber-400",
      bgColor: "bg-amber-500/20",
    },
  ],
  alerts: [
    {
      id: 3,
      title: "Follow-up recommended",
      desc: "3 high-value deals have been inactive for over 14 days.",
      icon: AlertCircle,
      color: "text-rose-400",
      bgColor: "bg-rose-500/20",
    },
  ],
  trends: [
    {
      id: 4,
      title: "Revenue Forecast",
      desc: "Projected to hit 115% of Q2 target based on current pipeline.",
      icon: BarChart,
      color: "text-indigo-400",
      bgColor: "bg-indigo-500/20",
    },
  ],
};

type TabType = "recommendations" | "alerts" | "trends";

export default function AIInsights() {
  const [activeTab, setActiveTab] = useState<TabType>("recommendations");
  const [insights, setInsights] = useState(INITIAL_INSIGHTS);

  const handleDismiss = (e: React.MouseEvent, tab: TabType, id: number) => {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="w-full"
    >
      <div className="relative glass-dark shadow-elevated rounded-xl overflow-hidden text-white group flex flex-col border border-white/5">
        <div className="relative z-10 p-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-md border border-white/10">
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </div>
              <h3 className="font-bold text-base tracking-tight">AI Insights</h3>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 rounded-md border border-indigo-500/20 backdrop-blur-md">
              <span className="flex h-1.5 w-1.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-400"></span>
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400">
                Live
              </span>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-4 border border-white/5">
            {(["recommendations", "alerts", "trends"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-[9px] font-bold uppercase tracking-widest rounded-md transition-all duration-300 relative ${
                  activeTab === tab
                    ? "text-white"
                    : "text-white/40 hover:text-white"
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="ai-tab-pill"
                    className="absolute inset-0 bg-white/10 shadow-sm backdrop-blur-md rounded-md border border-white/10"
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {tab === "recommendations" ? "Recs" : tab}
                  {insights[tab].length > 0 && (
                    <span className="bg-white/20 text-white px-1 rounded-sm text-[7px]">
                      {insights[tab].length}
                    </span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent max-h-[300px] min-h-[160px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 5 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -5 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 pb-2"
              >
                {insights[activeTab].length > 0 ? (
                  insights[activeTab].map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        whileHover={{
                          x: 2,
                          backgroundColor: "rgba(255,255,255,0.06)",
                        }}
                        onClick={() => handleCardClick(item.title)}
                        className="bg-white/5 backdrop-blur-sm border border-white/5 p-4 rounded-lg flex items-start gap-4 hover:border-white/10 transition-all cursor-pointer group/card relative"
                      >
                        <div
                          className={`p-2.5 ${item.bgColor} rounded-lg ${item.color} shrink-0 shadow-lg shadow-black/10 transition-transform`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-xs mb-1 leading-tight group-hover/card:text-indigo-400 transition-colors truncate">
                            {item.title}
                          </p>
                          <p className="text-white/50 text-[10px] leading-relaxed line-clamp-2 font-medium">
                            {item.desc}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDismiss(e, activeTab, item.id)}
                          className="opacity-0 group-hover/card:opacity-100 absolute top-2 right-2 p-1 hover:bg-white/10 rounded-md transition-all text-white/40 hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    );
                  })
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-white/30"
                  >
                    <Sparkles className="w-8 h-8 mb-3 opacity-20" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">
                      No new {activeTab}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <button 
            onClick={handleHubClick}
            className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] uppercase tracking-widest h-9 rounded-lg border border-white/10 transition-all flex items-center justify-center gap-2 group/btn active:scale-95"
          >
            Intelligence Hub
            <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

