const fs = require('fs');
const path = require('path');
const sharp = require('sharp'); // Next.js installs sharp

const dir = path.join(__dirname, 'public', 'assets');

fs.readdir(dir, (err, files) => {
  if (err) throw err;
  files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.jpg' || ext === '.png' || ext === '.jpeg') {
      const inputPath = path.join(dir, file);
      const outputPath = path.join(dir, path.basename(file, path.extname(file)) + '.webp');
      
      sharp(inputPath)
        .webp({ quality: 80 })
        .toFile(outputPath)
        .then(() => {
          console.log(`Converted ${file} to .webp`);
          // Delete original
          fs.unlinkSync(inputPath);
        })
        .catch(err => {
          console.error(`Error converting ${file}:`, err);
        });
    }
  });
});
