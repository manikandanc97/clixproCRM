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
  <thead className={cn("border-b border-border bg-muted/30", className)}>
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
      "group h-16 transition-colors hover:bg-muted/30", 
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
  <td className={cn("h-16 px-6 py-4 text-sm align-middle", className)} {...props}>
    {children}
  </td>
);

export const CRMTableHeaderCell = ({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn("h-12 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground", className)}
    {...props}
  >
    {children}
  </th>
);
