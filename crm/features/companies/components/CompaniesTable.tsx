"use client";

import { useState } from "react";
import {
  MoreVertical, 
  Building2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Edit
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
import { Checkbox } from "@/shared/ui/checkbox";
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge, StatusVariant } from "@/shared/components/StatusBadge";
import { useCompanies } from "../hooks/useCompanies";

interface CompaniesTableProps {
  companies: any[];
  onEdit?: (company: any) => void;
  onDelete?: (id: string) => void;
}

const statusVariantMap: Record<string, StatusVariant> = {
  "ACTIVE": "emerald",
  "INACTIVE": "neutral",
  "LEAD": "blue"
};

export const CompaniesTable = ({ companies, onEdit, onDelete }: CompaniesTableProps) => {
  const {
    sortedCompanies,
    selectedIds,
    handleSort,
    toggleSelectAll,
    toggleSelect,
  } = useCompanies(companies);

  const columns = [
    {
      header: (
        <Checkbox 
          checked={selectedIds.length === companies.length && companies.length > 0}
          onCheckedChange={toggleSelectAll}
        />
      ),
      cell: (company: any) => (
        <Checkbox 
          checked={selectedIds.includes(company.id)}
          onCheckedChange={() => toggleSelect(company.id)}
          onClick={(e) => e.stopPropagation()}
        />
      ),
      className: "w-[50px]",
    },
    {
      header: (
        <div 
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => handleSort("name")}
        >
          Company
        </div>
      ),
      cell: (company: any) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 rounded-xl border border-border bg-muted">
            <AvatarFallback className="font-bold text-[10px]">
              {company.name ? company.name.substring(0, 2).toUpperCase() : "CO"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-none mb-1">{company.name}</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{company.industry || "No Industry"}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (company: any) => (
        <StatusBadge 
          status={company.status || "ACTIVE"} 
          variant={statusVariantMap[company.status] || "emerald"} 
        />
      ),
    },
    {
      header: "Customers",
      cell: (company: any) => {
        const count = company._count?.customers || 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{count}</span>
          </div>
        );
      },
    },
    {
      header: "Deals",
      cell: (company: any) => {
        const count = company._count?.deals || 0;
        return (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{count}</span>
          </div>
        );
      },
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cell: (company: any) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreVertical className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => onEdit?.(company)}>
                <Edit className="size-3.5 mr-2" /> Edit Company
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-rose-600 focus:text-rose-600"
                onClick={() => onDelete?.(company.id)}
              >
                <Trash2 className="size-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const totalPages = Math.ceil(sortedCompanies.length / rowsPerPage);
  const paginatedCompanies = sortedCompanies.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <div className="flex-auto flex flex-col min-h-0 relative">
      <div className="flex flex-col bg-card rounded-xl border border-border shadow-sm overflow-hidden h-auto max-h-[calc(100vh-360px)]">
        <DataTable 
          data={paginatedCompanies}
          columns={columns}
          wrapperClassName="flex-auto overflow-auto relative"
          rowClassName="h-16 hover:bg-muted/30 transition-colors"
          onRowClick={(row) => onEdit?.(row)}
        />
      </div>

      {sortedCompanies.length > 10 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 bg-card border border-border rounded-xl p-4 shadow-sm flex-shrink-0">
          <div className="text-sm text-muted-foreground font-medium w-full md:w-auto text-center md:text-left">
            Showing <span className="font-bold text-foreground">{(currentPage - 1) * rowsPerPage + 1}</span>–<span className="font-bold text-foreground">{Math.min(currentPage * rowsPerPage, sortedCompanies.length)}</span> of <span className="font-bold text-foreground">{new Intl.NumberFormat().format(sortedCompanies.length)}</span> Companies
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
