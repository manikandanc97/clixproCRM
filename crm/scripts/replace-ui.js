const fs = require('fs');
const path = require('path');

const filesToFix = [
  'app/(dashboard)/employees/page.tsx',
  'app/(dashboard)/quotations/page.tsx',
  'app/(dashboard)/tasks/page.tsx',
  'features/customers/components/CustomersTable.tsx',
  'features/dashboard/components/TeamPerformance.tsx',
  'features/dashboard/components/UpcomingMeetings.tsx',
  'features/pipeline/components/PipelineCard.tsx',
  'features/quotations/components/QuotationsTable.tsx',
  'features/settings/components/TeamSettings.tsx',
  'features/tasks/components/TaskDetailsDrawer.tsx',
  'features/tasks/components/TaskKanbanCard.tsx',
  'features/tasks/components/TimelineView.tsx'
];

for (const relPath of filesToFix) {
  const filePath = path.join('d:/Projects/clixproCRM/crm', relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace references
  content = content.replace(/\bemployee\.avatar\b/g, '""');
  content = content.replace(/\bmember\.avatar\b/g, '""');
  content = content.replace(/\battendee\.avatar\b/g, '""');
  content = content.replace(/\bcustomer\.avatar\b/g, '""');
  content = content.replace(/\btask\.assignedTo\b/g, '"Unassigned"');
  content = content.replace(/\blead\.assignedTo\b/g, '"Unassigned"');
  content = content.replace(/\bquotation\.createdBy\b/g, '"System"');
  content = content.replace(/\bquote\.createdBy\b/g, '"System"'); // QuotationsTable uses quote
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed', relPath);
}
