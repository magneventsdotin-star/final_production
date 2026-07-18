import { NextRequest, NextResponse } from 'next/server';
import { S3Client, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_S3_ENDPOINT!,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});
const BUCKET = process.env.R2_BUCKET_NAME!;
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!;

function urlToKey(url: string): string | null {
  try {
    const base = PUBLIC_URL.endsWith('/') ? PUBLIC_URL.slice(0, -1) : PUBLIC_URL;
    if (!url.startsWith(base)) return null;
    return url.slice(base.length + 1);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { imageUrls } = await request.json() as { imageUrls: string[] };

    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json({ message: 'No images to delete.' }, { status: 200 });
    }


    const keys = imageUrls
      .map(urlToKey)
      .filter((k): k is string => k !== null && k.length > 0);

    if (keys.length === 0) {

      return NextResponse.json({ message: 'No R2 objects to delete.', deleted: 0 }, { status: 200 });
    }

    await s3.send(
      new DeleteObjectsCommand({
        Bucket: BUCKET,
        Delete: {
          Objects: keys.map((Key) => ({ Key })),
          Quiet: true,
        },
      })
    );

    return NextResponse.json(
      { message: `${keys.length} image(s) deleted from R2.`, deleted: keys.length },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[delete-image] R2 deletion failed:', error.message);

    return NextResponse.json(
      { error: error.message || 'R2 deletion failed' },
      { status: 500 }
    );
  }
}
