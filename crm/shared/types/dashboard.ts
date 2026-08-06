// dashboard types

import { MetricCardType } from "./common";

export type StatCardType = MetricCardType;

export interface DashboardStatType {
  title: string;
  value: string;
  valueAmount?: number;
  change: string;
  positive: boolean;
}

export interface ActivityType {
  id: string;
  title: string;
  time: string;
}

export interface SalesChartPointType {
  name: string;
  value: number;
}

export interface DashboardDataType {
  stats: StatCardType[];
  recentActivities: ActivityType[];
  salesChartData: SalesChartPointType[];
  activeUsers?: number;
  liveTraffic?: number;
  weeklyGrowth?: number;
  liveTrafficGrowth?: number;
  activeUsersGrowth?: number;
  revenueTarget?: any; // We can use 'any' or import RevenueTargetType
}
