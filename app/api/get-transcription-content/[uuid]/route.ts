// app/api/get-transcription-content/[uuid]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongoDB/dbConnect_Transcriptions';
import mongoose from 'mongoose';

interface ITranscription {
  uuid: string;
  fileKey: string;
  title: string;
  transcription: string;
  createdAt: Date;
}

const transcriptionSchema = new mongoose.Schema<ITranscription>({
  uuid: { type: String, required: true },
  fileKey: { type: String, required: true },
  title: { type: String, required: true },
  transcription: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

export async function GET(req: NextRequest, { params }: { params: { uuid: string } }) {
  try {
    const { uuid } = params;
    const conn = await dbConnect();
    const Transcription = conn.model<ITranscription>('Transcription', transcriptionSchema);

    const transcription = await Transcription.findOne({ uuid }).lean();

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }

    return NextResponse.json(transcription);
  } catch (error: any) {
    console.error("Error fetching transcription content:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}