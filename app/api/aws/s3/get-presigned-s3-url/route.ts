import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { NextRequest, NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

console.log('Here')

async function generateUploadURL(objectKey: string): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Key: objectKey,
  });
  const uploadURL = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return uploadURL;
}

export async function GET(request: NextRequest) {
    
  const objectKey = request.nextUrl.searchParams.get('objectKey');
  if (!objectKey) {
    return NextResponse.json({ error: 'Invalid or missing object key' }, { status: 400 });
  }
  
  try {
    const url = await generateUploadURL(objectKey);
    return NextResponse.json({ url });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}