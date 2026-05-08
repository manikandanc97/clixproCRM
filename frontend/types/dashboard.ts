// dashboard types

import { MetricCardType } from "./common";

export type StatCardType = MetricCardType;

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
}
