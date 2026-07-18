const fs = require('fs');

const filesToFix = [
  'src/app/dashboard/artist-requests/page.tsx',
  'src/app/dashboard/browse/page.tsx',
  'src/app/dashboard/emails/page.tsx',
  'src/app/dashboard/requests/page.tsx'
];

filesToFix.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Find the export default function line, ignoring whitespace issues
  const regex = /export default function \w+\(\)\s*\{/;
  const match = content.match(regex);
  if (match && !content.includes("confirmAction = useConfirm()")) {
    content = content.replace(match[0], `${match[0]}\n  const { confirmAction } = useConfirm();`);
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
