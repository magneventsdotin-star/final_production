const fs = require('fs');

const files = [
  'src/app/dashboard/admins/page.tsx',
  'src/app/dashboard/artist-requests/page.tsx',
  'src/app/dashboard/artists/page.tsx',
  'src/app/dashboard/bookings/page.tsx',
  'src/app/dashboard/browse/page.tsx',
  'src/app/dashboard/categories/page.tsx',
  'src/app/dashboard/emails/page.tsx',
  'src/app/dashboard/forms/page.tsx',
  'src/app/dashboard/forms/[id]/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/dashboard/pricing/page.tsx',
  'src/app/dashboard/requests/page.tsx',
  'src/app/dashboard/service-videos/page.tsx',
  'src/app/dashboard/slider/page.tsx',
  'src/app/dashboard/team-requests/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (!content.includes("import { useConfirm }")) {
    content = `import { useConfirm } from '@/components/ui/ConfirmProvider';\n` + content;
    changed = true;
  }
  
  if (!content.includes("const { confirmAction } = useConfirm()")) {
    const componentMatch = content.match(/export (default )?function \w+\(.*?\)\s*\{/);
    if (componentMatch) {
      content = content.replace(componentMatch[0], `${componentMatch[0]}\n  const { confirmAction } = useConfirm();`);
      changed = true;
    }
  }

  // Find all remaining confirm( calls and replace them
  if (content.includes("confirm(")) {
    content = content.replace(/confirm\((.*?)\)/g, "await confirmAction('Admin Verification Required', $1, 'danger')");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Fixed ${file}`);
  }
});
