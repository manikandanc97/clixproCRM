// report types

import { MetricCardType } from "./common";

export interface RevenueChartPointType {
  name: string;
  revenue: number;
}

export interface ConversionChartPointType {
  name: string;
  value: number;
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

export interface ReportsDataType {
  stats: MetricCardType[];
  revenueChart: RevenueChartPointType[];
  conversionChart: ConversionChartPointType[];
  performance: PerformanceType[];
}
