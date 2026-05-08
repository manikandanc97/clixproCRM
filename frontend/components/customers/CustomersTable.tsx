"use client";

import { useState, Fragment } from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  Mail, 
  Phone, 
  Calendar, 
  ExternalLink, 
  ChevronDown, 
  TrendingUp, 
  Activity,
  Zap,
  Sparkles,
  User
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { CustomerType } from "@/types/customer";
import { motion, AnimatePresence } from "framer-motion";
import CustomerIntelligenceCard from "./CustomerIntelligenceCard";
import CustomerProfilePanel from "./CustomerProfilePanel";
import { 
  CRMDataTable, 
  CRMTableHeader, 
  CRMTableBody, 
  CRMTableRow, 
  CRMTableCell, 
  CRMTableHeaderCell 
} from "@/components/shared/crm";
import { cn } from "@/lib/utils";

interface CustomersTableProps {
  customers: CustomerType[];
}

const CustomersTable = ({ customers }: CustomersTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const toggleRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const openProfile = (customer: CustomerType) => {
    setSelectedCustomer(customer);
    setIsPanelOpen(true);
  };

  return (
    <>
      <CRMDataTable>
        <CRMTableHeader>
          <CRMTableRow className="hover:bg-transparent">
            <CRMTableHeaderCell className="w-10 px-4"></CRMTableHeaderCell>
            <CRMTableHeaderCell>Customer Intelligence</CRMTableHeaderCell>
            <CRMTableHeaderCell>Health Score</CRMTableHeaderCell>
            <CRMTableHeaderCell>LTV Projection</CRMTableHeaderCell>
            <CRMTableHeaderCell>Status & Segment</CRMTableHeaderCell>
            <CRMTableHeaderCell className="text-right">Actions</CRMTableHeaderCell>
          </CRMTableRow>
        </CRMTableHeader>

        <CRMTableBody>
          {customers.map((customer) => {
            const isExpanded = expandedRows.has(customer.id);
            return (
              <Fragment key={customer.id}>
                <CRMTableRow 
                  onClick={() => openProfile(customer)}
                  className={cn(isExpanded && "bg-muted/50")}
                >
                  <CRMTableCell className="px-4 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => toggleRow(customer.id, e)}
                      className={cn("h-7 w-7 rounded-md transition-transform duration-300", isExpanded && "bg-primary/10 text-primary rotate-180")}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </Button>
                  </CRMTableCell>

                  <CRMTableCell>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-xs">
                          <AvatarFallback>
                            {customer.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background flex items-center justify-center shadow-sm",
                          customer.healthScore > 70 ? 'bg-success' : customer.healthScore > 40 ? 'bg-warning' : 'bg-destructive'
                        )}>
                          <Activity className="w-2 h-2 text-white" />
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm tracking-tight">{customer.name}</p>
                        <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 mt-0.5">
                          <Sparkles className="w-2.5 h-2.5 text-primary/60" />
                          {customer.company}
                        </p>
                      </div>
                    </div>
                  </CRMTableCell>

                  <CRMTableCell>
                    <div className="space-y-1.5 max-w-[120px]">
                      <div className="flex justify-between items-end">
                        <span className="text-[11px] font-bold text-foreground">{customer.healthScore}%</span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">Excellent</span>
                      </div>
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${customer.healthScore}%` }}
                          className={cn(
                            "h-full rounded-full",
                            customer.healthScore > 70 ? 'bg-success' : customer.healthScore > 40 ? 'bg-warning' : 'bg-destructive'
                          )} 
                        />
                      </div>
                    </div>
                  </CRMTableCell>

                  <CRMTableCell>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1 text-success">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="font-bold text-foreground text-sm tracking-tight">{customer.ltv || "$12,450"}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-4">High Potential</span>
                    </div>
                  </CRMTableCell>

                  <CRMTableCell>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-1.5">
                        <Badge className={cn(
                          "border-none px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider shadow-sm",
                          customer.status === 'Premium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                        )}>
                          {customer.status}
                        </Badge>
                        <Badge variant="outline" className="border-border text-muted-foreground px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider bg-background">
                          {customer.segment || "Growth"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                        <User className="w-3 h-3" />
                        {customer.manager}
                      </div>
                    </div>
                  </CRMTableCell>

                  <CRMTableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => openProfile(customer)}>
                          <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="w-3.5 h-3.5 mr-2" /> Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="w-3.5 h-3.5 mr-2" /> Schedule Call
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-primary focus:text-primary">
                          <Zap className="w-3.5 h-3.5 mr-2" /> AI Summary
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CRMTableCell>
                </CRMTableRow>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-muted/30"
                    >
                      <CRMTableCell colSpan={6} className="p-0 border-none">
                        <CustomerIntelligenceCard customer={customer} />
                      </CRMTableCell>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </Fragment>
            );
          })}
        </CRMTableBody>
      </CRMDataTable>

      <CustomerProfilePanel 
        customer={selectedCustomer} 
        isOpen={isPanelOpen} 
        onClose={() => setIsPanelOpen(false)} 
      />
    </>
  );
};

export default CustomersTable;
