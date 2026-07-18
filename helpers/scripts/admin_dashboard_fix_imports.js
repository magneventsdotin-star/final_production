const fs = require('fs');

const files = [
  'src/app/dashboard/artist-requests/page.tsx',
  'src/app/dashboard/artists/page.tsx',
  'src/app/dashboard/bookings/page.tsx',
  'src/app/dashboard/requests/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');


  const lucideMatch = content.match(/import \{([^}]+)\} from 'lucide-react';/);
  if (lucideMatch) {
     let imports = lucideMatch[1].split(',').map(s => s.trim());
     let uniqueImports = [...new Set(imports)].filter(i => i !== '');
     let newImportString = `import { ${uniqueImports.join(', ')} } from 'lucide-react';`;
     content = content.replace(lucideMatch[0], newImportString);
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Fixed duplicates!");
