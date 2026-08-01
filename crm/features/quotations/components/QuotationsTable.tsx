"use client";

import { 
  Badge 
} from "@/shared/ui/badge";
import { Avatar, AvatarFallback } from "@/shared/ui/avatar";
import { Button } from "@/shared/ui/button";
import { 
  MoreHorizontal, 
  FileText, 
  Send, 
  Download, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Copy,
  Clock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/shared/ui/dropdown-menu";
import { QuotationType } from "@/shared/types/quotation";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import QuotationPreview from "./QuotationPreview";
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
import { toast } from "sonner";
import { useDeleteQuotation } from "@/shared/hooks/use-crm";

interface QuotationsTableProps {
  quotations: QuotationType[];
}

type SortConfig = {
  key: keyof QuotationType;
  direction: "asc" | "desc";
} | null;

const ProbabilityIndicator = ({ value }: { value: number }) => {
  const color = value > 80 ? "text-success" : value > 60 ? "text-warning" : "text-muted-foreground";
  return (
    <div className="flex items-center gap-2 group/prob">
      <div className="relative w-8 h-8">
        <svg className="w-full h-full" viewBox="0 0 36 36">
          <path
            className="text-muted/30"
            strokeDasharray="100, 100"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <motion.path
            initial={{ strokeDasharray: "0, 100" }}
            animate={{ strokeDasharray: `${value}, 100` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={cn(color)}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold">
          {value}%
        </div>
      </div>
      <span className={cn("text-[10px] font-bold uppercase tracking-wider opacity-0 group-hover/prob:opacity-100 transition-opacity", color)}>
        Prob.
      </span>
    </div>
  );
};

const QuotationsTable = ({ quotations }: QuotationsTableProps) => {
  const [selectedQuote, setSelectedQuote] = useState<QuotationType | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const { mutate: deleteQuotationMutation } = useDeleteQuotation();

  const sortedQuotations = useMemo(() => {
    if (!sortConfig) return quotations;
    return [...quotations].sort((a, b) => {
      let aVal: string | number = (a[sortConfig.key] as string | number) ?? "";
      let bVal: string | number = (b[sortConfig.key] as string | number) ?? "";
      
      if (sortConfig.key === "amount" as keyof QuotationType) {
        aVal = a.amountValue ?? 0;
        bVal = b.amountValue ?? 0;
      }
      
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [quotations, sortConfig]);

  const handleSort = (key: keyof QuotationType) => {
    setSortConfig((prev) => {
      if (prev?.key === key) {
        if (prev.direction === "asc") return { key, direction: "desc" };
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = (e: React.MouseEvent | Event, id: string, _quoteId: string) => {
    e.stopPropagation();
    deleteQuotationMutation(id);
  };

  const handleAction = (action: string, quote: QuotationType) => {
    toast.info(`${action}: ${quote.quoteId}`, {
      description: `Initiating ${action.toLowerCase()} for ${quote.client}.`,
    });
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(sortedQuotations.length / rowsPerPage);
  const paginatedQuotations = sortedQuotations.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-auto flex flex-col min-h-0 relative">
      <div className="flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden h-auto max-h-[calc(100vh-360px)]">
      <CRMDataTable containerClassName="border-0 shadow-none rounded-none flex-auto h-full overflow-auto" className="w-full">
        <CRMTableHeader className="sticky top-0 z-10 bg-card shadow-sm">
          <CRMTableRow>
            <CRMTableHeaderCell 
              className="hidden sm:table-cell cursor-pointer group select-none"
              onClick={() => handleSort("quoteId")}
            >
              <div className="flex items-center gap-2">
                Identifier <CRMSortIndicator active={sortConfig?.key === "quoteId"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell 
              className="cursor-pointer group select-none bg-card"
              onClick={() => handleSort("client")}
            >
              <div className="flex items-center gap-2">
                Client Relationship <CRMSortIndicator active={sortConfig?.key === "client"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell 
              className="hidden md:table-cell cursor-pointer group select-none"
              onClick={() => handleSort("amount")}
            >
              <div className="flex items-center gap-2">
                Deal Size <CRMSortIndicator active={sortConfig?.key === "amount"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell className="hidden lg:table-cell bg-card">Intelligence</CRMTableHeaderCell>
            <CRMTableHeaderCell 
              className="cursor-pointer group select-none bg-card"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center gap-2">
                Status <CRMSortIndicator active={sortConfig?.key === "status"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell className="text-right bg-card">Actions</CRMTableHeaderCell>
          </CRMTableRow>
        </CRMTableHeader>

        <CRMTableBody>
          <AnimatePresence mode="popLayout">
            {paginatedQuotations.map((quote) => (
              <CRMTableRow
                key={quote.id}
                onClick={() => setSelectedQuote(quote)}
              >
                <CRMTableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center border border-border transition-colors">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm tracking-tight transition-colors">{quote.quoteId}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">May 2026</p>
                    </div>
                  </div>
                </CRMTableCell>

                <CRMTableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-9 h-9 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-xs">
                      <AvatarFallback>
                        {quote.client.split(' ').map((n: string) => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground text-sm tracking-tight">{quote.client}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{"System"}</span>
                        <span className="hidden sm:inline w-1 h-1 rounded-full bg-border" />
                        <span className="hidden sm:inline text-[9px] font-bold text-primary uppercase tracking-wider">VIP</span>
                      </div>
                    </div>
                  </div>
                </CRMTableCell>

                <CRMTableCell className="hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="font-bold text-foreground text-sm tracking-tight">{quote.amount}</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">Excl. Tax</span>
                  </div>
                </CRMTableCell>

                <CRMTableCell className="hidden lg:table-cell">
                  <div className="flex items-center gap-6">
                    <ProbabilityIndicator value={quote.probability || 0} />
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Eye className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold">{quote.viewCount || 0}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">2h ago</span>
                      </div>
                    </div>
                  </div>
                </CRMTableCell>

                <CRMTableCell>
                  <Badge variant="outline" className={cn(
                    "border-none px-3 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-widest shadow-sm",
                    quote.status === "APPROVED" && "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
                    quote.status === "PENDING" && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    quote.status === "EXPIRED" && "bg-rose-500/10 text-rose-600 border-rose-500/20",
                    !['APPROVED', 'PENDING', 'EXPIRED'].includes(quote.status) && 'bg-muted text-muted-foreground'
                  )}>
                    {quote.status}
                  </Badge>
                </CRMTableCell>

                <CRMTableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setSelectedQuote(quote)}>
                        <ExternalLink className="w-3.5 h-3.5 mr-2" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Email", quote)}>
                        <Send className="w-3.5 h-3.5 mr-2" /> Send to Client
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAction("Download", quote)}>
                        <Download className="w-3.5 h-3.5 mr-2" /> Download PDF
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleAction("Duplicate", quote)}>
                        <Copy className="w-3.5 h-3.5 mr-2" /> Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => handleDelete(e, quote.id, quote.quoteId)} variant="destructive">
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CRMTableCell>
              </CRMTableRow>
            ))}
          </AnimatePresence>
        </CRMTableBody>
      </CRMDataTable>
      </div>

      {sortedQuotations.length > 10 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 bg-card border border-border rounded-xl p-4 shadow-sm flex-shrink-0">
          <div className="text-sm text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * rowsPerPage, sortedQuotations.length)}</span> of <span className="font-bold text-foreground">{new Intl.NumberFormat().format(sortedQuotations.length)}</span> Quotes
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

      <QuotationPreview 
        quotation={selectedQuote}
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
      />
    </div>
  );
};

export default QuotationsTable;
