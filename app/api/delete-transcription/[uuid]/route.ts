import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoDB/dbConnect_SocialContent';
import mongoose, { Connection } from 'mongoose';

// Define the transcription interface
interface ITranscription {
  uuid: string;
  fileKey: string;
  transcription: string;
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

export async function DELETE(req: NextRequest, { params }: { params: { uuid: string } }) {
  try {
    // Establish a database connection
    const conn = await dbConnect();

    // Get or define the transcription model
    const Transcription = getTranscriptionModel(conn);

    // Extract uuid from params
    const { uuid } = params;

    // Delete the transcription by uuid
    const deletedTranscription = await Transcription.findOneAndDelete({ uuid });

    if (!deletedTranscription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }

    // Return success message
    return NextResponse.json({ message: 'Transcription deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting transcription:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

