import { NextRequest, NextResponse } from 'next/server';
import OpenAI from "openai";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import fetch from "node-fetch";
import FormData from "form-data";
import dbConnect from '../../../lib/mongoDB/dbConnect_SocialContent'
import mongoose, { Schema, Document, Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

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

interface ITranscription extends Document {
  uuid: string;
  fileKey: string;
  transcription: string;
  title: string;
  createdAt: Date;
}

const transcriptionSchema = new Schema<ITranscription>({
  uuid: { type: String, required: true },
  fileKey: { type: String, required: true },
  transcription: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

let TranscriptionModel: Model<ITranscription>;

function getTranscriptionModel(connection: mongoose.Connection): Model<ITranscription> {
  if (connection.models.Transcription) {
    return connection.models.Transcription as Model<ITranscription>;
  }
  return connection.model<ITranscription>('Transcription', transcriptionSchema);
}

async function generateTitle(transcription: string): Promise<string> {
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are a helpful assistant that generates concise and logical video titles based on transcriptions."
      },
      {
        role: "user",
        content: `Generate a concise and logical video title based on this transcription:\n\n${transcription}. Only output the title and do not include quotes around the title!`
      }
    ],
  });

  return completion.choices[0].message.content?.trim() ?? "Untitled Video";
}

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

    // Generate a title using OpenAI
    const generatedTitle = await generateTitle(data.text);

    // console.log('data', data);
    // console.log('generatedTitle', generatedTitle);

    // Connect to MongoDB
    const conn = await dbConnect();

    // Get or create the Transcription model
    TranscriptionModel = getTranscriptionModel(conn);

    // Save the transcription to MongoDB
    const transcriptionDoc = new TranscriptionModel({
      uuid: uuidv4(),
      fileKey: fileKey,
      transcription: data.text,
      title: generatedTitle,
      createdAt: new Date(),
    });

    await transcriptionDoc.save();

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
      message: "Transcription completed and saved successfully",
      uuid: transcriptionDoc.uuid,
      title: generatedTitle,
      transcriptionFile: transcriptionFileName
    });
  } catch (error: any) {
    console.error("Error processing audio:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


















// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from "openai";
// import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import fetch from "node-fetch";
// import FormData from "form-data";
// import dbConnect from '../../lib/mongoDB/dbConnect_Transcriptions'
// import mongoose, { Schema, Document, Model } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';

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

// interface ITranscription extends Document {
//   transcriptionId: string;
//   fileKey: string;
//   transcription: string;
//   title: string;
//   createdAt: Date;
// }

// const transcriptionSchema = new Schema<ITranscription>({
//  transcriptionId: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   transcription: { type: String, required: true },
//   title: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// let TranscriptionModel: Model<ITranscription>;

// function getTranscriptionModel(connection: mongoose.Connection): Model<ITranscription> {
//   if (connection.models.Transcription) {
//     return connection.models.Transcription as Model<ITranscription>;
//   }
//   return connection.model<ITranscription>('Transcription', transcriptionSchema);
// }

// async function generateTitle(transcription: string): Promise<string> {
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content: "You are a helpful assistant that generates concise and logical video titles based on transcriptions."
//       },
//       {
//         role: "user",
//         content: `Generate a concise and logical video title based on this transcription:\n\n${transcription}. Only output the title!`
//       }
//     ],
//   });

//   return completion.choices[0].message.content?.trim() ?? "Untitled Video";
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const fileKey = body.fileKey;
//   const bucketName = process.env.AWS_S3_BUCKET_NAME!;

//   try {
//     // Get the audio file URL from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
//     const command = new GetObjectCommand(getObjectParams);
//     const audioUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

//     // Fetch the file from S3 using the signed URL
//     const response = await fetch(audioUrl);
//     const audioFile = await response.arrayBuffer();

//     // Prepare the form data to send to OpenAI
//     const form = new FormData();
//     form.append('file', Buffer.from(audioFile), {
//       filename: fileKey,
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

//     // Generate a title using OpenAI
//     const generatedTitle = await generateTitle(data.text);

//     // console.log('data', data);
//     // console.log('generatedTitle', generatedTitle);

//     // Connect to MongoDB
//     const conn = await dbConnect();

//     // Get or create the Transcription model
//     TranscriptionModel = getTranscriptionModel(conn);

//     // Save the transcription to MongoDB
//     const transcriptionDoc = new TranscriptionModel({
//       transcriptionId: uuidv4(),
//       fileKey: fileKey,
//       transcription: data.text,
//       title: generatedTitle,
//       createdAt: new Date(),
//     });

//     await transcriptionDoc.save();

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
//       message: "Transcription completed and saved successfully",
//       transcriptionId: transcriptionDoc.transcriptionId,
//       title: generatedTitle,
//       transcriptionFile: transcriptionFileName
//     });
//   } catch (error: any) {
//     console.error("Error processing audio:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }















// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from "openai";
// import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import fetch from "node-fetch";
// import FormData from "form-data";
// import dbConnect from '../../lib/mongoDB/dbConnect_Transcriptions'
// import mongoose, { Schema, Document, Model } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';

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

// interface ITranscription extends Document {
//   uuid: string;
//   fileKey: string;
//   transcription: string;
//   title: string;
//   createdAt: Date;
// }

// const transcriptionSchema = new Schema<ITranscription>({
//   uuid: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   transcription: { type: String, required: true },
//   title: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// let TranscriptionModel: Model<ITranscription>;

// function getTranscriptionModel(connection: mongoose.Connection): Model<ITranscription> {
//   if (connection.models.Transcription) {
//     return connection.models.Transcription as Model<ITranscription>;
//   }
//   return connection.model<ITranscription>('Transcription', transcriptionSchema);
// }

// async function generateTitle(transcription: string): Promise<string> {
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content: "You are a helpful assistant that generates concise and logical video titles based on transcriptions."
//       },
//       {
//         role: "user",
//         content: `Generate a concise and logical video title based on this transcription:\n\n${transcription}`
//       }
//     ],
//   });

//   return completion.choices[0].message.content?.trim() ?? "Untitled Video";
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const fileKey = body.fileKey;
//   const bucketName = process.env.AWS_S3_BUCKET_NAME!;

//   try {
//     // Get the audio file URL from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
//     const command = new GetObjectCommand(getObjectParams);
//     const audioUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

//     // Fetch the file from S3 using the signed URL
//     const response = await fetch(audioUrl);
//     const audioFile = await response.arrayBuffer();

//     // Prepare the form data to send to OpenAI
//     const form = new FormData();
//     form.append('file', Buffer.from(audioFile), {
//       filename: fileKey,
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

//     // Generate a title using OpenAI
//     const generatedTitle = await generateTitle(data.text);

//     console.log('data', data);
//     console.log('generatedTitle', generatedTitle);

//     // Connect to MongoDB
//     const conn = await dbConnect();

//     // Get or create the Transcription model
//     TranscriptionModel = getTranscriptionModel(conn);

//     // Save the transcription to MongoDB
//     const transcriptionDoc = new TranscriptionModel({
//       uuid: uuidv4(),
//       fileKey: fileKey,
//       transcription: data.text,
//       title: generatedTitle,
//       createdAt: new Date(),
//     });

//     await transcriptionDoc.save();

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
//       message: "Transcription completed and saved successfully",
//       uuid: transcriptionDoc.uuid,
//       title: generatedTitle,
//       transcriptionFile: transcriptionFileName
//     });
//   } catch (error: any) {
//     console.error("Error processing audio:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }











// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from "openai";
// import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import fetch from "node-fetch";
// import FormData from "form-data";
// import dbConnect from '../../lib/mongoDB/dbConnect_Transcriptions'
// import mongoose, { Schema, Document, Model } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';

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

// interface ITranscription extends Document {
//   uuid: string;
//   fileKey: string;
//   transcription: string;
//   title: string;
//   createdAt: Date;
// }

// const transcriptionSchema = new Schema<ITranscription>({
//   uuid: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   transcription: { type: String, required: true },
//   title: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// let TranscriptionModel: Model<ITranscription>;

// async function getTranscriptionModel(): Promise<Model<ITranscription>> {
//   if (mongoose.models.Transcription) {
//     return mongoose.models.Transcription as Model<ITranscription>;
//   }
//   return mongoose.model<ITranscription>('Transcription', transcriptionSchema);
// }

// async function generateTitle(transcription: string): Promise<string> {
//   const completion = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       {
//         role: "system",
//         content: "You are a helpful assistant that generates concise and logical video titles based on transcriptions."
//       },
//       {
//         role: "user",
//         content: `Generate a concise and logical video title based on this transcription:\n\n${transcription}`
//       }
//     ],
//   });

//   return completion.choices[0].message.content?.trim() ?? "Untitled Video";
// }

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const fileKey = body.fileKey;
//   const bucketName = process.env.AWS_S3_BUCKET_NAME!;

//   try {
//     // Get the audio file URL from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
//     const command = new GetObjectCommand(getObjectParams);
//     const audioUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

//     // Fetch the file from S3 using the signed URL
//     const response = await fetch(audioUrl);
//     const audioFile = await response.arrayBuffer();

//     // Prepare the form data to send to OpenAI
//     const form = new FormData();
//     form.append('file', Buffer.from(audioFile), {
//       filename: fileKey,
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

//     // Generate a title using OpenAI
//     const generatedTitle = await generateTitle(data.text);


//     console.log('data',data)
//     console.log('generatedTitle', generatedTitle)

//     // Connect to MongoDB with a timeout
//     const conn = await dbConnect();
//     if (!conn) {
//       throw new Error('Failed to connect to MongoDB');
//     }

//     // Get or create the Transcription model
//     TranscriptionModel = await getTranscriptionModel();

//     // Save the transcription to MongoDB
//     const transcriptionDoc = new TranscriptionModel({
//       uuid: uuidv4(),
//       fileKey: fileKey,
//       transcription: data.text,
//       title: generatedTitle,
//       createdAt: new Date(),
//     });

//     await transcriptionDoc.save();

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
//       message: "Transcription completed and saved successfully",
//       uuid: transcriptionDoc.uuid,
//       title: generatedTitle,
//       transcriptionFile: transcriptionFileName
//     });
//   } catch (error: any) {
//     console.error("Error processing audio:", error);
//     let errorMessage = error.message;
//     if (error instanceof mongoose.Error.MongooseServerSelectionError) {
//       errorMessage = "Failed to connect to MongoDB. Please check your connection string and ensure the MongoDB server is running.";
//     }
//     return NextResponse.json({ error: errorMessage }, { status: 500 });
//   }
// }









// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from "openai";
// import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import fetch from "node-fetch";
// import FormData from "form-data";
// import dbConnect from '../../lib/mongoDB/dbConnect_Transcriptions'
// import mongoose, { Schema, Document } from 'mongoose';
// import { v4 as uuidv4 } from 'uuid';

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

// interface ITranscription extends Document {
//   transcriptionId: string;
//   fileKey: string;
//   transcription: string;
//   createdAt: Date;
// }

// const transcriptionSchema = new Schema<ITranscription>({
//   transcriptionId: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   transcription: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// export async function POST(req: NextRequest) {
//   const body = await req.json();
//   const fileKey = body.fileKey;
//   const bucketName = process.env.AWS_S3_BUCKET_NAME!;

//   try {
//     // Get the audio file URL from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
//     const command = new GetObjectCommand(getObjectParams);
//     const audioUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

//     // Fetch the file from S3 using the signed URL
//     const response = await fetch(audioUrl);
//     const audioFile = await response.arrayBuffer();

//     // Prepare the form data to send to OpenAI
//     const form = new FormData();
//     form.append('file', Buffer.from(audioFile), {
//       filename: fileKey,
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

//     // Connect to MongoDB
//     const conn = await dbConnect();

//     // Create the Transcription model
//     const Transcription = conn.model<ITranscription>('Transcription', transcriptionSchema);

//     // Save the transcription to MongoDB
//     const transcriptionDoc = new Transcription({
//       transcriptionId: uuidv4(),
//       fileKey: fileKey,
//       transcription: data.text,
//       createdAt: new Date(),
//     });

//     await transcriptionDoc.save();

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
//       message: "Transcription completed and saved successfully",
//       transcriptionId: transcriptionDoc.transcriptionId,
//       transcriptionFile: transcriptionFileName
//     });
//   } catch (error: any) {
//     console.error("Error processing audio:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }











// // app/api/transcribe-and-save/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import OpenAI from "openai";
// import { v4 as uuidv4 } from 'uuid';
// import dbConnect from '../../lib/mongoDB/dbConnect_Transcriptions'
// import mongoose, { Schema, Document } from 'mongoose';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
//   },
// });

// interface ITranscription extends Document {
//   transcriptionId: string;
//   fileKey: string;
//   transcription: string;
//   createdAt: Date;
// }

// const transcriptionSchema = new Schema<ITranscription>({
//   transcriptionId: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   transcription: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// export async function POST(request: NextRequest): Promise<NextResponse> {
//   try {
//     const { fileKey } = await request.json();
//     const bucketName = process.env.AWS_S3_BUCKET_NAME;

//     console.log('filekey', fileKey)

//     if (!bucketName) {
//       throw new Error('S3_BUCKET_NAME environment variable is not set');
//     }

//     // Get the audio file URL from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
//     const command = new GetObjectCommand(getObjectParams);
//     const audioUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

//     // Fetch the file as ArrayBuffer
//     const response = await fetch(audioUrl);
//     const arrayBuffer = await response.arrayBuffer();

//     // Create a File object from the ArrayBuffer
//     const file = new File([arrayBuffer], fileKey, { type: response.headers.get('content-type') || 'audio/mpeg' });

//     // Transcribe the audio using OpenAI
//     const transcription = await openai.audio.transcriptions.create({
//       file: file,
//       model: "whisper-1",
//     });

//     // Connect to MongoDB
//     const conn = await dbConnect();

//     // Create the Transcription model
//     const Transcription = conn.model<ITranscription>('Transcription', transcriptionSchema);

//     // Save the transcription to MongoDB
//     const transcriptionDoc = new Transcription({
//       transcriptionId: uuidv4(),
//       fileKey: fileKey,
//       transcription: transcription.text,
//       createdAt: new Date(),
//     });

//     await transcriptionDoc.save();

//     return NextResponse.json({
//       message: 'Transcription completed and saved to MongoDB',
//       transcriptionId: transcriptionDoc.transcriptionId
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Error occurred:', error);
//     return NextResponse.json({ error: (error as Error).message }, { status: 500 });
//   }
// }














// // app/api/transcribe-and-save/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import OpenAI from "openai";
// import { v4 as uuidv4 } from 'uuid';
// import dbConnect from '../../lib/mongoDB/dbConnect_Transcriptions'
// ;
// import mongoose, { Schema, Document } from 'mongoose';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// const s3Client = new S3Client({
//   region: process.env.AWS_REGION,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
//   },
// });

// interface ITranscription extends Document {
//   transcriptionId: string;
//   fileKey: string;
//   transcription: string;
//   createdAt: Date;
// }

// const transcriptionSchema = new Schema<ITranscription>({
//   transcriptionId: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   transcription: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// export async function POST(request: NextRequest): Promise<NextResponse> {
//   try {
//     const { fileKey } = await request.json();
//     const bucketName = process.env.S3_BUCKET_NAME;

//     if (!bucketName) {
//       throw new Error('S3_BUCKET_NAME environment variable is not set');
//     }

//     // Get the audio file URL from S3
//     const getObjectParams = {
//       Bucket: bucketName,
//       Key: fileKey,
//     };
//     const command = new GetObjectCommand(getObjectParams);
//     const audioUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

//     // Transcribe the audio using OpenAI
//     const transcription = await openai.audio.transcriptions.create({
//       file: await fetch(audioUrl).then(res => res.blob()),
//       model: "whisper-1",
//     });

//     // Connect to MongoDB
//     const conn = await dbConnect();

//     // Create the Transcription model
//     const Transcription = conn.model<ITranscription>('Transcription', transcriptionSchema);

//     // Save the transcription to MongoDB
//     const transcriptionDoc = new Transcription({
//       transcriptionId: uuidv4(),
//       fileKey: fileKey,
//       transcription: transcription.text,
//       createdAt: new Date(),
//     });

//     await transcriptionDoc.save();

//     return NextResponse.json({
//       message: 'Transcription completed and saved to MongoDB',
//       transcriptionId: transcriptionDoc.transcriptionId
//     }, { status: 200 });
//   } catch (error) {
//     console.error('Error occurred:', error);
//     return NextResponse.json({ error: (error as Error).message }, { status: 500 });
//   }
// }