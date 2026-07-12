const fs = require('fs');
const path = require('path');
const root = 'c:/Users/avani/Desktop/client_1';
const exts = ['.jsx', '.js', '.tsx', '.ts'];

function findAndFix(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.next' || f.startsWith('.')) continue;
    if (fs.statSync(full).isDirectory()) {
      findAndFix(full);
    } else if (exts.includes(path.extname(f))) {
      let content = fs.readFileSync(full, 'utf8');
      const original = content;
      
      content = content.replace(/<img([^>]+)style=\{\{\s*objectFit:\s*['"]cover['"]\s*\}\}([^>]*)>/g, (match, p1, p2) => {
         return '<img' + p1 + 'style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", inset: 0 }}' + p2 + '>';
      });
      
      if (content !== original) {
        fs.writeFileSync(full, content, 'utf8');
        console.log('Fixed:', full);
      }
    }
  }
}
findAndFix(root);
