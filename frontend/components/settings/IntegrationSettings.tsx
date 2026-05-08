"use client";

import React, { useState } from "react";
import { 
  Search, 
  ExternalLink, 
  Settings2,
  Calendar,
  Video,
  MessageSquare,
  CreditCard,
  Mail,
  Webhook,
  CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { CRMCard } from "@/components/shared/crm";

const integrations = [
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sync your CRM tasks and events with Google Calendar.",
    icon: Calendar,
    category: "Productivity",
    connected: true,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get real-time notifications and activity pulses in Slack.",
    icon: MessageSquare,
    category: "Communication",
    connected: false,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
  {
    id: "zoom",
    name: "Zoom",
    description: "Automatically create meeting links for your leads.",
    icon: Video,
    category: "Communication",
    connected: false,
    color: "text-sky-500",
    bg: "bg-sky-500/10",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Send automated messages and follow-ups via WhatsApp.",
    icon: MessageSquare,
    category: "Communication",
    connected: false,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Manage payments and subscriptions directly from the CRM.",
    icon: CreditCard,
    category: "Finance",
    connected: true,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    id: "smtp",
    name: "Email SMTP",
    description: "Connect your own email server for outbound communications.",
    icon: Mail,
    category: "Productivity",
    connected: true,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Trigger external workflows with custom HTTP callbacks.",
    icon: Webhook,
    category: "Developer",
    connected: false,
    color: "text-slate-500",
    bg: "bg-slate-500/10",
  },
];

const IntegrationSettings = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredIntegrations = integrations.filter(
    (integration) =>
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search integrations..." 
            className="pl-10 rounded-lg bg-muted/30 border-border/50 h-10 text-sm focus:bg-card transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="rounded-md bg-primary/5 text-primary border-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest">
            {integrations.filter(i => i.connected).length} Connected
          </Badge>
          <Button variant="ghost" size="sm" className="rounded-lg h-9 text-[10px] font-bold uppercase tracking-widest">
            Request New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredIntegrations.map((integration) => (
          <motion.div
            key={integration.id}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <CRMCard className="group h-full flex flex-col">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg ${integration.bg} flex items-center justify-center transition-transform group-hover:scale-105 duration-300`}>
                  <integration.icon className={`w-6 h-6 ${integration.color}`} />
                </div>
                {integration.connected ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-none rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Connected
                  </Badge>
                ) : (
                  <Badge variant="outline" className="rounded-md text-muted-foreground bg-muted/50 border-border text-[9px] font-bold uppercase tracking-widest">
                    Available
                  </Badge>
                )}
              </div>
              
              <div className="space-y-1 mb-6 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-foreground tracking-tight">
                    {integration.name}
                  </h3>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    {integration.category}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                  {integration.description}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {integration.connected ? (
                  <>
                    <Button className="flex-1 rounded-lg bg-muted hover:bg-muted/80 text-foreground border-none h-9 text-[10px] font-bold uppercase tracking-widest">
                      <Settings2 className="w-3.5 h-3.5 mr-2" />
                      Configure
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg hover:bg-destructive/10 hover:text-destructive border border-transparent hover:border-destructive/20">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </>
                ) : (
                  <Button className="w-full rounded-lg bg-primary text-primary-foreground h-9 text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95">
                    Connect Integration
                  </Button>
                )}
              </div>
            </CRMCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default IntegrationSettings;
