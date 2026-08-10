// report types

import { MetricCardType } from "./common";

export interface RevenueChartPointType {
  name: string;
  total: number;
}

export interface ConversionChartPointType {
  name: string;
  value: number;
}

export interface FunnelPointType {
  stage: string;
  count: number;
  percentage: number;
}

export interface ActivityHeatmapPointType {
  day: string;
  hour: string;
  value: number;
}

export interface ReportInsightType {
  id: string;
  title: string;
  description: string;
  type: "revenue" | "leads" | "team";
}

export interface RevenueTargetType {
  revenue: number;
  target: number;
  change: string;
  positive: boolean;
}

export interface PerformanceType {
  id: string;
  name: string;
  dealsClosed: number;
  revenue: string;
  revenueValue: number;
  conversionRate: string;
  trend: string;
  trendPositive: boolean;
}

export interface LeadSourceType {
  name: string;
  value: number;
}

export interface TopCustomerType {
  id: string;
  name: string;
  company: string;
  revenue: number;
}

export interface RecentActivityType {
  id: string;
  action: string;
  description: string | null;
  createdAt: string;
  userName?: string;
  leadName?: string;
}

export interface UpcomingFollowUpType {
  id: string;
  title: string;
  type: "TASK" | "MEETING";
  date: string;
  status: string;
}

export interface SalesActivityType {
  name: string;
  value: number;
}

export interface ReportsDataType {
  stats: MetricCardType[];
  revenueChart: RevenueChartPointType[];
  conversionChart: ConversionChartPointType[];
  performance: PerformanceType[];
  funnel: FunnelPointType[];
  activityHeatmap: ActivityHeatmapPointType[];
  insights: ReportInsightType[];
  revenueTarget: RevenueTargetType | null;
  leadSources: LeadSourceType[];
  topCustomers: TopCustomerType[];
  recentActivities: RecentActivityType[];
  upcomingFollowUps: UpcomingFollowUpType[];
  salesActivities: SalesActivityType[];
}











