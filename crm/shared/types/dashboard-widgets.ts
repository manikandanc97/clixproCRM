export interface ApiNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "lead" | "task" | "quote" | "system";
  read: boolean;
}

export interface NotificationsDataType {
  notifications: ApiNotification[];
}

export interface HotLead {
  id: string;
  name: string;
  company: string;
  value: string;
  score: number;
  status: string;
}

export interface HotLeadsDataType {
  leads: HotLead[];
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  sales: number;
  target: number;
  revenue: string;
  }

export interface TeamPerformanceDataType {
  team: TeamMember[];
}

export interface AiInsightItem {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  tag: string;
  color: string;
  bgColor: string;
}

export interface AiForecastPoint {
  name: string;
  revenue: number;
  prediction: number;
}

export interface AiTimelineItem {
  id: string;
  title: string;
  description: string;
  time: string;
  icon?: import("lucide-react").LucideIcon | React.ElementType;
}

export interface AiInsightStat {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  color: string;
  sparklineData: { value: number }[];
}

export interface AiInsightsDataType {
  stats: AiInsightStat[];
  recommendations: AiInsightItem[];
  alerts: AiInsightItem[];
  trends: AiInsightItem[];
  forecastData: AiForecastPoint[];
  timeline: AiTimelineItem[];
}











