const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      replaceInDir(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('session.activeTenantId') || content.includes('session.user.id')) {
        content = content.replace(/session\.activeTenantId/g, 'session.tenantId');
        content = content.replace(/session\.user\.id/g, 'session.userId');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

replaceInDir('d:\\Projects\\clixproCRM\\crm\\app\\api\\crm');
