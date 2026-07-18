const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

const filesToUpdate = [];
walk('src/app/dashboard', function(filePath) {
  if (filePath.endsWith('.tsx') && !filePath.includes('layout.tsx')) {
    filesToUpdate.push(filePath);
  }
});

filesToUpdate.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  let changed = false;

  if (content.includes('confirm(')) {
    if (!content.includes('useConfirm')) {
      content = content.replace(/(import .*?\n)/, "$1import { useConfirm } from '@/components/ui/ConfirmProvider';\n");
    }

 
    const componentMatch = content.match(/export (default )?function \w+\(.*?\)\s*\{/);
    if (componentMatch && !content.includes('confirmAction = useConfirm()')) {
      content = content.replace(componentMatch[0], `${componentMatch[0]}\n  const { confirmAction } = useConfirm();`);
    }

    content = content.replace(/confirm\((.*?)\)/g, "await confirmAction('Admin Verification Required', $1, 'danger')");
    
  
    content = content.replace(/onClick=\{\(\) => \{\s*if\(!?await confirmAction/g, "onClick={async () => { if(await confirmAction");
    content = content.replace(/onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*if\(!?await confirmAction/g, "onClick={async (e) => { e.stopPropagation(); if(await confirmAction");

    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
