"use client";

import React from "react";
import { Users, Building2, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/shared/ui/card";
import { TopCustomerType } from "@/shared/types/report";
import { motion } from "framer-motion";
import { useCurrency } from "@/shared/hooks/use-currency";
import { EmptyStateCard } from "@/shared/components/page-states";

interface TopCustomersProps {
  data: TopCustomerType[];
  loading?: boolean;
}

const TopCustomers = ({ data, loading: _loading }: TopCustomersProps) => {
  const { formatCurrency } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="h-full flex flex-col"
    >
      <Card className="bg-card rounded-xl border-border shadow-sm overflow-hidden h-full flex flex-col flex-1">
        <CardHeader className="flex flex-row items-center justify-between p-6 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CardTitle className="font-bold text-foreground text-lg tracking-tight">Top Customers</CardTitle>
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <CardDescription className="text-muted-foreground text-xs mt-1">Highest revenue generating clients</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-0 min-w-0 flex-1 overflow-y-auto max-h-[400px]">
          {!data || data.length === 0 ? (
            <div className="p-6">
              <EmptyStateCard 
                icon={Users} 
                title="No customers yet" 
                message="Win deals to see your top customers here." 
              />
            </div>
          ) : (
            <div className="divide-y divide-border">
              {data.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                      index === 0 ? 'bg-amber-100 text-amber-600' :
                      index === 1 ? 'bg-slate-100 text-slate-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{customer.name}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <Building2 className="w-3 h-3" />
                        {customer.company}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-foreground">{formatCurrency(customer.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default React.memo(TopCustomers);
