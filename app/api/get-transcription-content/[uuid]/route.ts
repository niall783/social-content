import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../../lib/mongoDB/dbConnect_SocialContent';
import mongoose, { Connection } from 'mongoose';

// Define the transcription interface
interface ITranscription {
  uuid: string;
  fileKey: string;
  title: string;
  transcription: string;
  createdAt: Date;
}

// Define the transcription schema
const transcriptionSchema = new mongoose.Schema<ITranscription>({
  uuid: { type: String, required: true },
  fileKey: { type: String, required: true },
  title: { type: String, required: true },
  transcription: { type: String, required: true },
  createdAt: { type: Date, required: true },
});

// Helper function to get the model
const getTranscriptionModel = (conn: Connection) => {
  return conn.models.Transcription || conn.model<ITranscription>('Transcription', transcriptionSchema);
};

export async function GET(req: NextRequest, { params }: { params: { uuid: string } }) {
  try {
    const { uuid } = params;

    // Establish a database connection
    const conn = await dbConnect();

    // Get or define the transcription model
    const Transcription = getTranscriptionModel(conn);

    // Fetch the transcription by uuid
    const transcription = await Transcription.findOne({ uuid }).lean();

    if (!transcription) {
      return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
    }

    // Return the transcription content
    return NextResponse.json(transcription);
  } catch (error: any) {
    console.error('Error fetching transcription content:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}












// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '../../../../lib/mongoDB/dbConnect_Transcriptions';
// import mongoose from 'mongoose';

// // Define transcription interface
// interface ITranscription {
//   uuid: string;
//   fileKey: string;
//   title: string;
//   transcription: string;
//   createdAt: Date;
// }

// // Define the transcription schema
// const transcriptionSchema = new mongoose.Schema<ITranscription>({
//   uuid: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   title: { type: String, required: true },
//   transcription: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// // Helper function to get or create the Transcription model
// const getTranscriptionModel = () => {
//   return mongoose.models.Transcription || mongoose.model<ITranscription>('Transcription', transcriptionSchema);
// };

// export async function GET(req: NextRequest, { params }: { params: { uuid: string } }) {
//   try {
//     const { uuid } = params;

//     console.log('uuid',uuid)

//     // Establish the database connection
//     await dbConnect();

//     // Get or create the Transcription model
//     const Transcription = getTranscriptionModel();

//     // Fetch the transcription by uuid
//     const transcription = await Transcription.findOne({ uuid }).lean();

//     if (!transcription) {
//       return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
//     }

//     // Return the transcription content
//     return NextResponse.json(transcription);
//   } catch (error: any) {
//     console.error('Error fetching transcription content:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }















// // app/api/get-transcription-content/[uuid]/route.ts

// import { NextRequest, NextResponse } from 'next/server';
// import dbConnect from '../../../../lib/mongoDB/dbConnect_Transcriptions';
// import mongoose from 'mongoose';

// interface ITranscription {
//   uuid: string;
//   fileKey: string;
//   title: string;
//   transcription: string;
//   createdAt: Date;
// }

// const transcriptionSchema = new mongoose.Schema<ITranscription>({
//   uuid: { type: String, required: true },
//   fileKey: { type: String, required: true },
//   title: { type: String, required: true },
//   transcription: { type: String, required: true },
//   createdAt: { type: Date, required: true },
// });

// export async function GET(req: NextRequest, { params }: { params: { uuid: string } }) {
//   try {
//     const { uuid } = params;
//     const conn = await dbConnect();
//     const Transcription = conn.model<ITranscription>('Transcription', transcriptionSchema);

//     const transcription = await Transcription.findOne({ uuid }).lean();

//     if (!transcription) {
//       return NextResponse.json({ error: 'Transcription not found' }, { status: 404 });
//     }

//     return NextResponse.json(transcription);
//   } catch (error: any) {
//     console.error("Error fetching transcription content:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }