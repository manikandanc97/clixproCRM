const fs = require('fs');
const path = require('path');

const servicePath = path.join(__dirname, 'services', 'crm.service.ts');
const content = fs.readFileSync(servicePath, 'utf-8');

const methodRegex = /static\s+async\s+(\w+)\s*\(/g;
let match;
const methods = [];
while ((match = methodRegex.exec(content)) !== null) {
    methods.push({ name: match[1], startIndex: match.index });
}

for (let i = 0; i < methods.length; i++) {
    const start = methods[i].startIndex;
    let end;
    if (i < methods.length - 1) {
        end = methods[i+1].startIndex;
        const between = content.substring(start, end);
        const lastBrace = between.lastIndexOf('}');
        if (lastBrace !== -1) {
            end = start + lastBrace + 1;
        }
    } else {
        end = content.lastIndexOf('}');
    }
    
    let body = content.substring(start, end).trim();
    methods[i].body = body;
}

const serviceMap = {
    ensureDatabaseColumns: 'customer/customer.sync.service.ts',
    cleanupCustomerAnomalies: 'customer/customer.sync.service.ts',
    syncWonLeadsToCustomers: 'customer/customer.sync.service.ts',
    getCustomers: 'customer/customer.service.ts',
    createCustomer: 'customer/customer.service.ts',
    updateCustomer: 'customer/customer.service.ts',
    deleteCustomer: 'customer/customer.service.ts',
    
    logTimeline: 'common/timeline.service.ts',
    
    getLeads: 'lead/lead.service.ts',
    createLead: 'lead/lead.service.ts',
    updateLead: 'lead/lead.service.ts',
    deleteLead: 'lead/lead.service.ts',
    getHotLeads: 'lead/lead.service.ts',
    
    getPipeline: 'lead/lead.pipeline.service.ts',
    
    getTasks: 'task/task.query.service.ts',
    getTaskById: 'task/task.query.service.ts',
    createTask: 'task/task.service.ts',
    updateTask: 'task/task.service.ts',
    deleteTask: 'task/task.service.ts',
    
    createQuotation: 'quotation/quotation.service.ts',
    updateQuotation: 'quotation/quotation.service.ts',
    deleteQuotation: 'quotation/quotation.service.ts',
    getQuotations: 'quotation/quotation.service.ts',
    
    getDashboardData: 'dashboard/dashboard.service.ts',
    
    getReports: 'reports/reports.service.ts',
    getAnalytics: 'analytics/analytics.service.ts',
    getRevenueGrowthData: 'analytics/analytics.service.ts',
    getAiInsights: 'analytics/analytics.service.ts',
    
    getEmployees: 'employee/employee.service.ts',
    getRoles: 'employee/employee.service.ts',
    
    getWorkspace: 'settings/workspace.service.ts',
    getSecuritySettings: 'settings/security.service.ts',
    getBillingSettings: 'settings/billing.service.ts',
    getIntegrationSettings: 'settings/integration.service.ts',
    getAiSettings: 'settings/ai.service.ts',
    getNotificationSettings: 'settings/notification.service.ts',
    
    createMeeting: 'meeting/meeting.service.ts',
    getMeetings: 'meeting/meeting.service.ts',
    getLeadMeetings: 'meeting/meeting.service.ts',
    
    getNotifications: 'common/notification.service.ts',
    
    bulkImportLeads: 'lead/lead.import.service.ts',
    
    getRevenueTargets: 'revenue/revenue.service.ts',
    createRevenueTarget: 'revenue/revenue.service.ts',
    updateRevenueTarget: 'revenue/revenue.service.ts',
    deleteRevenueTarget: 'revenue/revenue.service.ts',
    getRevenueTargetAnalytics: 'revenue/revenue.service.ts',
    
    getLeadNotes: 'lead/lead.note.service.ts',
    createLeadNote: 'lead/lead.note.service.ts',
    updateLeadNote: 'lead/lead.note.service.ts',
    deleteLeadNote: 'lead/lead.note.service.ts',
    
    getLeadTimeline: 'lead/lead.timeline.service.ts',
    createTimelineEvent: 'lead/lead.timeline.service.ts',
    
    getLeadAttachments: 'lead/lead.attachment.service.ts',
    createLeadAttachment: 'lead/lead.attachment.service.ts',
    deleteLeadAttachment: 'lead/lead.attachment.service.ts',
};

const defaultImports = `import prisma from "@/lib/prisma";
import { Prisma, Lead, Customer, Quotation, Invoice, Task, PrismaClient, LeadStage, LeadPriority, CustomerStatus, TaskPriority, TaskStatus, QuotationStatus } from "@prisma/client";
import {
  calculateTrend,
  formatCurrency,
  countInRange,
  getMonthRanges,
  getStatusLabel,
  formatRelativeDate,
  toNumber,
  formatDate,
  formatPercentage,
  PIPELINE_STAGE_LABELS,
  LEAD_STATUS_LABELS
} from "@/lib/crm-formatters";
`;

const fileContents = {};

methods.forEach(m => {
    const targetFile = serviceMap[m.name];
    if (!targetFile) {
        console.log("Unmapped method:", m.name);
        return;
    }
    
    if (!fileContents[targetFile]) {
        const basename = path.basename(targetFile, '.ts');
        const className = basename.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
        fileContents[targetFile] = {
            className,
            methods: []
        };
    }
    
    fileContents[targetFile].methods.push(m.body);
});

const methodToClass = {};
for (const [method, file] of Object.entries(serviceMap)) {
    const basename = path.basename(file, '.ts');
    methodToClass[method] = basename.split('.').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('');
}

for (const [file, data] of Object.entries(fileContents)) {
    const fullPath = path.join(__dirname, 'services', file);
    
    let joinedMethods = data.methods.join('\\n\\n  ');
    
    joinedMethods = joinedMethods.replace(/this\.(\w+)/g, (match, methodName) => {
        if (methodToClass[methodName]) {
            return methodToClass[methodName] + '.' + methodName;
        }
        return match;
    });
    
    const importedClasses = new Set();
    for (const className of Object.values(methodToClass)) {
        if (className !== data.className && joinedMethods.includes(className + '.')) {
            importedClasses.add(className);
        }
    }
    
    let classImports = '';
    importedClasses.forEach(cls => {
        const targetFile = Object.entries(fileContents).find(([f, d]) => d.className === cls)[0];
        if (targetFile) {
            const fromDir = path.dirname(fullPath);
            const toDir = path.dirname(path.join(__dirname, 'services', targetFile));
            const toFile = path.basename(targetFile, '.ts');
            let rel = path.relative(fromDir, toDir).replace(/\\\\/g, '/');
            if (rel === '') rel = '.';
            classImports += `import { ${cls} } from "${rel}/${toFile}";\n`;
        }
    });

    const fileText = `${defaultImports}\n${classImports}\nexport class ${data.className} {\n  ${joinedMethods}\n}\n`;
    
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, fileText);
}

let indexExports = '';
for (const file of Object.keys(fileContents)) {
    const withoutExt = file.replace('.ts', '');
    indexExports += `export * from './${withoutExt.replace(/\\\\/g, '/')}';\n`;
}
fs.writeFileSync(path.join(__dirname, 'services', 'index.ts'), indexExports);

console.log("Services generated successfully!");
