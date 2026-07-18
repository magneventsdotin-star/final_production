const fs = require('fs');

const files = [
  'src/app/dashboard/artists/page.tsx',
  'src/app/dashboard/bookings/page.tsx',
  'src/app/dashboard/requests/page.tsx',
  'src/app/dashboard/team-requests/page.tsx',
  'src/app/dashboard/artist-requests/page.tsx',
  'src/app/dashboard/emails/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Add ArrowLeft, CalendarCheck, ChevronRight if missing
  if (!content.includes('ArrowLeft')) {
    content = content.replace(/} from 'lucide-react';/g, ', ArrowLeft, CalendarCheck, ChevronRight } from \'lucide-react\';');
  }

  // Update the button HTML
  content = content.replace(
    /className="mt-3 w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all"/g,
    'className="mt-3 w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-500 font-bold text-xs uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"'
  );
  content = content.replace(
    /\{exportMode === 'select' \? 'Cancel' : 'Back to Options'\}/g,
    '{exportMode === \'select\' ? \'Cancel\' : <><ArrowLeft size={16} /> Back to Options</>}'
  );

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Updated files!");
