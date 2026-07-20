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
  rowClassName?: string | ((item: T) => string);
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  className,
  rowClassName,
  emptyMessage = "No data available.",
}: DataTableProps<T>) {
  return (
    <Table className={cn("min-w-full", className)}>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {columns.map((column, index) => (
            <TableHead 
              key={index} 
              className={cn("bg-muted/5", column.headerClassName)}
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





