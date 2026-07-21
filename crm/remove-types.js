const fs = require('fs');
const path = require('path');

const dir = 'd:/Projects/clixproCRM/crm/shared/types';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.ts'));

const patternsToRemove = [
  /^\s*avatar\??:\s*string;$/m,
  /^\s*assignedTo\??:\s*string;$/m,
  /^\s*createdBy\??:\s*string;$/m,
  /^\s*manager\??:\s*string;$/m,
  /^\s*firstName\??:\s*string;$/m,
  /^\s*lastName\??:\s*string;$/m,
  /^\s*displayName\??:\s*string;$/m,
  /^\s*deletedAt\??:\s*string;$/m,
  /^\s*updatedBy\??:\s*string;$/m,
];

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf-8');
  let originalContent = content;

  // For analytics.ts, it's on a single line: "export interface TopAgent { ... avatar: string; }"
  content = content.replace(/avatar:\s*string;\s*/g, '');

  for (const pattern of patternsToRemove) {
    const lines = content.split('\n');
    content = lines.filter(line => !pattern.test(line)).join('\n');
  }

  // Handle collaborators in task.ts separately
  content = content.replace(/collaborators\?:\s*{\s*name:\s*string;\s*avatar:\s*string;\s*id:\s*string\s*}\[\];/g, 'collaborators?: { name: string; id: string }[];');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log('Updated', file);
  }
}
