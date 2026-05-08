"use client";

import {
  Users,
  UserPlus,
  DollarSign,
  Clock,
  TrendingUp,
  TrendingDown,
  LucideIcon,
} from "lucide-react";
import { StatCardType } from "@/types/dashboard";
import { motion, useSpring, useTransform } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";

const iconMap: Record<string, LucideIcon> = {
  "Total Leads": Users,
  "New Customers": UserPlus,
  Revenue: DollarSign,
  "Pending Tasks": Clock,
};

const colorMap: Record<string, string> = {
  "Total Leads": "from-blue-500 to-indigo-600",
  "New Customers": "from-emerald-500 to-teal-600",
  Revenue: "from-amber-500 to-orange-600",
  "Pending Tasks": "from-rose-500 to-red-600",
};

const strokeMap: Record<string, string> = {
  "Total Leads": "#6366f1",
  "New Customers": "#10b981",
  Revenue: "#f59e0b",
  "Pending Tasks": "#f43f5e",
};

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface StatsCardsProps {
  stats: StatCardType[];
}

const generateSparklineData = (positive: boolean) => {
  return Array.from({ length: 7 }).map((_, i) => ({
    value: positive
      ? 20 + i * 5 + Math.random() * 10
      : 50 - i * 3 + Math.random() * 10,
  }));
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 } as const,
  },
};

const AnimatedNumber = ({ value }: { value: string }) => {
  // Extract number from string like "$45,231" or "1,234"
  const numValue = parseFloat(value.replace(/[^0-9.-]+/g, ""));
  const prefix = value.match(/^[^0-9.-]+/)?.[0] || "";
  const suffix = value.match(/[^0-9.-]+$/)?.[0] || "";

  const springValue = useSpring(0, { bounce: 0, duration: 2000 });
  const displayValue = useTransform(springValue, (current) => {
    return prefix + Math.round(current).toLocaleString() + suffix;
  });

  useEffect(() => {
    springValue.set(numValue || 0);
  }, [numValue, springValue]);

  // If we couldn't parse a number, just return the string
  if (isNaN(numValue)) return <>{value}</>;

  return <motion.span>{displayValue}</motion.span>;
};

import { CRMMetricCard, MetricColor } from "@/components/shared/crm/CRMMetricCard";

const StatsCards = ({ stats }: StatsCardsProps) => {
  const colorMapping: Record<string, MetricColor> = {
    "Total Leads": "blue",
    "New Customers": "emerald",
    "Revenue": "orange",
    "Pending Tasks": "pink",
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="gap-6 lg:gap-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4"
    >
      {stats.map((item, idx) => {
        const Icon = iconMap[item.title] || Users;
        const color = colorMapping[item.title] || "slate";
        const sparklineData = generateSparklineData(item.positive);

        return (
          <CRMMetricCard
            key={item.title}
            title={item.title}
            value={item.value}
            change={item.change}
            trend={item.positive ? "up" : "down"}
            icon={Icon}
            color={color}
            sparklineData={sparklineData}
            delay={idx * 0.1}
          />
        );
      })}
    </motion.div>
  );
};

export default StatsCards;
