const fs = require('fs');
const path = require('path');

const serviceMap = {
    ensureDatabaseColumns: 'CustomerSyncService',
    cleanupCustomerAnomalies: 'CustomerSyncService',
    syncWonLeadsToCustomers: 'CustomerSyncService',
    getCustomers: 'CustomerService',
    createCustomer: 'CustomerService',
    updateCustomer: 'CustomerService',
    deleteCustomer: 'CustomerService',
    logTimeline: 'TimelineService',
    getLeads: 'LeadService',
    createLead: 'LeadService',
    updateLead: 'LeadService',
    deleteLead: 'LeadService',
    getHotLeads: 'LeadService',
    getPipeline: 'LeadPipelineService',
    getTasks: 'TaskQueryService',
    getTaskById: 'TaskQueryService',
    createTask: 'TaskService',
    updateTask: 'TaskService',
    deleteTask: 'TaskService',
    createQuotation: 'QuotationService',
    updateQuotation: 'QuotationService',
    deleteQuotation: 'QuotationService',
    getQuotations: 'QuotationService',
    getDashboardData: 'DashboardService',
    getReports: 'ReportsService',
    getAnalytics: 'AnalyticsService',
    getRevenueGrowthData: 'AnalyticsService',
    getAiInsights: 'AnalyticsService',
    getEmployees: 'EmployeeService',
    getRoles: 'EmployeeService',
    getWorkspace: 'WorkspaceService',
    getSecuritySettings: 'SecurityService',
    getBillingSettings: 'BillingService',
    getIntegrationSettings: 'IntegrationService',
    getAiSettings: 'AiService',
    getNotificationSettings: 'NotificationService',
    createMeeting: 'MeetingService',
    getMeetings: 'MeetingService',
    getLeadMeetings: 'MeetingService',
    getNotifications: 'CommonNotificationService',
    bulkImportLeads: 'LeadImportService',
    getRevenueTargets: 'RevenueService',
    createRevenueTarget: 'RevenueService',
    updateRevenueTarget: 'RevenueService',
    deleteRevenueTarget: 'RevenueService',
    getRevenueTargetAnalytics: 'RevenueService',
    getLeadNotes: 'LeadNoteService',
    createLeadNote: 'LeadNoteService',
    updateLeadNote: 'LeadNoteService',
    deleteLeadNote: 'LeadNoteService',
    getLeadTimeline: 'LeadTimelineService',
    createTimelineEvent: 'LeadTimelineService',
    getLeadAttachments: 'LeadAttachmentService',
    createLeadAttachment: 'LeadAttachmentService',
    deleteLeadAttachment: 'LeadAttachmentService',
};

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
    });
}

walkDir(path.join(__dirname, 'app', 'api', 'crm'), (filePath) => {
    if (!filePath.endsWith('.ts')) return;

    let content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes('CrmService')) return;

    let usedClasses = new Set();

    content = content.replace(/CrmService\.(\w+)/g, (match, methodName) => {
        if (serviceMap[methodName]) {
            usedClasses.add(serviceMap[methodName]);
            return serviceMap[methodName] + '.' + methodName;
        }
        return match;
    });

    if (usedClasses.size > 0) {
        const importStr = `import { ${Array.from(usedClasses).join(', ')} } from "@/services";`;
        content = content.replace(/import\s*{\s*CrmService\s*}\s*from\s*["']@\/services\/crm\.service["'];?/g, importStr);
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${filePath}`);
    }
});
