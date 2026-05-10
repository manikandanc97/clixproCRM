export interface EmployeeType {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "active" | "on-leave" | "inactive";
  performance: number;
  avatar: string;
  lastActive: string;
}

export interface EmployeeStatType {
  title: string;
  value: string;
  change: string;
  positive: boolean;
}

export interface EmployeeActivityType {
  id: string;
  title: string;
  description: string;
  time: string;
}

export interface EmployeesDataType {
  employees: EmployeeType[];
  stats: any[];
  recentActivities: EmployeeActivityType[];
}

export interface RoleType {
  id: string;
  name: string;
  key: string;
  membersCount: number;
  permissionsCount: number;
  description: string;
  status: string;
  createdDate: string;
}

export interface SecurityLogType {
  id: string;
  title: string;
  description: string;
  time: string;
}

export interface RolesDataType {
  roles: RoleType[];
  stats: any[];
  securityLogs: SecurityLogType[];
  permissionModules: any[];
}
