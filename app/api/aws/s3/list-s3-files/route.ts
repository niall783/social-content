import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { NextRequest, NextResponse } from 'next/server';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  // Add a unique query parameter to bypass caching
  const timestamp = Date.now();
  const params = {
    Bucket: process.env.AWS_S3_BUCKET_NAME!,
    Prefix: 'uploads/', // Adjust this prefix as needed
    // Add a dummy parameter to force a new request each time
    Delimiter: timestamp.toString(),
  };

  try {
    const data = await s3Client.send(new ListObjectsV2Command(params));

    if (!data.Contents || data.Contents.length === 0) {
      return NextResponse.json(
        { filesFound: false, message: 'No files found in the bucket.', files: [] },
        { 
          headers: { 
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          } 
        }
      );
    }

    const files = await Promise.all(
      data.Contents.map(async (file) => {
        const getObjectParams = { 
          Bucket: params.Bucket, 
          Key: file.Key,
          // Add a dummy parameter to force a new signed URL each time
          ResponseCacheControl: `no-cache,${timestamp}`,
        };
        const url = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), { expiresIn: 3600 });
        const splitPath = (file.Key ?? '').split('/');
        const fileName = splitPath[splitPath.length - 1];
        return {
          name: fileName,
          key: file.Key,
          url,
          size: file.Size,
          lastModified: file.LastModified?.toISOString() ?? '',
        };
      })
    );

    return NextResponse.json(
      { filesFound: true, message: 'Files retrieved successfully.', files },
      { 
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        } 
      }
    );
  } catch (error: any) {
    console.error('Error listing files:', error);
    return NextResponse.json(
      { error: `Error listing files: ${error.message}` },
      { 
        status: 500, 
        headers: { 
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        } 
      }
    );
  }
}

export const dynamic = 'force-dynamic';















// import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { NextRequest, NextResponse } from 'next/server';

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export async function GET(request: NextRequest) {
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME!,
//     Prefix: 'uploads/', // Adjust this prefix as needed
//   };

//   try {
//     const data = await s3Client.send(new ListObjectsV2Command(params));

//     if (!data.Contents || data.Contents.length === 0) {
//       return NextResponse.json(
//         { filesFound: false, message: 'No files found in the bucket.', files: [] },
//         { headers: { 'Cache-Control': 'no-store, max-age=0' } }
//       );
//     }

//     const files = await Promise.all(
//       data.Contents.map(async (file) => {
//         const getObjectParams = { Bucket: params.Bucket, Key: file.Key };
//         const url = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), { expiresIn: 3600 });
//         const splitPath = (file.Key ?? '').split('/');
//         const fileName = splitPath[splitPath.length - 1];
//         return {
//           name: fileName,
//           key: file.Key,
//           url,
//           size: file.Size,
//           lastModified: file.LastModified?.toISOString() ?? '',
//         };
//       })
//     );

//     return NextResponse.json(
//       { filesFound: true, message: 'Files retrieved successfully.', files },
//       { headers: { 'Cache-Control': 'no-store, max-age=0' } }
//     );
//   } catch (error: any) {
//     console.error('Error listing files:', error);
//     return NextResponse.json(
//       { error: `Error listing files: ${error.message}` },
//       { status: 500, headers: { 'Cache-Control': 'no-store, max-age=0' } }
//     );
//   }
// }












// import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
// import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
// import { NextRequest, NextResponse } from 'next/server';

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export async function GET(request: NextRequest) {
//   const params = {
//     Bucket: process.env.AWS_S3_BUCKET_NAME!,
//     Prefix: 'uploads/', // Adjust this prefix as needed
//   };

//   try {
//     const data = await s3Client.send(new ListObjectsV2Command(params));

//     if (!data.Contents || data.Contents.length === 0) {
//       return NextResponse.json({ 
//         filesFound: false, 
//         message: 'No files found in the bucket.', 
//         files: [] 
//       });
//     }

//     const files = await Promise.all(data.Contents.map(async (file) => {
//       const getObjectParams = { Bucket: params.Bucket, Key: file.Key };
//       const url = await getSignedUrl(s3Client, new GetObjectCommand(getObjectParams), { expiresIn: 3600 });
      
//       const splitPath = (file.Key ?? '').split('/');
//       const fileName = splitPath[splitPath.length - 1];

//       return {
//         name: fileName,
//         key: file.Key,
//         url,
//         size: file.Size,
//         lastModified: file.LastModified?.toISOString() ?? '',
//       };
//     }));

//     return NextResponse.json({ 
//       filesFound: true, 
//       message: 'Files retrieved successfully.', 
//       files 
//     });

//   } catch (error: any) {
//     console.error('Error listing files:', error);
//     return NextResponse.json({ 
//       error: `Error listing files: ${error.message}` 
//     }, { status: 500 });
//   }
// }