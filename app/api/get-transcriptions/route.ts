// app/api/get-transcriptions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoDB/dbConnect_SocialContent';
import mongoose, { Connection } from 'mongoose';

// Define the transcription interface
interface ITranscription {
  uuid: string;
  fileKey: string;
  transcription: string
  title: string;
  createdAt: Date;
}

// Define the transcription schema
const transcriptionSchema = new mongoose.Schema<ITranscription>({
  uuid: { type: String, required: true },
  fileKey: { type: String, required: true },
  transcription: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

// Helper function to get the model
const getTranscriptionModel = (conn: Connection) => {
  return conn.models.Transcription || conn.model<ITranscription>('Transcription', transcriptionSchema);
};

export async function GET(req: NextRequest) {
  try {
    // Establish a database connection
    const conn = await dbConnect();

    // Get or define the transcription model
    const Transcription = getTranscriptionModel(conn);

    // Fetch the transcriptions
    const transcriptions = await Transcription.find({})
      .sort({ createdAt: -1 })
      .select('uuid transcription title createdAt')
      .lean();

    // Return the fetched data as a JSON response
    return NextResponse.json(transcriptions);
  } catch (error: any) {
    console.error("Error fetching transcriptions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';













// // app/api/get-transcriptions/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '../../lib/mongoDB/dbConnect_Transcriptions';
// import mongoose from 'mongoose';

// interface ITranscription {
//   uuid: string;
//   fileKey: string;
//   title: string;
//   createdAt: Date;
// }

// const transcriptionSchema = new mongoose.Schema<ITranscription>({
//   uuid: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   title: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// export async function GET(req: NextRequest) {
//   try {
//     const conn = await dbConnect();
//     const Transcription = conn.model<ITranscription>('Transcription', transcriptionSchema);

//     const transcriptions = await Transcription.find({})
//       .sort({ createdAt: -1 })
//       .select('uuid title createdAt')
//       .lean();

//     return NextResponse.json(transcriptions);
//   } catch (error: any) {
//     console.error("Error fetching transcriptions:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }