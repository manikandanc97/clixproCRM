"use client";

import * as React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/shared/ui/table";
import { cn } from "@/shared/lib/utils";
import { EmptyState } from "@/shared/components/EmptyState";
import { LucideIcon } from "lucide-react";

interface DataTableProps<T> {
  data: T[];
  columns: {
    header: string | React.ReactNode;
    cell: (item: T) => React.ReactNode;
    className?: string;
    headerClassName?: string;
  }[];
  onRowClick?: (item: T) => void;
  className?: string;
  wrapperClassName?: string;
  rowClassName?: string | ((item: T) => string);
  emptyMessage?: string | React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  className,
  wrapperClassName,
  rowClassName,
  emptyMessage,
  emptyTitle = "No data available",
  emptyDescription = "There are no records matching your criteria.",
  emptyIcon,
}: DataTableProps<T>) {
  const renderEmptyState = () => {
    if (React.isValidElement(emptyMessage)) {
      return emptyMessage;
    }

    const title = typeof emptyMessage === "string" ? emptyMessage : emptyTitle;

    return (
      <EmptyState 
        icon={emptyIcon}
        title={title}
        description={emptyDescription}
        className="border-none bg-transparent shadow-none p-6 min-h-[220px]"
      />
    );
  };

  return (
    <Table className={cn("min-w-full", className)} wrapperClassName={wrapperClassName}>
      <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
        <TableRow className="hover:bg-transparent border-b">
          {columns.map((column, index) => (
            <TableHead 
              key={index} 
              className={cn("bg-card text-muted-foreground", column.headerClassName, column.className)}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.length > 0 ? (
          data.map((item, rowIndex) => (
            <TableRow
              key={rowIndex}
              onClick={() => onRowClick?.(item)}
              className={cn(
                onRowClick && "cursor-pointer transition-colors hover:bg-muted/[0.03]",
                typeof rowClassName === "function" ? rowClassName(item) : rowClassName
              )}
            >
              {columns.map((column, colIndex) => (
                <TableCell key={colIndex} className={column.className}>
                  {column.cell(item)}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow className="hover:bg-transparent border-0">
            <TableCell 
              colSpan={columns.length} 
              className="p-4 text-center text-muted-foreground border-0"
            >
              {renderEmptyState()}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
