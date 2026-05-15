"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  ArrowUpRight, 
  Activity, 
  Users, 
  ChevronRight,
  Zap,
  Sparkles
} from "lucide-react";
import { useAuth } from "@/features/auth/components/auth-provider";
import { Button } from "@/shared/ui/button";
import Link from "next/link";

export default function WelcomeBanner() {
  const { user, access } = useAuth();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 md:p-10 shadow-2xl border border-white/5"
    >
      {/* Background Gradients */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-500/5 to-transparent pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 blur-[100px] rounded-full pointer-events-none" />
      
      <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex-1 space-y-6">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3 fill-emerald-400" />
            System Live & Optimized
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Welcome back, <span className="text-emerald-400">{access.roleName}</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
              Your business grew by <span className="text-emerald-400 font-semibold">+12.5%</span> this week. Check your latest leads and conversion reports below.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <Button asChild className="rounded-full px-8 h-12 bg-white text-slate-950 hover:bg-slate-200 font-bold transition-all shadow-lg shadow-white/10 group">
              <Link href="/analytics" className="flex items-center gap-2">
                View Analytics
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full px-8 h-12 border-white/10 bg-white/5 text-white hover:bg-white/10 font-bold transition-all backdrop-blur-sm">
              <Link href="/leads">
                Manage Leads
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Side Stats */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-4 min-w-[240px]">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20">
              <Activity className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Live Traffic</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">2,405</span>
                <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  14%
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/20">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Active Users</p>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-white">842</span>
                <span className="text-[10px] font-bold text-blue-400 flex items-center gap-0.5">
                  <ArrowUpRight className="w-2.5 h-2.5" />
                  5%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Decorative Sparkle */}
      <div className="absolute top-10 right-1/4 opacity-20 animate-pulse">
        <Sparkles className="w-6 h-6 text-white" />
      </div>
    </motion.div>
  );
}
