const fs = require('fs');

const files = [
  { path: 'src/app/dashboard/browse/page.tsx', comp: 'function BrowseArtistsContent() {' },
  { path: 'src/app/dashboard/emails/page.tsx', comp: 'function EmailsContent() {' },
];

files.forEach(({ path, comp }) => {
  let content = fs.readFileSync(path, 'utf8');
  
  if (!content.includes("const { confirmAction } = useConfirm();")) {
    content = content.replace(comp, `${comp}\n  const { confirmAction } = useConfirm();`);
  }
  
  content = content.replace(/confirm\((.*?)\)/g, "await confirmAction('Admin Verification Required', $1, 'danger')");
  
  // Also, if `confirm` was used inside a non-async onClick
  content = content.replace(/onClick=\{\(\) => \{\s*if\(!?await confirmAction/g, "onClick={async () => { if(await confirmAction");
  content = content.replace(/onClick=\{\(e\) => \{\s*e\.stopPropagation\(\);\s*if\(!?await confirmAction/g, "onClick={async (e) => { e.stopPropagation(); if(await confirmAction");

  fs.writeFileSync(path, content, 'utf8');
  console.log(`Fixed ${path}`);
});
