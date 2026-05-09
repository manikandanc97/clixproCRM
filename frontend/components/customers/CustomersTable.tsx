"use client";

import { useState, Fragment, useMemo } from "react";
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
  User,
  Trash2
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
  CRMTableHeaderCell,
  CRMSortIndicator,
} from "@/components/shared/crm";
import { cn } from "@/lib/utils";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";

interface CustomersTableProps {
  customers: CustomerType[];
}

type SortConfig = {
  key: keyof CustomerType;
  direction: "asc" | "desc";
} | null;

const CustomersTable = ({ customers }: CustomersTableProps) => {
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerType | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const { deleteCustomer } = useCRMStore();

  const sortedCustomers = useMemo(() => {
    if (!sortConfig) return customers;
    return [...customers].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [customers, sortConfig]);

  const handleSort = (key: keyof CustomerType) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null;
      }
      return { key, direction: "asc" };
    });
  };

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

  const handleDelete = (e: React.MouseEvent | Event, id: string, name: string) => {
    e.stopPropagation();
    deleteCustomer(id);
    toast.error("Customer Removed", {
      description: `${name} has been deleted from your CRM records.`,
    });
  };

  const handleAction = (action: string, customer: CustomerType) => {
    toast.info(`${action}: ${customer.name}`, {
      description: `Initiating ${action.toLowerCase()} sequence for ${customer.company}.`,
    });
  };

  return (
    <>
      <CRMDataTable>
        <CRMTableHeader>
          <CRMTableRow>
            <CRMTableHeaderCell className="w-10 px-4"></CRMTableHeaderCell>
            <CRMTableHeaderCell 
              className="cursor-pointer group select-none"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center gap-2">
                Customer Intelligence <CRMSortIndicator active={sortConfig?.key === "name"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell 
              className="cursor-pointer group select-none"
              onClick={() => handleSort("healthScore")}
            >
              <div className="flex items-center gap-2">
                Health Score <CRMSortIndicator active={sortConfig?.key === "healthScore"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell>LTV Projection</CRMTableHeaderCell>
            <CRMTableHeaderCell 
              className="cursor-pointer group select-none"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center gap-2">
                Status & Segment <CRMSortIndicator active={sortConfig?.key === "status"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell className="text-right">Actions</CRMTableHeaderCell>
          </CRMTableRow>
        </CRMTableHeader>

        <CRMTableBody>
          {sortedCustomers.map((customer) => {
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
                        <p className="font-semibold text-foreground transition-colors text-sm tracking-tight">{customer.name}</p>
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
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wider">
                          {customer.healthScore > 70 ? 'Excellent' : customer.healthScore > 40 ? 'Stable' : 'Critical'}
                        </span>
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
                        <DropdownMenuItem onClick={() => handleAction("Email", customer)}>
                          <Mail className="w-3.5 h-3.5 mr-2" /> Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAction("Schedule Call", customer)}>
                          <Calendar className="w-3.5 h-3.5 mr-2" /> Schedule Call
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAction("AI Summary", customer)} className="text-primary focus:text-primary">
                          <Zap className="w-3.5 h-3.5 mr-2" /> AI Summary
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => handleDelete(e, customer.id, customer.name)} variant="destructive">
                          <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
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

