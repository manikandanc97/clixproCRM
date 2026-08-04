"use client";

import React, { useState } from "react";
import { PipelineLeadType } from "@/shared/types/pipeline";
import { 
  MoreHorizontal, 
  DollarSign, 
  IndianRupee,
  Clock, 
  MessageSquare, 
  UserPlus, 
  Zap,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/shared/ui/dropdown-menu";
import { 
  CRMDataTable, 
  CRMTableHeader, 
  CRMTableBody, 
  CRMTableRow, 
  CRMTableCell, 
  CRMTableHeaderCell 
} from "@/shared/components/crm";
import { useCurrency } from "@/shared/hooks/use-currency";
import { cn } from "@/shared/lib/utils";

interface PipelineTableProps {
  items: PipelineLeadType[];
  onSelectDeal?: (deal: PipelineLeadType) => void;
}

export const PipelineTable: React.FC<PipelineTableProps> = ({ items, onSelectDeal }) => {
  const { formatCurrency } = useCurrency();
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(items.length / rowsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const getPriorityColor = (p: string) => {
    switch (p) {
      case "High": return "bg-destructive/10 text-destructive border-destructive/20";
      case "Medium": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground border-border";
    }
  };

  return (
    <div className="flex-auto flex flex-col min-h-0 relative">
      <div className="flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden flex-1">
        <CRMDataTable containerClassName="border-0 shadow-none rounded-none flex-auto h-full overflow-auto" className="w-full">
          <CRMTableHeader className="sticky top-0 z-10 bg-card shadow-sm">
            <CRMTableRow>
              <CRMTableHeaderCell className="bg-card">Deal Name</CRMTableHeaderCell>
              <CRMTableHeaderCell className="bg-card">Company</CRMTableHeaderCell>
              <CRMTableHeaderCell className="bg-card">Stage</CRMTableHeaderCell>
              <CRMTableHeaderCell className="bg-card">Priority</CRMTableHeaderCell>
              <CRMTableHeaderCell className="bg-card">Value</CRMTableHeaderCell>
              <CRMTableHeaderCell className="bg-card">Win Probability</CRMTableHeaderCell>
              <CRMTableHeaderCell className="text-right bg-card">Actions</CRMTableHeaderCell>
            </CRMTableRow>
          </CRMTableHeader>

          <CRMTableBody>
            {paginatedItems.map((item) => {
              const val = item.valueAmount ? formatCurrency(item.valueAmount) : formatCurrency(Number(String(item.value || "0").replace(/[^0-9.-]+/g,"")));

              return (
                <CRMTableRow 
                  key={item.id}
                  className="cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => onSelectDeal?.(item)}
                >
                  <CRMTableCell>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{item.name}</span>
                      {item.isStuck && (
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0 h-4 font-bold flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Stuck
                        </Badge>
                      )}
                    </div>
                  </CRMTableCell>

                  <CRMTableCell>
                    <span className="text-xs font-semibold text-muted-foreground">{item.company || "—"}</span>
                  </CRMTableCell>

                  <CRMTableCell>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider bg-muted/50">
                      {item.stage || "Lead"}
                    </Badge>
                  </CRMTableCell>

                  <CRMTableCell>
                    <Badge variant="outline" className={cn("text-[9px] font-bold uppercase tracking-wider px-1.5 py-0 h-4", getPriorityColor(item.priority || "Low"))}>
                      {item.priority || "Low"}
                    </Badge>
                  </CRMTableCell>

                  <CRMTableCell>
                    <span className="font-bold text-foreground text-sm text-success">{val}</span>
                  </CRMTableCell>

                  <CRMTableCell>
                    <div className="flex items-center gap-2 max-w-[140px]">
                      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            item.probability > 70 ? 'bg-success' : item.probability > 30 ? 'bg-primary' : 'bg-muted-foreground'
                          )}
                          style={{ width: `${item.probability}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground">{item.probability}%</span>
                    </div>
                  </CRMTableCell>

                  <CRMTableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                          <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onSelectDeal?.(item)}>
                          <MessageSquare className="w-3.5 h-3.5 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <UserPlus className="w-3.5 h-3.5 mr-2" /> Assign Owner
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-primary focus:text-primary">
                          <Zap className="w-3.5 h-3.5 mr-2" /> AI Summary
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CRMTableCell>
                </CRMTableRow>
              );
            })}
          </CRMTableBody>
        </CRMDataTable>
      </div>

      {items.length > 10 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 bg-card border border-border rounded-xl p-4 shadow-sm flex-shrink-0">
          <div className="text-sm text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * rowsPerPage, items.length)}</span> of <span className="font-bold text-foreground">{new Intl.NumberFormat().format(items.length)}</span> Deals
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full md:w-auto justify-center md:justify-end">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground font-medium">Rows per page:</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1 font-semibold">
                    {rowsPerPage} <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[4rem]">
                  {[10, 25, 50, 100].map(size => (
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
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
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
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg hover:bg-muted hover:text-foreground transition-colors"
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
