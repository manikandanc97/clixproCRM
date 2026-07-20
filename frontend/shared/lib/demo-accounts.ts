export interface DemoAccount {
  role: string;
  roleName: string;
  description: string;
  email: string;
  password: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    role: "super_admin",
    roleName: "Super Admin",
    description: "Full platform access with complete control over all features and settings.",
    email: "superadmin@demo.orbit.com",
    password: "DemoPass123!",
  },
  {
    role: "admin",
    roleName: "Admin",
    description: "Administrative access with system management capabilities.",
    email: "admin@demo.orbit.com",
    password: "DemoPass123!",
  },
  {
    role: "manager",
    roleName: "Manager",
    description: "Oversees team workspace, manages leads, and monitors performance.",
    email: "manager@demo.orbit.com",
    password: "DemoPass123!",
  },
  {
    role: "sales",
    roleName: "Sales",
    description: "Handles lead generation, customer follow-ups, and quotation management.",
    email: "sales@demo.orbit.com",
    password: "DemoPass123!",
  },
  {
    role: "support",
    roleName: "Support",
    description: "Manages customer support tickets and communication channels.",
    email: "support@demo.orbit.com",
    password: "DemoPass123!",
  },
  {
    role: "employee",
    roleName: "Employee",
    description: "Limited access to assigned tasks and personal workspace features.",
    email: "employee@demo.orbit.com",
    password: "DemoPass123!",
  },
];

export const getDemoAccountByRole = (role: string): DemoAccount | undefined => {
  return DEMO_ACCOUNTS.find(account => account.role === role);
};

export const getDemoAccountByEmail = (email: string): DemoAccount | undefined => {
  return DEMO_ACCOUNTS.find(account => account.email === email);
};