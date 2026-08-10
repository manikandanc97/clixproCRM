export interface MetricCardType {
  title: string;
  value: string;
  valueAmount?: number;
  change: string;
  positive: boolean;
  color?: "primary" | "emerald" | "blue" | "purple" | "orange" | "pink" | "indigo" | "slate";
  sparklineData?: { value: number }[];
}











