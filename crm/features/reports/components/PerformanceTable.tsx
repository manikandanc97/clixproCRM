"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { TrendingDown, TrendingUp, Trophy, ArrowUpRight, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Users } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { PerformanceType } from "@/shared/types/report";
import { Progress } from "@/shared/ui/progress";
import { 
  CRMDataTable, 
  CRMTableHeader, 
  CRMTableBody, 
  CRMTableRow, 
  CRMTableCell, 
  CRMTableHeaderCell,
  CRMSortIndicator,
} from "@/shared/components/crm";
import { cn } from "@/shared/lib/utils";
import { useCurrency } from "@/shared/hooks/use-currency";

import { useViewMode } from "@/shared/hooks/useViewMode";
import { ViewToggle } from "@/shared/components/crm/ViewToggle";
import { PerformanceGrid } from "./PerformanceGrid";
import { AnimatePresence, motion } from "framer-motion";

interface PerformanceTableProps {
  performance: PerformanceType[];
}

type SortConfig = {
  key: keyof PerformanceType;
  direction: "asc" | "desc";
} | null;

const PerformanceTable = ({ performance }: PerformanceTableProps) => {
  const [viewMode, setViewMode] = useViewMode("reports", "list");
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const { formatCurrency } = useCurrency();

  const sortedPerformance = useMemo(() => {
    if (!sortConfig) return performance;
    return [...performance].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [performance, sortConfig]);

  const handleSort = (key: keyof PerformanceType) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(sortedPerformance.length / rowsPerPage);
  const paginatedPerformance = sortedPerformance.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-auto flex flex-col min-h-0 relative space-y-4">
      <div className="flex items-center justify-end">
        <ViewToggle viewMode={viewMode} setViewMode={setViewMode} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={viewMode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex-1 flex flex-col min-h-0"
        >
          {viewMode === "list" || viewMode === "table" ? (
            <>
              <div className="flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden h-auto max-h-[calc(100vh-360px)]">
                <CRMDataTable containerClassName="border-0 shadow-none rounded-none flex-auto h-full overflow-auto" className="w-full">
                  <CRMTableHeader className="sticky top-0 z-10 bg-card shadow-sm">
                    <CRMTableRow>
                      <CRMTableHeaderCell 
                        className="cursor-pointer group select-none bg-card"
                        onClick={() => handleSort("name")}
                      >
                        <div className="flex items-center gap-2">
                          Team Member <CRMSortIndicator active={sortConfig?.key === "name"} direction={sortConfig?.direction} />
                        </div>
                      </CRMTableHeaderCell>
                      <CRMTableHeaderCell 
                        className="cursor-pointer group select-none"
                        onClick={() => handleSort("dealsClosed")}
                      >
                        <div className="flex items-center gap-2">
                          Deals Closed <CRMSortIndicator active={sortConfig?.key === "dealsClosed"} direction={sortConfig?.direction} />
                        </div>
                      </CRMTableHeaderCell>
                      <CRMTableHeaderCell className="bg-card">Revenue Target</CRMTableHeaderCell>
                      <CRMTableHeaderCell 
                        className="cursor-pointer group select-none bg-card"
                        onClick={() => handleSort("conversionRate")}
                      >
                        <div className="flex items-center gap-2">
                          Conversion <CRMSortIndicator active={sortConfig?.key === "conversionRate"} direction={sortConfig?.direction} />
                        </div>
                      </CRMTableHeaderCell>
                      <CRMTableHeaderCell className="text-right bg-card">Trend</CRMTableHeaderCell>
                    </CRMTableRow>
                  </CRMTableHeader>

                  <CRMTableBody>
                    {paginatedPerformance.length === 0 ? (
                      <CRMTableRow>
                        <CRMTableCell colSpan={5} className="h-24 text-center">
                          <div className="flex flex-col items-center justify-center text-muted-foreground space-y-1">
                            <Users className="h-8 w-8 text-slate-300" />
                            <p className="text-sm font-medium text-slate-500">No team performance data available</p>
                            <p className="text-xs text-slate-400">Assign leads to team members to see their performance here.</p>
                          </div>
                        </CRMTableCell>
                      </CRMTableRow>
                    ) : (
                      paginatedPerformance.map((item, idx) => (
                        <CRMTableRow key={item.id}>
                          <CRMTableCell>
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <Avatar className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-xs">
                                  <AvatarFallback>
                                    {item.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                {idx === 0 && (
                                  <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full shadow-sm">
                                    <Trophy className="w-3 h-3" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground transition-colors text-sm">{item.name}</p>
                                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Sales Representative</p>
                              </div>
                            </div>
                          </CRMTableCell>

                          <CRMTableCell>
                            <div className="flex items-center gap-2">
                              <span className="text-base font-bold text-foreground">{item.dealsClosed}</span>
                              <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Deals</span>
                            </div>
                          </CRMTableCell>

                          <CRMTableCell>
                            <div className="w-48 space-y-2">
                              <div className="flex justify-between text-[11px] font-bold">
                                <span className="text-foreground">{formatCurrency(item.revenueValue)}</span>
                              </div>
                              <Progress value={item.revenueValue > 0 ? 100 : 0} className="h-1.5" />
                            </div>
                          </CRMTableCell>

                          <CRMTableCell>
                            <Badge variant="outline" className="border-none bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
                              {item.conversionRate}
                            </Badge>
                          </CRMTableCell>

                          <CRMTableCell className="text-right">
                            <div className={cn(
                              "flex items-center justify-end gap-1.5 font-bold text-xs",
                              item.trendPositive ? "text-success" : "text-destructive"
                            )}>
                              {item.trendPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                              {item.trend}
                              <div className={cn(
                                "p-1 rounded-md ml-1",
                                item.trendPositive ? "bg-success/10" : "bg-destructive/10"
                              )}>
                                <ArrowUpRight className={cn("w-3 h-3", !item.trendPositive && "rotate-90")} />
                              </div>
                            </div>
                          </CRMTableCell>
                        </CRMTableRow>
                      ))
                    )}
                  </CRMTableBody>
                </CRMDataTable>
              </div>

              {sortedPerformance.length > 10 && (
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 bg-card border border-border rounded-xl p-4 shadow-sm flex-shrink-0">
                  <div className="text-sm text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
                    Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * rowsPerPage, sortedPerformance.length)}</span> of <span className="font-bold text-foreground">{new Intl.NumberFormat().format(sortedPerformance.length)}</span> Performers
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
            </>
          ) : (
            <PerformanceGrid performance={sortedPerformance} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default PerformanceTable;
