"use client";

import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TrendingDown, TrendingUp, Trophy, ArrowUpRight } from "lucide-react";
import { PerformanceType } from "@/types/report";
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { 
  CRMDataTable, 
  CRMTableHeader, 
  CRMTableBody, 
  CRMTableRow, 
  CRMTableCell, 
  CRMTableHeaderCell,
  CRMCard 
} from "@/components/shared/crm";
import { cn } from "@/lib/utils";

interface PerformanceTableProps {
  performance: PerformanceType[];
}

const PerformanceTable = ({ performance }: PerformanceTableProps) => {
  return (
    <CRMDataTable>
      <CRMTableHeader>
        <CRMTableRow className="hover:bg-transparent">
          <CRMTableHeaderCell>Team Member</CRMTableHeaderCell>
          <CRMTableHeaderCell>Deals Closed</CRMTableHeaderCell>
          <CRMTableHeaderCell>Revenue Target</CRMTableHeaderCell>
          <CRMTableHeaderCell>Conversion</CRMTableHeaderCell>
          <CRMTableHeaderCell className="text-right">Trend</CRMTableHeaderCell>
        </CRMTableRow>
      </CRMTableHeader>

      <CRMTableBody>
        {performance.map((item, idx) => (
          <CRMTableRow key={item.id}>
            <CRMTableCell>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="w-10 h-10 rounded-lg border border-border bg-muted flex items-center justify-center font-bold text-xs">
                    <AvatarFallback>
                      {item.name.split(' ').map((n: string) => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {idx === 0 && (
                    <div className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full shadow-sm">
                      <Trophy className="w-3 h-3" />
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">{item.name}</p>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Senior Executive</p>
                </div>
              </div>
            </CRMTableCell>

            <CRMTableCell>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">{item.dealsClosed}</span>
                <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Deals</span>
              </div>
            </CRMTableCell>

            <CRMTableCell>
              <div className="w-48 space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-foreground">{item.revenue}</span>
                  <span className="text-muted-foreground">85% of Goal</span>
                </div>
                <Progress value={85} className="h-1.5" />
              </div>
            </CRMTableCell>

            <CRMTableCell>
              <Badge variant="outline" className="border-none bg-primary/10 text-primary px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase tracking-wider">
                {item.conversionRate}
              </Badge>
            </CRMTableCell>

            <CRMTableCell className="text-right">
              <div className={cn(
                "flex items-center justify-end gap-1.5 font-bold text-xs",
                item.trendPositive ? "text-success" : "text-destructive"
              )}>
                {item.trendPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {item.trend}
                <div className={cn(
                  "p-1 rounded-md ml-1",
                  item.trendPositive ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <ArrowUpRight className={cn("w-3 h-3", !item.trendPositive && "rotate-90")} />
                </div>
              </div>
            </CRMTableCell>
          </CRMTableRow>
        ))}
      </CRMTableBody>
    </CRMDataTable>
  );
};

export default PerformanceTable;
