const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

// Simple dotenv parse
const envContent = fs.readFileSync('.env.local', 'utf8');
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    process.env[match[1].trim()] = match[2].trim();
  }
});

const s3Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.R2_BUCKET_NAME;

async function uploadDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await uploadDir(fullPath);
    } else {
      // Create S3 key like 'assets/image.png'
      const relativePath = path.relative(path.join(__dirname, 'public'), fullPath);
      const s3Key = relativePath.replace(/\\/g, '/'); // Ensure forward slashes

      console.log(`Uploading ${s3Key}...`);
      const fileStream = fs.createReadStream(fullPath);
      
      let contentType = 'application/octet-stream';
      if (file.endsWith('.webp')) contentType = 'image/webp';
      else if (file.endsWith('.png')) contentType = 'image/png';
      else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) contentType = 'image/jpeg';
      else if (file.endsWith('.svg')) contentType = 'image/svg+xml';
      
      try {
        await s3Client.send(new PutObjectCommand({
          Bucket: bucketName,
          Key: s3Key,
          Body: fileStream,
          ContentType: contentType,
        }));
        console.log(`Uploaded ${s3Key} successfully.`);
      } catch (err) {
        console.error(`Failed to upload ${s3Key}:`, err);
      }
    }
  }
}

async function main() {
  const dirsToUpload = ['public/assets', 'public/heroSec'];
  for (const dir of dirsToUpload) {
    const fullPath = path.join(__dirname, dir);
    if (fs.existsSync(fullPath)) {
      console.log(`Starting upload for ${dir}`);
      await uploadDir(fullPath);
    } else {
      console.log(`Directory ${dir} not found.`);
    }
  }
}

main().catch(console.error);
