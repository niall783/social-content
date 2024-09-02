// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from "openai";
// import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import fetch from "node-fetch";
// import FormData from "form-data";

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const fileKey = body.fileKey;
//   const bucketName = process.env.AWS_S3_BUCKET_NAME!;

//   try {
//     // Get the audio file from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
//     const { Body } = await s3Client.send(new GetObjectCommand(getObjectParams));
    
//     if (!Body) {
//       throw new Error("Failed to retrieve file from S3");
//     }

//     // Convert the ReadableStream to a Buffer
//     const chunks = [];
//     for await (const chunk of Body as AsyncIterable<Uint8Array>) {
//       chunks.push(chunk);
//     }
//     const audioBuffer = Buffer.concat(chunks);

//     // Prepare the form data to send to OpenAI
//     const form = new FormData();
//     form.append('file', audioBuffer, {
//       filename: 'audio.mp3',
//       contentType: 'audio/mpeg',
//     });
//     form.append('model', 'whisper-1');

//     // Send the audio file to OpenAI for transcription
//     const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         ...form.getHeaders(),
//       },
//       body: form,
//     });

//     if (!transcribeResponse.ok) {
//       throw new Error(`OpenAI API responded with status ${transcribeResponse.status}`);
//     }

    
//     const data = await transcribeResponse.json();

//     // Save the transcription to a new file in S3
//     const transcriptionFileName = `${fileKey.split('.')[0]}_transcription.txt`;
//     const uploadCommand = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: transcriptionFileName,
//       Body: data.text,
//       ContentType: "text/plain",
//     });
//     await s3Client.send(uploadCommand);

//     return NextResponse.json({
//       message: "Transcription completed successfully",
//       transcriptionFile: transcriptionFileName
//     });
//   } catch (error: any) {
//     console.error("Error processing file:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }









// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from "openai";
// import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import fetch from "node-fetch";
// import FormData from "form-data";
// import ffmpeg from 'fluent-ffmpeg';
// import { Readable } from 'stream';
// import fs from 'fs';
// import os from 'os';
// import path from 'path';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });

// async function extractAudioFromVideo(inputBuffer: Buffer): Promise<Buffer> {
//   return new Promise((resolve, reject) => {
//     const tempDir = os.tmpdir();
//     const inputPath = path.join(tempDir, 'input_video.mp4');
//     const outputPath = path.join(tempDir, 'output_audio.mp3');

//     fs.writeFileSync(inputPath, inputBuffer);

//     ffmpeg(inputPath)
//       .outputOptions('-vn')
//       .audioCodec('libmp3lame')
//       .audioQuality(0)
//       .output(outputPath)
//       .on('end', () => {
//         const audioBuffer = fs.readFileSync(outputPath);
//         fs.unlinkSync(inputPath);
//         fs.unlinkSync(outputPath);
//         resolve(audioBuffer);
//       })
//       .on('error', (err) => {
//         fs.unlinkSync(inputPath);
//         reject(err);
//       })
//       .run();
//   });
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const fileKey = body.fileKey;
//   const bucketName = process.env.AWS_S3_BUCKET_NAME!;

//   try {
//     // Get the file URL from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
//     const command = new GetObjectCommand(getObjectParams);
//     const fileUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

//     // Fetch the file from S3 using the signed URL
//     const response = await fetch(fileUrl);
//     const fileBuffer = await response.arrayBuffer();

//     // Determine if it's a video file and extract audio if necessary
//     let audioBuffer: Buffer;
//     const fileExtension = path.extname(fileKey).toLowerCase();
//     if (['.mp4', '.avi', '.mov', '.wmv', '.flv'].includes(fileExtension)) {
//       audioBuffer = await extractAudioFromVideo(Buffer.from(fileBuffer));
//     } else {
//       audioBuffer = Buffer.from(fileBuffer);
//     }

//     // Prepare the form data to send to OpenAI
//     const form = new FormData();
//     form.append('file', audioBuffer, {
//       filename: 'audio.mp3',
//       contentType: 'audio/mpeg',
//     });
//     form.append('model', 'whisper-1');

//     // Send the audio file to OpenAI for transcription
//     const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
//       method: 'POST',
//       headers: {
//         'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
//         ...form.getHeaders(),
//       },
//       body: form,
//     });

//     const data = await transcribeResponse.json();

//     // Save the transcription to a new file in S3
//     const transcriptionFileName = `${fileKey.split('.')[0]}_transcription.txt`;
//     const uploadCommand = new PutObjectCommand({
//       Bucket: bucketName,
//       Key: transcriptionFileName,
//       Body: data.text,
//       ContentType: "text/plain",
//     });
//     console.log('body', data)
//     await s3Client.send(uploadCommand);

//     // If it was a video file, save the extracted audio as well
//     if (['.mp4', '.avi', '.mov', '.wmv', '.flv'].includes(fileExtension)) {
//       const extractedAudioFileName = `${fileKey.split('.')[0]}_audio.mp3`;
//       const uploadAudioCommand = new PutObjectCommand({
//         Bucket: bucketName,
//         Key: extractedAudioFileName,
//         Body: audioBuffer,
//         ContentType: "audio/mpeg",
//       });
//       await s3Client.send(uploadAudioCommand);
//     }

//     return NextResponse.json({
//       message: "Transcription completed successfully",
//       transcriptionFile: transcriptionFileName,
//       extractedAudioFile: ['.mp4', '.avi', '.mov', '.wmv', '.flv'].includes(fileExtension) 
//         ? `${fileKey.split('.')[0]}_audio.mp3` 
//         : undefined
//     });
//   } catch (error: any) {
//     console.error("Error processing file:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }










import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";
import FormData from "form-data";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const fileKey = body.fileKey;
  const bucketName = process.env.AWS_S3_BUCKET_NAME!;

  try {
    // Get the audio file URL from S3
    const getObjectParams = {
      Bucket: bucketName,
      Key: fileKey,
    };
    const command = new GetObjectCommand(getObjectParams);
    const audioUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

    // Fetch the file from S3 using the signed URL
    const response = await fetch(audioUrl);
    const audioFile = await response.arrayBuffer();

    // Prepare the form data to send to OpenAI
    const form = new FormData();
    form.append('file', Buffer.from(audioFile), {
      filename: fileKey,
      contentType: 'audio/mpeg',
    });
    form.append('model', 'whisper-1');

    // Send the audio file to OpenAI for transcription
    const transcribeResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        ...form.getHeaders(),
      },
      body: form,
    });

    const data = await transcribeResponse.json();

    // Save the transcription to a new file in S3
    const transcriptionFileName = `${fileKey.split('.')[0]}_transcription.txt`;
    const uploadCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: transcriptionFileName,
      Body: data.text,
      ContentType: "text/plain",
    });
    await s3Client.send(uploadCommand);

    return NextResponse.json({ 
      message: "Transcription completed successfully", 
      transcriptionFile: transcriptionFileName 
    });
  } catch (error: any) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}