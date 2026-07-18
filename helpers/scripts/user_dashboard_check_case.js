const fs = require('fs');
const path = require('path');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.js') || file.endsWith('.jsx')) results.push(file);
    }
  });
  return results;
}
const files = walk('./');
let hasMismatch = false;
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const importRegex = /import\s+.*?\s+from\s+['"](.*?)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith('.')) {
      const targetPath = path.resolve(path.dirname(f), importPath);
      const dir = path.dirname(targetPath);
      if (fs.existsSync(dir)) {
        const base = path.basename(targetPath);
        const filesInDir = fs.readdirSync(dir);
        const exactMatch = filesInDir.find(x => x === base || x.replace(/\.(js|jsx|ts|tsx)$/, '') === base);
        const lowerMatch = filesInDir.find(x => x.toLowerCase() === base.toLowerCase() || x.replace(/\.(js|jsx|ts|tsx)$/, '').toLowerCase() === base.toLowerCase());
        if (lowerMatch && !exactMatch) {
          console.log('Case mismatch in', f, '->', importPath, 'Expected:', lowerMatch);
          hasMismatch = true;
        }
      }
    }
  }
});
if (!hasMismatch) console.log('No case mismatches found.');
