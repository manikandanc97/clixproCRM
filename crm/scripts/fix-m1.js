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
  
  // Find moduleName
  const moduleNameMatch = content.match(/const moduleName = "([^"]+)";/);
  if (moduleNameMatch) {
    const moduleName = moduleNameMatch[1];
    
    // We want to create a typed lookup object. Or we can just use a switch statement.
    // Let's use a switch statement or direct method call since they asked for it. 
    // Actually they said "Use a typed lookup object or switch statement."
    // Let's replace the dynamic stuff with a switch statement!
    
    const switchCode = `    // Using a type-safe switch statement instead of dynamic lookup
    let data;
    switch ("${moduleName}") {
      case "workspace": data = await CrmService.getWorkspace(session.tenantId); break;
      case "team-performance": data = await CrmService.getTeamPerformance(session.tenantId); break;
      case "settings": data = await CrmService.getSettings(session.tenantId); break;
      case "roles": data = await CrmService.getRoles(session.tenantId); break;
      case "reports": data = await CrmService.getReports(session.tenantId); break;
      case "notifications": data = await CrmService.getNotifications(session.tenantId); break;
      case "meetings": data = await CrmService.getMeetings(session.tenantId); break;
      case "hot-leads": data = await CrmService.getHotLeads(session.tenantId); break;
      case "analytics": data = await CrmService.getAnalytics(session.tenantId); break;
      case "ai-insights": data = await CrmService.getAiInsights(session.tenantId); break;
      default: throw new Error("Invalid module");
    }`;

    // replace from `const moduleName` to `const data = await (CrmService as any)...`
    const regex = /const moduleName = "[^"]+";\s+const methodName = [^\n]+;\s+const data = await \(CrmService as any\)\[methodName\]\(session\.tenantId\);/;
    
    if (regex.test(content)) {
      content = content.replace(regex, switchCode);
      fs.writeFileSync(filePath, content);
      console.log('Fixed', file);
    } else {
      console.log('Regex did not match in', file);
    }
  }
}
