"use client";

import { cn } from "@/lib/utils";
import { CRMCard } from "./CRMCard";

interface CRMDataTableProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
}

export const crmTableStyles = {
  container: "overflow-hidden",
  table: "w-full border-collapse text-left text-sm",
  header: "border-b border-border bg-muted/20",
  body: "divide-y divide-border/50",
  row: "group h-16 border-b border-border/50 align-middle",
  rowInteractive: "cursor-pointer transition-colors duration-150 hover:bg-muted/[0.02]",
  cell: "h-16 px-6 py-4 align-middle text-sm",
  headerCell: "h-12 px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground",
} as const;

export const CRMDataTable = ({
  children,
  className,
  containerClassName,
}: CRMDataTableProps) => {
  return (
    <CRMCard noPadding withAccent={false} className={cn(crmTableStyles.container, containerClassName)}>
      <div className="overflow-x-auto">
        <table className={cn(crmTableStyles.table, className)}>
          {children}
        </table>
      </div>
    </CRMCard>
  );
};

export const CRMTableHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <thead className={cn(crmTableStyles.header, className)}>
    {children}
  </thead>
);

export const CRMTableBody = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <tbody className={cn(crmTableStyles.body, className)}>
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
      crmTableStyles.row,
      onClick && crmTableStyles.rowInteractive,
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
  <td className={cn(crmTableStyles.cell, className)} {...props}>
    {children}
  </td>
);

export const CRMTableHeaderCell = ({
  children,
  className,
  ...props
}: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th
    className={cn(crmTableStyles.headerCell, className)}
    {...props}
  >
    {children}
  </th>
);
