export interface AnalyticsTopStat {
  title: string;
  value: string;
  change: string;
  positive: boolean;
  sparklineData: { value: number }[];
}

export interface RevenuePoint { name: string; revenue: number; target: number; }
export interface LeadsGrowthPoint { name: string; direct: number; social: number; referral: number; }
export interface PipelineStage { stage: string; count: number; value: number; }
export interface TopAgent { id: number; name: string; deals: number; revenue: string; performance: number; avatar: string; }
export interface CustomerGrowthPoint { month: string; new: number; churned: number; }
export interface RecentActivityItem { id: number; type: string; user: string; detail: string; time: string; }

export interface AnalyticsDataType {
  topStats: AnalyticsTopStat[];
  revenueOverview: RevenuePoint[];
  leadsGrowth: LeadsGrowthPoint[];
  pipelineStages: PipelineStage[];
  topAgents: TopAgent[];
  customerGrowth: CustomerGrowthPoint[];
  recentActivity: RecentActivityItem[];
  conversionStats?: {
    averageRate: string;
    qualified: string;
    won: string;
    target: string;
  };
}











