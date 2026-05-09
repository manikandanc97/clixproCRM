"use client";

import { Sparkles, ArrowUpRight, Activity, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const WelcomeHero = () => {
  return (
    <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-elevated p-6 md:p-8 lg:p-10 rounded-xl overflow-hidden text-white border border-white/10">
      {/* Decorative elements */}
      <div className="top-0 right-0 absolute bg-primary/20 blur-[100px] rounded-full w-96 h-96 -translate-y-1/2 translate-x-1/3" />
      <div className="bottom-0 left-0 absolute bg-primary/20 blur-[100px] rounded-full w-96 h-96 -translate-x-1/3 translate-y-1/3" />
      
      {/* Animated grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50" />

      <div className="z-10 relative flex lg:flex-row flex-col justify-between items-start lg:items-center gap-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <Badge variant="outline" className="bg-white/10 backdrop-blur-md mb-6 px-4 py-1.5 border-white/10 rounded-lg font-bold text-primary text-[10px] uppercase tracking-widest hover:bg-white/20 transition-colors shadow-lg">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            System Live & Optimized
          </Badge>

          <h1 className="mb-4 font-bold text-white text-4xl md:text-5xl lg:text-6xl leading-tight tracking-tight">
            Welcome back,{" "}
            <span className="bg-clip-text bg-gradient-to-r from-primary to-emerald-300 text-transparent">
              Admin
            </span>
          </h1>

          <p className="max-w-xl text-slate-300 text-lg md:text-xl leading-relaxed">
            Your business grew by{" "}
            <span className="font-semibold text-primary">+12.5%</span> this
            week. Check your latest leads and conversion reports below.
          </p>

          <div className="flex flex-wrap items-center gap-4 mt-8">
            <Button variant="secondary" size="lg" className="group h-auto bg-white hover:bg-muted shadow-md px-8 py-4 rounded-xl font-bold text-foreground text-sm transition-all flex items-center gap-2">
              View Analytics
              <ArrowUpRight className="w-4 h-4 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="h-auto bg-white/5 hover:bg-white/10 backdrop-blur-md px-8 py-4 border-white/10 rounded-xl font-bold text-white text-sm transition-all">
              Manage Leads
            </Button>
          </div>
        </motion.div>

        {/* Floating Stats Cards */}
        <div className="hidden md:flex flex-col gap-4 relative w-full lg:w-auto">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-elevated lg:translate-x-4 cursor-pointer"
          >
            <div className="p-3 bg-primary/20 rounded-lg text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Live Traffic</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums">2,405</span>
                <span className="text-primary text-xs font-medium flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/> 14%</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
            className="bg-white/10 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex items-center gap-4 shadow-elevated lg:-translate-x-4 cursor-pointer"
          >
            <div className="p-3 bg-teal-500/20 rounded-lg text-teal-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Active Users</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold tabular-nums">842</span>
                <span className="text-emerald-400 text-xs font-medium flex items-center"><TrendingUp className="w-3 h-3 mr-0.5"/> 5%</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeHero;
