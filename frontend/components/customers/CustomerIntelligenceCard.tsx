"use client";

import { motion } from "framer-motion";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  ShieldAlert, 
  Zap, 
  MessageSquare,
  Calendar,
  Wallet
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CustomerType } from "@/types/customer";

interface CustomerIntelligenceCardProps {
  customer: CustomerType;
}

const CustomerIntelligenceCard = ({ customer }: CustomerIntelligenceCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="p-8 pt-2 grid grid-cols-1 lg:grid-cols-4 gap-6 bg-slate-50/50">
        {/* Relationship Summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600">
              <Zap className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">AI Relationship Summary</h4>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm italic">
            "{customer.aiSummary || "Based on recent activity, this customer shows strong growth potential. Their last interaction was positive, and they are exploring enterprise-tier upgrades."}"
          </p>
          
          <div className="flex flex-wrap gap-2 pt-2">
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              Upsell Opportunity
            </Badge>
            <Badge className="bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              High Engagement
            </Badge>
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 px-3 py-1 rounded-full text-[10px] font-black uppercase">
              Reference Customer
            </Badge>
          </div>
        </div>

        {/* Intelligence Metrics */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600">
              <Activity className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Engagement</h4>
          </div>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Total Interactions</span>
              </div>
              <span className="text-sm font-black text-slate-900">{customer.totalInteractions || 42}</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">Renewal Date</span>
              </div>
              <span className="text-sm font-black text-slate-900">{customer.renewalDate || "Dec 12, 2026"}</span>
            </div>
          </div>
        </div>

        {/* Risk & Sentiment */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Predictive Insights</h4>
          </div>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-500">Churn Risk</span>
                <Badge className={`border-none ${customer.churnRisk === 'High' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {customer.churnRisk || "Low"}
                </Badge>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${customer.churnRisk === 'High' ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                  style={{ width: customer.churnRisk === 'High' ? '85%' : '15%' }} 
                />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-500">LTV Projection</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600">
                <TrendingUp className="w-3 h-3" />
                <span className="text-sm font-black">${(customer.revenueValue * 2.4).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CustomerIntelligenceCard;
