const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

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

async function retry() {
  const s3Key = 'heroSec/3.jpeg';
  const fullPath = path.join(__dirname, 'public', s3Key);
  const fileStream = fs.createReadStream(fullPath);
  
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: s3Key,
      Body: fileStream,
      ContentType: 'image/jpeg',
    }));
    console.log(`Uploaded ${s3Key} successfully on retry.`);
  } catch (err) {
    console.error(`Failed to retry upload:`, err);
  }
}

retry().catch(console.error);
