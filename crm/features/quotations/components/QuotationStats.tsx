import { FileText, Clock, CheckCircle2, LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/shared/ui/card";
import { Badge } from "@/shared/ui/badge";
import { MetricCardType } from "@/shared/types/common";
import { motion } from "framer-motion";
import { LineChart, Line } from "recharts";
import { ChartContainer } from "@/shared/components/charts/ChartContainer";

const iconMap: Record<string, LucideIcon> = {
  "Total Quotes": FileText,
  "Pending Approval": Clock,
  "Approved Quotes": CheckCircle2,
};

// Mock data for sparklines
const generateSparklineData = () => 
  Array.from({ length: 10 }, (_, i) => ({ value: ((i * 17) % 50) + 10 }));

interface QuotationStatsProps {
  stats: MetricCardType[];
}

const QuotationStats = ({ stats }: QuotationStatsProps) => {
  return (
    <div className="gap-6 grid grid-cols-1 md:grid-cols-3 min-w-0">
      {stats.map((item, index) => {
        const Icon = iconMap[item.title] || FileText;
        const sparklineData = generateSparklineData();
        const isPositive = item.positive;

        return (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="min-w-0"
          >
            <Card className="relative overflow-hidden group border-none shadow-elevated bg-card/80 backdrop-blur-xl rounded-xl min-w-0">
              {/* Decorative background gradient */}
              <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl opacity-10 transition-all group-hover:opacity-20
                ${item.title === 'Total Quotes' ? 'bg-blue-500' : 
                  item.title === 'Pending Approval' ? 'bg-amber-500' : 
                  'bg-emerald-500'}`} 
              />

              <CardContent className="p-7 relative z-10 min-w-0">
                <div className="flex justify-between items-start mb-6">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-500
                    ${item.title === 'Total Quotes' ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' : 
                      item.title === 'Pending Approval' ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white' : 
                      'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'}`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  
                  <div className="text-right">
                    <Badge className={`px-2.5 py-1 rounded-lg border-none font-bold text-xs flex items-center gap-1
                      ${isPositive ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {item.change}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-end justify-between gap-4 min-w-0">
                  <div className="min-w-0 shrink-0">
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{item.title}</p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-black text-foreground tracking-tighter">
                        {item.value}
                      </h2>
                    </div>
                  </div>

                  <div className="h-16 w-24 opacity-50 group-hover:opacity-100 transition-opacity duration-500 min-w-0">
                    <ChartContainer 
                      height="100%" 
                      hasData={sparklineData.length > 0}
                      className="w-full h-full"
                    >
                      <LineChart data={sparklineData}>
                        <Line
                          type="monotone"
                          dataKey="value"
                          stroke={item.title === 'Total Quotes' ? '#3b82f6' : 
                                  item.title === 'Pending Approval' ? '#f59e0b' : 
                                  '#10b981'}
                          strokeWidth={3}
                          dot={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  </div>
                </div>
                
                {/* Visual richness: bottom glow bar */}
                <div className={`absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full w-1/4
                  ${item.title === 'Total Quotes' ? 'bg-blue-500' : 
                    item.title === 'Pending Approval' ? 'bg-amber-500' : 
                    'bg-emerald-500'}`} 
                />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuotationStats;
