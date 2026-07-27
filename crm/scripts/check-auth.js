const fs = require('fs');
const path = require('path');

const walk = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      walk(path.join(dir, file), fileList);
    } else if (file === 'route.ts') {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
};

const apiRoutes = walk('app/api');
console.log('Total API routes:', apiRoutes.length);
apiRoutes.forEach(route => {
  const content = fs.readFileSync(route, 'utf8');
  let authType = 'None';
  if (content.includes('requireRole')) {
    authType = 'requireRole';
  } else if (content.includes('getAuthSession')) {
    authType = 'getAuthSession';
  } else if (content.includes('verifyAuth')) {
    authType = 'verifyAuth';
  } else if (content.includes('headersList.get("x-user-id")')) {
    authType = 'Headers (x-user-id)';
  } else if (route.includes('auth\\login') || route.includes('auth/login') || route.includes('auth\\register') || route.includes('auth/register') || route.includes('auth\\logout') || route.includes('auth/logout')) {
    authType = 'Public';
  }
  
  console.log(`${route}: ${authType}`);
});
