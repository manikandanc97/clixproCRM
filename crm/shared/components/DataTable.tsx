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
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  className,
  wrapperClassName,
  rowClassName,
  emptyMessage = "No data available.",
}: DataTableProps<T>) {
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
          <TableRow>
            <TableCell 
              colSpan={columns.length} 
              className="h-32 text-center text-muted-foreground"
            >
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}





