"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription 
} from "@/shared/ui/sheet";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { 
  FileText, 
  Download, 
  Send, 
  History, 
  CheckCircle2, 
  Clock, 
  User, 
  Sparkles,
  CreditCard,
  Printer,
  Copy,
  Trash2,
  MoreVertical,
  Zap
} from "lucide-react";
import { QuotationType } from "@/shared/types/quotation";
import { Separator } from "@/shared/ui/separator";
import { motion } from "framer-motion";

interface QuotationPreviewProps {
  quotation: QuotationType | null;
  isOpen: boolean;
  onClose: () => void;
}

const QuotationPreview = ({ quotation, isOpen, onClose }: QuotationPreviewProps) => {
  if (!quotation) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-xl p-0 bg-muted border-l-slate-200 shadow-elevated overflow-y-auto">
        <SheetHeader className="sr-only">
          <SheetTitle>Quotation Preview: {quotation.quoteId}</SheetTitle>
          <SheetDescription>Detailed preview of quotation {quotation.quoteId} for {quotation.client}, including itemized breakdown and AI analysis.</SheetDescription>
        </SheetHeader>
        {/* Premium Header */}
        <div className="bg-card p-8 border-b border-border sticky top-0 z-20">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-100">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <SheetTitle className="text-2xl font-black text-foreground tracking-tighter">
                  {quotation.quoteId}
                </SheetTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={`border-none px-3 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider
                    ${quotation.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 
                      quotation.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 
                      'bg-slate-200 text-muted-foreground'}`}>
                    {quotation.status}
                  </Badge>
                  <span className="text-muted-foreground text-xs font-medium">Created on May 06, 2026</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button size="icon" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground">
                <Printer className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-xl text-muted-foreground hover:text-foreground">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Button className="rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold h-12 shadow-lg shadow-slate-200">
              <Send className="w-4 h-4 mr-2" />
              Send to Client
            </Button>
            <Button variant="outline" className="rounded-xl border-border h-12 font-bold text-foreground">
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* AI Intelligence Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl p-6 text-white shadow-elevated relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Sparkles className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-white/20 rounded-lg backdrop-blur-md">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-xs font-black uppercase tracking-widest opacity-90">AI Quote Analysis</span>
            </div>
            <h3 className="text-lg font-bold mb-2">High Approval Probability</h3>
            <p className="text-sm text-indigo-100 leading-relaxed mb-4">
              This quotation has a <span className="font-black text-white">{quotation.probability}%</span> chance of being approved. 
              Client has viewed similar proposals 3 times this month.
            </p>
            <div className="flex items-center gap-4">
              <div className="flex-1 h-2 bg-white/20 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${quotation.probability}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" 
                />
              </div>
              <span className="text-xs font-black">{quotation.probability}%</span>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold">Smart Recommendation: Add 5% bundle discount</span>
              </div>
              <Button size="sm" variant="secondary" className="h-7 px-3 text-[10px] font-black rounded-lg bg-white text-indigo-600 border-none">
                Apply AI Tip
              </Button>
            </div>
          </motion.div>

          {/* AI Reminders */}
          <section className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground">Follow-up due tomorrow</p>
                <p className="text-[11px] text-muted-foreground font-medium">AI suggests morning call for 15% better conversion</p>
              </div>
            </div>
            <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-9">
              Schedule
            </Button>
          </section>

          {/* Client Details */}
          <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              Client Information
            </h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-black text-foreground">{quotation.client}</p>
                <p className="text-sm text-muted-foreground font-medium mt-0.5">Corporate Headquarters, NY</p>
              </div>
              <Button variant="ghost" size="sm" className="rounded-xl text-emerald-600 font-bold hover:bg-emerald-50">
                View Profile
              </Button>
            </div>
          </section>

          {/* Itemized Breakdown */}
          <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6">Line Items</h4>
            <div className="space-y-4">
              {quotation.items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">Qty: {item.quantity} x ${item.price}</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-foreground">${item.total}</p>
                </div>
              ))}
              
              <Separator className="my-4 bg-muted" />
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Subtotal</span>
                  <span>${quotation.amountValue}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground font-medium">
                  <span>Tax (10%)</span>
                  <span>+${quotation.tax}</span>
                </div>
                <div className="flex justify-between text-sm text-rose-500 font-medium">
                  <span>Discount</span>
                  <span>-${quotation.discount}</span>
                </div>
                <Separator className="my-2 bg-muted" />
                <div className="flex justify-between items-center pt-2">
                  <span className="text-base font-black text-foreground">Total Amount</span>
                  <span className="text-2xl font-black text-emerald-600">${quotation.amountValue + (quotation.tax || 0) - (quotation.discount || 0)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Activity Timeline */}
          <section className="bg-card rounded-xl p-6 border border-border shadow-sm">
            <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-6 flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-blue-500" />
              Activity Log
            </h4>
            <div className="space-y-6">
              {[
                { icon: Clock, title: "Quotation Generated", time: "May 06, 2026 10:15 AM", user: "John Doe" },
                { icon: Send, title: "Sent to Client", time: "May 06, 2026 10:20 AM", user: "System" },
                { icon: CheckCircle2, title: "Viewed by Client", time: "May 06, 2026 02:45 PM", user: "Michael Chen" },
              ].map((activity, idx) => (
                <div key={idx} className="flex gap-4 relative">
                  {idx !== 2 && <div className="absolute left-[15px] top-8 bottom-[-24px] w-0.5 bg-muted" />}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 shrink-0 shadow-sm
                    ${idx === 2 ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    <activity.icon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{activity.title}</p>
                    <p className="text-[11px] text-muted-foreground font-medium mt-0.5">{activity.time} • {activity.user}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Footer Actions */}
          <div className="grid grid-cols-2 gap-4 pb-8">
            <Button variant="outline" className="rounded-xl border-border h-14 font-bold text-foreground hover:bg-white shadow-sm transition-all group">
              <Copy className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-muted-foreground" />
              Duplicate
            </Button>
            <Button variant="destructive" className="rounded-xl h-14 font-bold shadow-sm transition-all">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default QuotationPreview;












