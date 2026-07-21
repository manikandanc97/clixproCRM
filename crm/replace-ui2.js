const fs = require('fs');
const path = require('path');

const filesToFix = [
  'features/tasks/components/TasksTable.tsx',
  'features/leads/components/LeadsTable.tsx'
];

for (const relPath of filesToFix) {
  const filePath = path.join('d:/Projects/clixproCRM/crm', relPath);
  if (!fs.existsSync(filePath)) continue;

  let content = fs.readFileSync(filePath, 'utf-8');
  
  content = content.replace(/\btask\.assignedTo\b/g, '"Unassigned"');
  content = content.replace(/\blead\.assignedTo\b/g, '"Unassigned"');
  
  fs.writeFileSync(filePath, content);
  console.log('Fixed', relPath);
}
