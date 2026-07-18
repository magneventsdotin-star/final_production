const fs = require('fs');
const path = require('path');

const exts = ['.jsx', '.js', '.tsx', '.ts'];
const root = 'c:/Users/avani/Desktop/client_1';

function fixFile(file) {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  if (content.includes('next/image') || content.includes('<img') || content.includes('<NextImage')) {
    // Remove import
    content = content.replace(/import\s+(NextImage|Image)\s+from\s+['"]next\/image['"];?\r?\n/g, '');

    // Replace Image tags
    // This regex matches <Image or <NextImage
    const imgRegex = /<(?:Image|NextImage)([\s\S]*?)(\/?)>/g;
    
    content = content.replace(imgRegex, (match, propsStr, selfClose) => {
      let props = propsStr;
      
      props = props.replace(/src=\{([^}]+)\}/g, (m, p1) => {
        // If it's a string literal, leave it
        if (/^['"`]/.test(p1.trim())) return m;
        // if it's already got .src, leave it
        if (p1.trim().endsWith('.src')) return m;
        // else wrap it
        return 'src={typeof ' + p1 + ' === "object" ? ' + p1 + '?.src : ' + p1 + '}';
      });

      // Handle fill
      if (props.includes('fill')) {
        props = props.replace(/\s*fill(?:=\{true\})?\s*/, ' ');
        // Inject style for fill
        if (!props.includes('style=')) {
          props += ' style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}';
        }
      }

      // Remove specific next/image props
      props = props.replace(/\s*priority(?:=\{[^}]+\})?\s*/g, ' ');
      props = props.replace(/\s*quality=\{[^}]+\}\s*/g, ' ');
      props = props.replace(/\s*sizes=(?:"[^"]+"|'[^']+'|\{[^}]+\})\s*/g, ' ');
      props = props.replace(/\s*placeholder=(?:"[^"]+"|'[^']+'|\{[^}]+\})\s*/g, ' ');
      props = props.replace(/\s*blurDataURL=(?:"[^"]+"|'[^']+'|\{[^}]+\})\s*/g, ' ');
      props = props.replace(/\s*unoptimized(?:=\{[^}]+\})?\s*/g, ' ');
      props = props.replace(/\s*loading=(?:"[^"]+"|'[^']+'|\{[^}]+\})\s*/g, ' ');

      return '<img' + props + (selfClose ? ' />' : '>');
    });

    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed ' + file);
    }
  }
}

function traverse(dir) {
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (f === 'node_modules' || f === '.next' || f.startsWith('.')) continue;
    if (fs.statSync(full).isDirectory()) traverse(full);
    else if (exts.includes(path.extname(f))) {
       fixFile(full);
    }
  }
}

traverse(root);
