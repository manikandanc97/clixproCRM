import { 
  TrendingUp, 
  Users, 
  Shield, 
  Target, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Briefcase,
  Layers,
  Search,
  Settings,
  FileText,
  BarChart3,
  Mail,
  Phone,
  Calendar,
  MessageSquare
} from "lucide-react";

// --- AI Insights Data ---
export const AI_INSIGHTS_STATS = [
  {
    title: "Revenue Prediction",
    value: "$128,400",
    change: "+12.5%",
    trend: "up" as const,
    color: "emerald" as const,
    icon: TrendingUp,
    sparklineData: [{ value: 10 }, { value: 25 }, { value: 15 }, { value: 30 }, { value: 45 }, { value: 40 }, { value: 55 }]
  },
  {
    title: "Lead Quality Score",
    value: "84/100",
    change: "+5.2%",
    trend: "up" as const,
    color: "blue" as const,
    icon: Target,
    sparklineData: [{ value: 70 }, { value: 72 }, { value: 75 }, { value: 74 }, { value: 80 }, { value: 82 }, { value: 84 }]
  },
  {
    title: "Customer Retention",
    value: "92.4%",
    change: "-0.8%",
    trend: "down" as const,
    color: "orange" as const,
    icon: Users,
    sparklineData: [{ value: 94 }, { value: 93.5 }, { value: 93 }, { value: 93.2 }, { value: 92.8 }, { value: 92.6 }, { value: 92.4 }]
  },
  {
    title: "Conversion Forecast",
    value: "18.5%",
    change: "+2.1%",
    trend: "up" as const,
    color: "purple" as const,
    icon: Zap,
    sparklineData: [{ value: 15 }, { value: 16 }, { value: 15.5 }, { value: 17 }, { value: 17.5 }, { value: 18 }, { value: 18.5 }]
  }
];

export const AI_RECOMMENDATIONS = [
  {
    id: "rec-1",
    title: "Follow up with High-Intent Leads",
    description: "4 leads from the 'Healthcare' segment have visited the pricing page 3+ times today.",
    priority: "high",
    tag: "Urgent",
    icon: Zap,
    color: "text-rose-500",
    bgColor: "bg-rose-500/10"
  },
  {
    id: "rec-2",
    title: "Churn Risk Detected",
    description: "3 enterprise customers haven't logged in for 10 days. Reach out with a check-in call.",
    priority: "medium",
    tag: "Retention",
    icon: AlertCircle,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10"
  },
  {
    id: "rec-3",
    title: "Sales Opportunity",
    description: "Sales in the 'Tech' sector are up 20%. Consider increasing marketing budget for this niche.",
    priority: "low",
    tag: "Growth",
    icon: TrendingUp,
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10"
  }
];

export const AI_TIMELINE = [
  {
    id: "t1",
    title: "Revenue Spike Detected",
    description: "North America region saw a 40% increase in sales today compared to the daily average.",
    time: "2 hours ago",
    icon: TrendingUp,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500"
  },
  {
    id: "t2",
    title: "Campaign Efficiency Alert",
    description: "Q2 Email Campaign is outperforming Q1 by 15% in click-through rates.",
    time: "5 hours ago",
    icon: BarChart3,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500"
  },
  {
    id: "t3",
    title: "Employee Productivity Milestone",
    description: "Development team closed 45 tickets this week, a new record for this quarter.",
    time: "Yesterday",
    icon: CheckCircle2,
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500"
  }
];

// --- Employees Data ---
export const EMPLOYEE_STATS = [
  { title: "Total Employees", value: "154", change: "+4", trend: "up" as const, color: "blue" as const, icon: Users },
  { title: "Active Employees", value: "148", change: "+2", trend: "up" as const, color: "emerald" as const, icon: CheckCircle2 },
  { title: "On Leave", value: "6", change: "-1", trend: "down" as const, color: "orange" as const, icon: Clock },
  { title: "New Joiners", value: "12", change: "+3", trend: "up" as const, color: "purple" as const, icon: Briefcase }
];

export const EMPLOYEES = [
  {
    id: "emp-1",
    name: "Alex Rivera",
    email: "alex.r@clientrise.com",
    role: "Senior Sales Manager",
    department: "Sales",
    status: "active",
    performance: 98,
    avatar: "https://i.pravatar.cc/150?u=alex",
    lastActive: "10 mins ago"
  },
  {
    id: "emp-2",
    name: "Sarah Chen",
    email: "s.chen@clientrise.com",
    role: "Full Stack Developer",
    department: "Development",
    status: "active",
    performance: 95,
    avatar: "https://i.pravatar.cc/150?u=sarah",
    lastActive: "Active Now"
  },
  {
    id: "emp-3",
    name: "Marcus Thorne",
    email: "m.thorne@clientrise.com",
    role: "HR Director",
    department: "HR",
    status: "active",
    performance: 92,
    avatar: "https://i.pravatar.cc/150?u=marcus",
    lastActive: "1 hour ago"
  },
  {
    id: "emp-4",
    name: "Elena Rodriguez",
    email: "elena.ro@clientrise.com",
    role: "Marketing Lead",
    department: "Marketing",
    status: "on-leave",
    performance: 89,
    avatar: "https://i.pravatar.cc/150?u=elena",
    lastActive: "2 days ago"
  },
  {
    id: "emp-5",
    name: "David Kim",
    email: "d.kim@clientrise.com",
    role: "Support Specialist",
    department: "Support",
    status: "active",
    performance: 94,
    avatar: "https://i.pravatar.cc/150?u=david",
    lastActive: "5 mins ago"
  }
];

export const EMPLOYEE_ACTIVITIES = [
  {
    id: "ea1",
    title: "Onboarding Completed",
    description: "New employee John Doe has completed the initial onboarding phase.",
    time: "1 hour ago",
    icon: CheckCircle2,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500"
  },
  {
    id: "ea2",
    title: "New Role Assigned",
    description: "Sarah Chen has been promoted to Senior Lead Developer.",
    time: "4 hours ago",
    icon: Shield,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500"
  },
  {
    id: "ea3",
    title: "Leave Request Approved",
    description: "Elena Rodriguez's vacation request for next week has been approved.",
    time: "Yesterday",
    icon: Clock,
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500"
  }
];

// --- Roles Data ---
export const ROLE_STATS = [
  { title: "Total Roles", value: "8", color: "blue" as const, icon: Shield },
  { title: "Active Users", value: "148", color: "emerald" as const, icon: Users },
  { title: "Admins", value: "5", color: "pink" as const, icon: Shield },
  { title: "Custom Roles", value: "3", color: "purple" as const, icon: Settings }
];

export const ROLES = [
  {
    id: "role-1",
    name: "Super Admin",
    membersCount: 2,
    permissionsCount: 45,
    createdDate: "2024-01-10",
    status: "active",
    description: "Full access to all modules and system settings."
  },
  {
    id: "role-2",
    name: "Sales Manager",
    membersCount: 8,
    permissionsCount: 28,
    createdDate: "2024-01-15",
    status: "active",
    description: "Manage sales teams, leads, and customer accounts."
  },
  {
    id: "role-3",
    name: "Support Lead",
    membersCount: 4,
    permissionsCount: 20,
    createdDate: "2024-02-01",
    status: "active",
    description: "Manage support tickets and customer feedback."
  },
  {
    id: "role-4",
    name: "Marketing Specialist",
    membersCount: 12,
    permissionsCount: 15,
    createdDate: "2024-02-10",
    status: "active",
    description: "Access to marketing campaigns and analytics."
  },
  {
    id: "role-5",
    name: "Developer",
    membersCount: 15,
    permissionsCount: 12,
    createdDate: "2024-02-15",
    status: "active",
    description: "Read-only access to CRM, full access to developer tools."
  }
];

export const SECURITY_LOGS = [
  {
    id: "sl1",
    title: "Permission Changed",
    description: "Admin changed 'Lead Delete' permission for 'Sales Manager' role.",
    time: "30 mins ago",
    icon: Settings,
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500"
  },
  {
    id: "sl2",
    title: "Role Created",
    description: "A new role 'Guest Contributor' was created by Marcus Thorne.",
    time: "2 hours ago",
    icon: Shield,
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500"
  },
  {
    id: "sl3",
    title: "Failed Login Attempt",
    description: "Multiple failed login attempts detected for account 'admin@clientrise.com'.",
    time: "5 hours ago",
    icon: AlertCircle,
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-500"
  }
];

export const PERMISSION_MODULES = [
  {
    id: "dashboard",
    name: "Dashboard",
    permissions: ["view", "manage"]
  },
  {
    id: "crm",
    name: "CRM (Leads & Customers)",
    permissions: ["view", "create", "edit", "delete", "export"]
  },
  {
    id: "employees",
    name: "Employees",
    permissions: ["view", "manage", "payroll"]
  },
  {
    id: "finance",
    name: "Finance & Billing",
    permissions: ["view", "create", "edit", "reports"]
  },
  {
    id: "reports",
    name: "Advanced Reports",
    permissions: ["view", "create", "export"]
  },
  {
    id: "settings",
    name: "System Settings",
    permissions: ["view", "edit", "manage_roles"]
  }
];












