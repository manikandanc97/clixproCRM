/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const path = require('path');

const targetFiles = [
  // Delete APIs
  { path: 'app/api/crm/tasks/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  { path: 'app/api/crm/settings/revenue-targets/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  { path: 'app/api/crm/roles/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  { path: 'app/api/crm/quotations/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  { path: 'app/api/crm/leads/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  { path: 'app/api/crm/employees/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  { path: 'app/api/crm/departments/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  { path: 'app/api/crm/customers/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  { path: 'app/api/crm/calendar/[id]/route.ts', action: 'DELETE', config: 'DELETE', prefix: 'delete' },
  
  // Import APIs
  { path: 'app/api/crm/leads/import/route.ts', action: 'POST', config: 'IMPORT', prefix: 'import' },
  
  // File Upload APIs
  { path: 'app/api/crm/leads/[id]/attachments/route.ts', action: 'POST', config: 'FILE_UPLOAD', prefix: 'upload' },
  
  // AI APIs
  { path: 'app/api/crm/settings/ai/route.ts', action: 'GET', config: 'AI', prefix: 'ai' },
  
  // Admin APIs (Roles, Settings) - We rate limit POST/PUT on roles
  { path: 'app/api/crm/roles/route.ts', action: 'POST', config: 'ADMIN', prefix: 'admin' },
  { path: 'app/api/crm/roles/[id]/route.ts', action: 'PUT', config: 'ADMIN', prefix: 'admin' },
  { path: 'app/api/crm/roles/[id]/duplicate/route.ts', action: 'POST', config: 'ADMIN', prefix: 'admin' },
  { path: 'app/api/crm/settings/revenue-targets/route.ts', action: 'POST', config: 'ADMIN', prefix: 'admin' },
  { path: 'app/api/crm/settings/revenue-targets/[id]/route.ts', action: 'PUT', config: 'ADMIN', prefix: 'admin' }
];

const basePath = process.argv[2];

const rateLimitImport = `import { checkRateLimit, incrementRateLimit, getClientIp, RATE_LIMITS } from "@/lib/rate-limit";\n`;

function processFile({ path: relativePath, action, config, prefix }) {
  const fullPath = path.join(basePath, relativePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${fullPath} - Not found`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  if (content.includes('RATE_LIMITS.' + config)) {
    console.log(`Skipping ${relativePath} - Already rate limited`);
    return;
  }

  // Add import if not present
  if (!content.includes('checkRateLimit')) {
    const importMatch = content.match(/import .* from ".*";\n/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + rateLimitImport);
    } else {
      content = rateLimitImport + content;
    }
  }

  // Find the action function
  const functionRegex = new RegExp(`export async function ${action}\\([^\\)]*\\) {\\s*(?:try {)?`);
  
  const reqNameMatch = content.match(new RegExp(`export async function ${action}\\((req|request):[^,)]*`));
  let reqName = 'req';
  if (reqNameMatch) {
    reqName = reqNameMatch[1];
  }

  const rateLimitCode = `
    const ip = getClientIp(${reqName});
    const identifier = \`${prefix}_\${ip}\`;
    const rateLimit = await checkRateLimit(identifier, RATE_LIMITS.${config});
    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { success: false, error: { code: "TOO_MANY_REQUESTS", message: "Too many requests. Please try again later." } },
        { status: 429, headers: { "Retry-After": retryAfterSeconds.toString() } }
      );
    }
    await incrementRateLimit(identifier, RATE_LIMITS.${config});
`;

  content = content.replace(functionRegex, (match) => {
    return match + rateLimitCode;
  });

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Updated ${relativePath}`);
}

targetFiles.forEach(processFile);
