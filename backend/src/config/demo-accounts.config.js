const DEMO_ACCOUNTS = [
  {
    name: "Demo Super Admin",
    email: "superadmin@demo.orbit.com",
    password: "DemoPass123!",
    role: "super_admin",
  },
  {
    name: "Demo Admin",
    email: "admin@demo.orbit.com",
    password: "DemoPass123!",
    role: "admin",
  },
  {
    name: "Demo Manager",
    email: "manager@demo.orbit.com",
    password: "DemoPass123!",
    role: "manager",
  },
  {
    name: "Demo Sales",
    email: "sales@demo.orbit.com",
    password: "DemoPass123!",
    role: "sales",
  },
  {
    name: "Demo Support",
    email: "support@demo.orbit.com",
    password: "DemoPass123!",
    role: "support",
  },
  {
    name: "Demo Employee",
    email: "employee@demo.orbit.com",
    password: "DemoPass123!",
    role: "employee",
  },
];

const DEMO_ACCOUNT_EMAILS = DEMO_ACCOUNTS.map((account) => account.email);

module.exports = {
  DEMO_ACCOUNTS,
  DEMO_ACCOUNT_EMAILS,
};
