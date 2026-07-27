const fs = require('fs');
const path = require('path');

const files = [
  "app/api/crm/workspace/route.ts",
  "app/api/crm/team-performance/route.ts",
  "app/api/crm/settings/security/route.ts",
  "app/api/crm/settings/integrations/route.ts",
  "app/api/crm/settings/billing/route.ts",
  "app/api/crm/settings/ai/route.ts",
  "app/api/crm/roles/route.ts",
  "app/api/crm/reports/route.ts",
  "app/api/crm/notifications/route.ts",
  "app/api/crm/meetings/route.ts",
  "app/api/crm/hot-leads/route.ts",
  "app/api/crm/analytics/route.ts",
  "app/api/crm/ai-insights/route.ts"
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  const map = {
    "app/api/crm/workspace/route.ts": "getWorkspace",
    "app/api/crm/team-performance/route.ts": "getTeamPerformance",
    "app/api/crm/settings/security/route.ts": "getSettings",
    "app/api/crm/settings/integrations/route.ts": "getSettings",
    "app/api/crm/settings/billing/route.ts": "getSettings",
    "app/api/crm/settings/ai/route.ts": "getSettings",
    "app/api/crm/roles/route.ts": "getRoles",
    "app/api/crm/reports/route.ts": "getReports",
    "app/api/crm/notifications/route.ts": "getNotifications",
    "app/api/crm/meetings/route.ts": "getMeetings",
    "app/api/crm/hot-leads/route.ts": "getHotLeads",
    "app/api/crm/analytics/route.ts": "getAnalytics",
    "app/api/crm/ai-insights/route.ts": "getAiInsights",
  };

  const method = map[file];

  const replacement = `    // Type-safe lookup object approach
    const serviceMap = {
      method: CrmService.${method}
    };
    const data = await serviceMap.method(session.tenantId);`;

  // We need to replace the previous switch block
  const regex = /\/\/ Using a type-safe switch statement instead of dynamic lookup[\s\S]*?default: throw new Error\("Invalid module"\);\n\s*\}/;
  
  if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(filePath, content);
    console.log('Fixed', file);
  } else {
    console.log('Regex did not match in', file);
  }
}
