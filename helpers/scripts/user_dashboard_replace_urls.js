const fs = require('fs');
const path = require('path');

const CDN_URL = 'https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev';
const targetExts = ['.js', '.jsx', '.css'];

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  // Replace /assets/... and /heroSec/...
  content = content.replace(/(["'`])\/assets\//g, `$1${CDN_URL}/assets/`);
  content = content.replace(/(["'`])\/heroSec\//g, `$1${CDN_URL}/heroSec/`);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
  }
}

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (file === 'node_modules' || file === '.next' || file === 'public' || file.startsWith('.')) {
      continue;
    }
    
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else {
      const ext = path.extname(fullPath);
      if (targetExts.includes(ext)) {
        replaceInFile(fullPath);
      }
    }
  }
}

const rootDir = path.join(__dirname);
processDirectory(rootDir);
