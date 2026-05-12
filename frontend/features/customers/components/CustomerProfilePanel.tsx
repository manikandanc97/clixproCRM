"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/shared/ui/sheet";
import { 
  Users, 
  Mail, 
  Phone, 
  Globe, 
  Calendar, 
  MessageSquare, 
  FileText, 
  CreditCard, 
  Clock, 
  MoreHorizontal,
  MailPlus,
  StickyNote,
  PhoneCall,
  Zap,
  TrendingUp,
  MapPin,
  Building2
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { CustomerType } from "@/shared/types/customer";
import { motion } from "framer-motion";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { cn } from "@/shared/lib/utils";

interface CustomerProfilePanelProps {
  customer: CustomerType | null;
  isOpen: boolean;
  onClose: () => void;
}

const CustomerProfilePanel = ({ customer, isOpen, onClose }: CustomerProfilePanelProps) => {
  if (!customer) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-xl p-0 border-l border-border shadow-elevated bg-white flex flex-col h-full">
        <SheetHeader className="sr-only">
          <SheetTitle>{customer.name} Profile</SheetTitle>
          <SheetDescription>Detailed customer profile, interaction timeline, and relationship insights for {customer.name}.</SheetDescription>
        </SheetHeader>
        <ScrollArea className="flex-1">
          {/* Header Section */}
          <div className="relative h-48 bg-gradient-to-br from-primary via-primary/90 to-primary/80 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-32 h-32 bg-card rounded-full blur-3xl" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
            </div>
            
            <div className="relative h-full flex flex-col justify-end p-6 text-white">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-2xl font-bold shadow-elevated">
                  {customer.name.charAt(0)}
                </div>
                <div className="space-y-1">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm text-[9px] font-bold uppercase tracking-widest">
                    {customer.segment || "Enterprise"}
                  </Badge>
                  <h2 className="text-2xl font-bold tracking-tight leading-none">{customer.name}</h2>
                  <p className="text-primary-foreground/80 font-medium flex items-center gap-1.5 opacity-90 text-sm">
                    <Building2 className="w-3.5 h-3.5" />
                    {customer.company}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-muted p-3 rounded-lg border border-border text-center">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">LTV</p>
                <p className="text-base font-bold text-foreground">{customer.ltv || "$12,450"}</p>
              </div>
              <div className="bg-muted p-3 rounded-lg border border-border text-center">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Health</p>
                <div className="flex items-center justify-center gap-1 text-success">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <p className="text-base font-bold">{customer.healthScore || 92}%</p>
                </div>
              </div>
              <div className="bg-muted p-3 rounded-lg border border-border text-center flex items-center justify-center flex-col">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                <Badge variant="outline" className={`border-none h-5 px-2 ${customer.status === 'Premium' ? 'badge-warning' : 'badge-success'}`}>
                  {customer.status}
                </Badge>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-primary/5 p-5 rounded-xl border border-primary/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary text-primary-foreground shadow-md">
                    <Zap className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="font-bold text-foreground uppercase tracking-widest text-[10px]">AI Relationship Insight</h3>
                </div>
                <Badge className="bg-primary text-primary-foreground border-none text-[9px] font-bold">PREMIUM</Badge>
              </div>
              <p className="text-xs text-primary/80 leading-relaxed font-medium">
                &quot;{customer.aiSummary || "This customer is a prime candidate for the new Enterprise Expansion pack. Engagement has increased by 40% over the last 30 days."}&quot;
              </p>
            </div>

            {/* Main Tabs */}
            <Tabs defaultValue="timeline" className="w-full">
              <TabsList className="w-full bg-muted p-1 rounded-lg h-10 flex gap-1">
                <TabsTrigger value="timeline" className="flex-1 rounded-md h-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="details" className="flex-1 rounded-md h-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Details
                </TabsTrigger>
                <TabsTrigger value="deals" className="flex-1 rounded-md h-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Deals
                </TabsTrigger>
                <TabsTrigger value="files" className="flex-1 rounded-md h-8 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Files
                </TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="mt-6">
                <div className="space-y-5">
                  {[
                    { type: 'Call', content: 'Quarterly review with John Doe', date: '2 hours ago', icon: PhoneCall },
                    { type: 'Note', content: 'Expressed interest in multi-region deployment', date: 'Yesterday', icon: StickyNote },
                    { type: 'Email', content: 'Sent proposal for 2026 contract renewal', date: '2 days ago', icon: MailPlus },
                  ].map((activity, i) => (
                    <div key={i} className="flex gap-4 relative group">
                      {i < 2 && <div className="absolute left-5 top-10 bottom-[-20px] w-0.5 bg-muted" />}
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform",
                        activity.type === 'Call' ? "bg-success/10 text-success" : 
                        activity.type === 'Note' ? "bg-warning/10 text-warning" : 
                        "bg-primary/10 text-primary"
                      )}>
                        <activity.icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 py-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">{activity.type}</span>
                          <span className="text-[9px] text-muted-foreground">• {activity.date}</span>
                        </div>
                        <p className="text-xs font-bold text-foreground">{activity.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="details" className="mt-6 space-y-4">
                <div className="bg-muted p-5 rounded-xl border border-border space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                      <p className="text-xs font-bold text-foreground">{customer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Phone Number</p>
                      <p className="text-xs font-bold text-foreground">+1 (555) 012-3456</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Location</p>
                      <p className="text-xs font-bold text-foreground">San Francisco, CA</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>

        {/* Footer Actions */}
        <div className="p-4 bg-muted/50 border-t border-border grid grid-cols-2 gap-3">
          <Button className="rounded-lg h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-md">
            <MailPlus className="w-3.5 h-3.5" />
            Send Email
          </Button>
          <Button variant="outline" className="rounded-lg h-10 border-border bg-white text-foreground font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-muted shadow-sm">
            <PhoneCall className="w-3.5 h-3.5" />
            Schedule Call
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CustomerProfilePanel;












