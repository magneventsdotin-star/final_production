const fs = require('fs');

const files = [
  'src/app/dashboard/artist-requests/page.tsx',
  'src/app/dashboard/artists/page.tsx',
  'src/app/dashboard/bookings/page.tsx',
  'src/app/dashboard/requests/page.tsx',
  'src/app/dashboard/team-requests/page.tsx',
  'src/app/dashboard/emails/page.tsx'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');

  // Insert the back button right inside <DialogContent ...>
  const backBtnCode = `
          {exportMode !== 'select' && (
            <button 
              onClick={() => setExportMode('select')}
              className="absolute left-6 top-6 p-2 rounded-full hover:bg-slate-100 transition-all text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={20} />
            </button>
          )}
`;
  
  if (!content.includes('className="absolute left-6 top-6 p-2 rounded-full')) {
     content = content.replace(
        /(<DialogContent[^>]+>)/,
        `$1${backBtnCode}`
     );
  }

  fs.writeFileSync(file, content, 'utf8');
});

console.log("Added top-left back button!");
