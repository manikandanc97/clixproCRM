"use client";

import { 
  Badge 
} from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  MoreHorizontal, 
  FileText, 
  Send, 
  Download, 
  ExternalLink, 
  Trash2, 
  Eye, 
  Sparkles,
  Zap,
  Copy,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { QuotationType } from "@/types/quotation";
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
} from "@/components/shared/crm";
import { cn } from "@/lib/utils";
import { useCRMStore } from "@/store/useCRMStore";
import { toast } from "sonner";

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

  const { deleteQuotation } = useCRMStore();

  const sortedQuotations = useMemo(() => {
    if (!sortConfig) return quotations;
    return [...quotations].sort((a, b) => {
      const aVal = a[sortConfig.key] ?? "";
      const bVal = b[sortConfig.key] ?? "";
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

  const handleDelete = (e: React.MouseEvent | Event, id: string, quoteId: string) => {
    e.stopPropagation();
    deleteQuotation(id);
    toast.error("Quotation Removed", {
      description: `Quote ${quoteId} has been deleted successfully.`,
    });
  };

  const handleAction = (action: string, quote: QuotationType) => {
    toast.info(`${action}: ${quote.quoteId}`, {
      description: `Initiating ${action.toLowerCase()} for ${quote.client}.`,
    });
  };

  return (
    <>
      <CRMDataTable>
        <CRMTableHeader>
          <CRMTableRow className="hover:bg-transparent">
            <CRMTableHeaderCell 
              className="hidden sm:table-cell cursor-pointer group select-none"
              onClick={() => handleSort("quoteId")}
            >
              <div className="flex items-center gap-2">
                Identifier <CRMSortIndicator active={sortConfig?.key === "quoteId"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell 
              className="cursor-pointer group select-none"
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
            <CRMTableHeaderCell className="hidden lg:table-cell">Intelligence</CRMTableHeaderCell>
            <CRMTableHeaderCell 
              className="cursor-pointer group select-none"
              onClick={() => handleSort("status")}
            >
              <div className="flex items-center gap-2">
                Status <CRMSortIndicator active={sortConfig?.key === "status"} direction={sortConfig?.direction} />
              </div>
            </CRMTableHeaderCell>
            <CRMTableHeaderCell className="text-right">Actions</CRMTableHeaderCell>
          </CRMTableRow>
        </CRMTableHeader>

        <CRMTableBody>
          <AnimatePresence mode="popLayout">
            {sortedQuotations.map((quote, index) => (
              <CRMTableRow
                key={quote.id}
                onClick={() => setSelectedQuote(quote)}
              >
                <CRMTableCell className="hidden sm:table-cell">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center border border-border group-hover:bg-background transition-colors">
                      <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors">{quote.quoteId}</p>
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
                        <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-wider">{quote.createdBy}</span>
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
                    quote.status === 'Approved' ? 'bg-success text-success-foreground' : 
                    quote.status === 'Pending' ? 'bg-warning/20 text-warning' : 
                    quote.status === 'Expired' ? 'bg-destructive/10 text-destructive' :
                    'bg-muted text-muted-foreground'
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

      <QuotationPreview 
        quotation={selectedQuote}
        isOpen={!!selectedQuote}
        onClose={() => setSelectedQuote(null)}
      />
    </>
  );
};

export default QuotationsTable;

