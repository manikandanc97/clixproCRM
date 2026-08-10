"use client";

import React, { useState } from "react";
import { 
  MoreVertical, 
  Mail, 
  ExternalLink,
  User,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/shared/ui/dropdown-menu";
import { CustomerType } from "@/shared/types/customer";
import { Checkbox } from "@/shared/ui/checkbox";
import { StatusBadge, StatusVariant } from "@/shared/components/StatusBadge";
import { CRMCard } from "@/shared/components/crm";
import { cn } from "@/shared/lib/utils";

interface CustomersGridProps {
  customers: CustomerType[];
  onEdit?: (customer: CustomerType) => void;
  onDelete?: (id: string) => void;
}

const statusVariantMap: Record<string, StatusVariant> = {
  "ACTIVE": "emerald",
  "PREMIUM": "indigo",
  "INACTIVE": "neutral",
};

export const CustomersGrid: React.FC<CustomersGridProps> = ({ customers, onEdit, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(12);

  const totalPages = Math.ceil(customers.length / rowsPerPage);
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleSelectCustomer = (id: string, checked: boolean) => {
    setSelectedIds(prev => 
      checked ? [...prev, id] : prev.filter(item => item !== id)
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-6">
        {paginatedCustomers.map((customer, idx) => {
          const revenueNum = typeof customer.revenueValue === "number" ? customer.revenueValue : (parseFloat(String(customer.revenue || "0")) || 0);
          const formattedRev = revenueNum >= 1_00_000
            ? `₹${(revenueNum / 1_00_000).toFixed(1)}L`
            : revenueNum >= 1000
            ? `₹${(revenueNum / 1000).toFixed(1)}K`
            : `₹${revenueNum.toLocaleString("en-IN")}`;

          const statusScore: Record<string, number> = { "PREMIUM": 90, "ACTIVE": 65, "INACTIVE": 25 };
          const score = customer.healthScore ?? statusScore[customer.status] ?? 50;
          const scoreColor = score >= 75 ? "bg-emerald-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500";
          const isSelected = selectedIds.includes(customer.id);

          return (
            <CRMCard
              key={customer.id}
              delay={idx * 0.04}
              className={cn("group relative flex flex-col justify-between", isSelected && "ring-2 ring-primary ring-offset-2")}
            >
              {/* Checkbox */}
              <div className={cn(
                "absolute top-6 left-6 z-10 transition-opacity duration-200",
                isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
              )}>
                <Checkbox 
                  checked={isSelected}
                  onCheckedChange={(c) => handleSelectCustomer(customer.id, !!c)}
                  className="w-5 h-5 rounded-[6px] data-[state=checked]:bg-primary data-[state=checked]:text-white shadow-sm"
                />
              </div>

              <div>
                <div className={cn("flex justify-between items-start mb-5 transition-all duration-300", isSelected ? "ml-8" : "group-hover:ml-8")}>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 rounded-xl border border-border bg-muted flex items-center justify-center font-bold text-base">
                      <AvatarFallback className="font-bold text-xs">{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-foreground group-hover:text-primary transition-colors tracking-tight cursor-pointer" onClick={() => onEdit?.(customer)}>
                        {customer.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">{customer.company}</p>
                    </div>
                  </div>
                  <StatusBadge 
                    status={customer.status} 
                    variant={statusVariantMap[customer.status]} 
                  />
                </div>

                <div className="space-y-4 mb-6">
                  <div className="p-3.5 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                    <div className="flex flex-col gap-1.5 text-xs text-muted-foreground font-medium">
                      <span className="flex items-center gap-2 truncate">
                        <Mail className="w-3.5 h-3.5 opacity-70 shrink-0" /> {customer.email || "—"}
                      </span>
                    </div>

                    <div className="h-px w-full bg-border/50" />

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-0.5">Lifetime Value</span>
                        <span className="text-sm font-bold text-foreground">{revenueNum > 0 ? formattedRev : "—"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider block mb-0.5">Health Score</span>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-12 h-1.5 rounded-full bg-muted overflow-hidden flex-1">
                            <div className={cn("h-full", scoreColor)} style={{ width: `${score}%` }} />
                          </div>
                          <span className="text-[10px] font-bold text-muted-foreground">{score}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/40">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-9 font-bold text-xs rounded-xl flex-1"
                  onClick={() => onEdit?.(customer)}
                >
                  <User className="w-3.5 h-3.5 mr-1.5" /> Edit Client
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-9 w-9 p-0 rounded-xl">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 rounded-xl">
                    <DropdownMenuItem onClick={() => onEdit?.(customer)} className="text-xs font-medium cursor-pointer">
                      <User className="w-3.5 h-3.5 mr-2" /> Edit Customer
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-xs font-medium cursor-pointer">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" /> Open Portal
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="text-xs font-medium cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
                      onClick={() => onDelete?.(customer.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete Customer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CRMCard>
          );
        })}
      </div>

      {/* Pagination */}
      {customers.length > 12 && (
        <div className="mt-auto pt-4 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 pb-6">
          <div className="text-sm text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * rowsPerPage, customers.length)}</span> of <span className="font-bold text-foreground">{new Intl.NumberFormat().format(customers.length)}</span> Customers
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Rows per page:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 font-semibold bg-background">
                    {rowsPerPage} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[4rem]">
                  {[12, 24, 48].map(size => (
                    <DropdownMenuItem key={size} onClick={() => { setRowsPerPage(size); setCurrentPage(1); }} className="font-medium text-sm cursor-pointer hover:bg-muted">
                      {size}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors bg-background"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors bg-background"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center justify-center px-4 text-sm font-semibold text-foreground min-w-[5rem]">
                Page {currentPage}
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors bg-background"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors bg-background"
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
