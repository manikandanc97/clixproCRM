export const ANALYTICS_DATA = {
  topStats: [
    {
      title: "Total Revenue",
      value: "$428,500",
      change: "+12.5%",
      trend: "up" as const,
      color: "emerald" as const,
      sparklineData: [
        { value: 400 }, { value: 420 }, { value: 380 }, { value: 450 }, 
        { value: 480 }, { value: 460 }, { value: 500 }, { value: 520 }
      ]
    },
    {
      title: "Total Leads",
      value: "2,450",
      change: "+18.2%",
      trend: "up" as const,
      color: "blue" as const,
      sparklineData: [
        { value: 180 }, { value: 200 }, { value: 220 }, { value: 210 }, 
        { value: 240 }, { value: 260 }, { value: 280 }, { value: 300 }
      ]
    },
    {
      title: "Conversion Rate",
      value: "24.5%",
      change: "-2.4%",
      trend: "down" as const,
      color: "orange" as const,
      sparklineData: [
        { value: 26 }, { value: 25 }, { value: 27 }, { value: 24 }, 
        { value: 25 }, { value: 23 }, { value: 24 }, { value: 24.5 }
      ]
    },
    {
      title: "Active Customers",
      value: "1,280",
      change: "+5.1%",
      trend: "up" as const,
      color: "purple" as const,
      sparklineData: [
        { value: 1100 }, { value: 1150 }, { value: 1180 }, { value: 1200 }, 
        { value: 1220 }, { value: 1240 }, { value: 1260 }, { value: 1280 }
      ]
    }
  ],
  revenueOverview: [
    { name: "Jan", revenue: 45000, target: 40000 },
    { name: "Feb", revenue: 52000, target: 45000 },
    { name: "Mar", revenue: 48000, target: 50000 },
    { name: "Apr", revenue: 61000, target: 55000 },
    { name: "May", revenue: 55000, target: 55000 },
    { name: "Jun", revenue: 67000, target: 60000 },
    { name: "Jul", revenue: 72000, target: 65000 },
  ],
  leadsGrowth: [
    { name: "Week 1", direct: 120, social: 80, referral: 50 },
    { name: "Week 2", direct: 140, social: 95, referral: 60 },
    { name: "Week 3", direct: 110, social: 120, referral: 45 },
    { name: "Week 4", direct: 160, social: 110, referral: 70 },
  ],
  pipelineStages: [
    { stage: "Discovery", count: 450, value: 125000 },
    { stage: "Proposal", count: 280, value: 85000 },
    { stage: "Negotiation", count: 120, value: 45000 },
    { stage: "Closing", count: 85, value: 32000 },
  ],
  topAgents: [
    { id: 1, name: "Sarah Connor", deals: 42, revenue: "$125,000", performance: 98, avatar: "SC" },
    { id: 2, name: "James Wilson", deals: 38, revenue: "$110,000", performance: 92, avatar: "JW" },
    { id: 3, name: "Elena Rodriguez", deals: 35, revenue: "$95,000", performance: 89, avatar: "ER" },
    { id: 4, name: "Michael Chen", deals: 31, revenue: "$88,000", performance: 85, avatar: "MC" },
    { id: 5, name: "Alex Thompson", deals: 28, revenue: "$72,000", performance: 82, avatar: "AT" },
  ],
  customerGrowth: [
    { month: "Jan", new: 45, churned: 12 },
    { month: "Feb", new: 52, churned: 15 },
    { month: "Mar", new: 48, churned: 10 },
    { month: "Apr", new: 61, churned: 18 },
    { month: "May", new: 55, churned: 14 },
    { month: "Jun", new: 67, churned: 16 },
  ],
  recentActivity: [
    { id: 1, type: "deal_closed", user: "Sarah Connor", detail: "Closed deal with TechFlow Solutions", time: "2 hours ago" },
    { id: 2, type: "lead_added", user: "James Wilson", detail: "Added 15 new leads from Web Summit", time: "4 hours ago" },
    { id: 3, type: "milestone_reached", user: "System", detail: "Monthly revenue target exceeded by 15%", time: "6 hours ago" },
    { id: 4, type: "new_campaign", user: "Marketing", detail: "Launched Summer Outreach campaign", time: "1 day ago" },
  ]
};
