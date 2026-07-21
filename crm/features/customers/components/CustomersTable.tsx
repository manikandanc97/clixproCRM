"use client";

import { 
  MoreVertical, 
  Mail, 
  Phone, 
  TrendingUp, 
  ExternalLink,
  ShieldCheck,
  User,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/avatar";
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
import { DataTable } from "@/shared/components/DataTable";
import { StatusBadge, StatusVariant } from "@/shared/components/StatusBadge";
import { useCustomers } from "../hooks/useCustomers";
import { cn } from "@/shared/lib/utils";

interface CustomersTableProps {
  customers: CustomerType[];
}

const statusVariantMap: Record<string, StatusVariant> = {
  "Active": "emerald",
  "Inactive": "neutral",
  "At Risk": "amber",
  "Churned": "rose",
  "VIP": "indigo",
};

export const CustomersTable = ({ customers }: CustomersTableProps) => {
  const {
    sortedCustomers,
    selectedIds,
    handleSort,
    toggleSelectAll,
    toggleSelect,
  } = useCustomers(customers);

  const columns = [
    {
      header: (
        <Checkbox 
          checked={selectedIds.length === customers.length && customers.length > 0}
          onCheckedChange={toggleSelectAll}
        />
      ),
      cell: (customer: CustomerType) => (
        <Checkbox 
          checked={selectedIds.includes(customer.id)}
          onCheckedChange={() => toggleSelect(customer.id)}
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
          Customer
        </div>
      ),
      cell: (customer: CustomerType) => (
        <div className="flex items-center gap-3">
          <Avatar className="w-9 h-9 rounded-xl border border-border">
            <AvatarImage src={""} />
            <AvatarFallback className="font-bold text-[10px]">{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-foreground leading-none mb-1">{customer.name}</span>
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{customer.company}</span>
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      cell: (customer: CustomerType) => (
        <StatusBadge 
          status={customer.status} 
          variant={statusVariantMap[customer.status]} 
        />
      ),
    },
    {
      header: "LTV",
      cell: (customer: CustomerType) => (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-foreground">{customer.ltv}</span>
          <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase">
            <TrendingUp className="size-3" />
            +14%
          </div>
        </div>
      ),
    },
    {
      header: "Trust Score",
      cell: (customer: CustomerType) => (
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 rounded-full bg-muted overflow-hidden">
            <div 
              className="h-full bg-primary" 
              style={{ width: `${customer.healthScore}%` }} 
            />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground">{customer.healthScore}%</span>
        </div>
      ),
    },
    {
      header: "Actions",
      headerClassName: "text-right",
      cell: (customer: CustomerType) => (
        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary">
            <Mail className="size-3.5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreVertical className="size-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem><User className="size-3.5 mr-2" /> View Profile</DropdownMenuItem>
              <DropdownMenuItem><ExternalLink className="size-3.5 mr-2" /> Open Portal</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-rose-600 focus:text-rose-600">
                <Trash2 className="size-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      className: "text-right",
    },
  ];

  return (
    <DataTable 
      data={sortedCustomers}
      columns={columns}
      onRowClick={() => {}}
    />
  );
};




