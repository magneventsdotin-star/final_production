const fs = require('fs');

const files = [
  { path: 'src/app/dashboard/artist-requests/page.tsx', comp: 'function ArtistRequestsContent() {' },
  { path: 'src/app/dashboard/browse/page.tsx', comp: 'export default function BrowseArtists() {' },
  { path: 'src/app/dashboard/emails/page.tsx', comp: 'export default function EmailManagement() {' },
  { path: 'src/app/dashboard/requests/page.tsx', comp: 'function ClientRequestsContent() {' }
];

files.forEach(({ path, comp }) => {
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes("import { useConfirm }")) {
    content = `import { useConfirm } from '@/components/ui/ConfirmProvider';\n` + content;
  }
  
  content = content.replace(comp, `${comp}\n  const { confirmAction } = useConfirm();`);
  
  content = content.replace(/confirm\((.*?)\)/g, "await confirmAction('Admin Verification Required', $1, 'danger')");
  
  // Also, if `confirm` was used inside a non-async onClick
  content = content.replace(/onClick=\{\(\) => \{\s*if\(!?await confirmAction/g, "onClick={async () => { if(await confirmAction");
  content = content.replace(/onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*if\(!?await confirmAction/g, "onClick={async (e) => { e.stopPropagation(); if(await confirmAction");

  fs.writeFileSync(path, content, 'utf8');
  console.log(`Fixed ${path}`);
});
