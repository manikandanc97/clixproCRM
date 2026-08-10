import fs from 'fs';
import path from 'path';

const CRM_DIR = path.resolve('d:/Projects/own-project/clixproCRM/crm');

// A recursive function to find all TSX files
function getFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const stat = fs.statSync(path.join(dir, file));
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.next') {
        getFiles(path.join(dir, file), fileList);
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(path.join(dir, file));
    }
  }
  return fileList;
}

const allFiles = getFiles(CRM_DIR);

let modifiedFiles = 0;

allFiles.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;

  // Don't touch avatars, switches, sliders which need full rounding
  if (file.includes('avatar.tsx') || file.includes('switch.tsx') || file.includes('slider.tsx') || file.includes('badge.tsx')) {
    return;
  }

  // Replace overly rounded radii (2xl, 3xl) with the max standard (xl)
  content = content.replace(/rounded-2xl/g, 'rounded-xl');
  content = content.replace(/rounded-3xl/g, 'rounded-xl');
  content = content.replace(/rounded-\[.*?\]/g, 'rounded-xl');
  
  // For buttons and general containers that are pill-shaped (rounded-full), we'll replace with rounded-md (10px) 
  // ONLY if it's likely a button/container, not a status dot. 
  // Status dots usually have w-2 h-2, w-3 h-3, etc.
  // A heuristic: replace rounded-full with rounded-md unless it's a small element (w-[1-9], h-[1-9])
  // To be safe, we just leave rounded-full for now and handle buttons explicitly where we know.
  // But wait, the user said "Remove random radius values... buttons should not be pill shaped".
  
  // Let's replace 'rounded-full' in known button patterns.
  // Or we just globally change it and let small dots break, but that's bad.
  // Instead, let's just do a regex that replaces rounded-full with rounded-md IF it has px- or py- (padding usually means button/badge)
  // or if it's on a <button> tag or "Button" component.
  
  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    modifiedFiles++;
  }
});

console.log(`Modified ${modifiedFiles} files.`);
