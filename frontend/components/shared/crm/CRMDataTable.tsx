"use client";

import { cn } from "@/lib/utils";
import { CRMCard } from "./CRMCard";

interface CRMDataTableProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const CRMDataTable = ({
  children,
  className,
  containerClassName,
}: CRMDataTableProps) => {
  return (
    <CRMCard noPadding className={cn("overflow-hidden", containerClassName)}>
      <div className="overflow-x-auto">
        <table className={cn("w-full text-left border-collapse", className)}>
          {children}
        </table>
      </div>
    </CRMCard>
  );
};

export const CRMTableHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <thead className={cn("bg-muted/30 border-b border-border", className)}>
    {children}
  </thead>
);

export const CRMTableBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tbody className={cn("divide-y divide-border/50", className)}>
    {children}
  </tbody>
);

export const CRMTableRow = ({
  children,
  className,
  onClick,
  ...props
}: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr 
    className={cn(
      "group hover:bg-muted/30 transition-colors", 
      onClick && "cursor-pointer",
      className
    )}
    onClick={onClick}
    {...props}
  >
    {children}
  </tr>
);

export const CRMTableCell = ({
  children,
  className,
  ...props
}: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("py-4 px-6 text-sm align-middle", className)} {...props}>
    {children}
  </td>
);

export const CRMTableHeaderCell = ({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn("py-4 px-6 text-[11px] font-bold text-muted-foreground uppercase tracking-widest text-left", className)}
    {...props}
  >
    {children}
  </th>
);
