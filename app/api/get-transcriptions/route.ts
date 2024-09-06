// app/api/get-transcriptions/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongoDB/dbConnect_Transcriptions';
import mongoose from 'mongoose';

interface ITranscription {
  uuid: string;
  fileKey: string;
  title: string;
  createdAt: Date;
}

const transcriptionSchema = new mongoose.Schema<ITranscription>({
  uuid: { type: String, required: true },
  fileKey: { type: String, required: true },
  title: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

export async function GET(req: NextRequest) {
  try {
    const conn = await dbConnect();
    const Transcription = conn.model<ITranscription>('Transcription', transcriptionSchema);

    const transcriptions = await Transcription.find({})
      .sort({ createdAt: -1 })
      .select('uuid title createdAt')
      .lean();

    return NextResponse.json(transcriptions);
  } catch (error: any) {
    console.error("Error fetching transcriptions:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}