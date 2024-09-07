import { NextRequest, NextResponse } from 'next/server';
import mongoose, { Schema, Document, Model } from 'mongoose';
import dbConnect from '@/lib/mongoDB/dbConnect_SocialContent';
import { v4 as uuidv4 } from 'uuid';

// Define the Prompt interface and schema
interface IPrompt extends Document {
  uuid: string;
  promptName: string;
  prompt: string;
}

const promptSchema = new Schema<IPrompt>({
  uuid: { type: String, required: true },
  promptName: { type: String, required: true, unique: true },
  prompt: { type: String, required: true },
});

// Define a helper function to get the Prompt model
let PromptModel: Model<IPrompt>;

function getPromptModel(connection: mongoose.Connection): Model<IPrompt> {
  if (connection.models.Prompt) {
    return connection.models.Prompt as Model<IPrompt>;
  }
  return connection.model<IPrompt>('Prompt', promptSchema);
}

// Handle GET request to fetch a prompt by promptName
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);  // Accessing the searchParams
  const promptName = searchParams.get('promptName');  // Get 'promptName' query param

  if (!promptName) {
    return NextResponse.json({ error: 'Prompt name is required' }, { status: 400 });
  }

  try {
    // Connect to MongoDB using the existing dbConnect function
    const conn = await dbConnect();

    // Get the Prompt model
    PromptModel = getPromptModel(conn);

    // Fetch the prompt from the database
    const promptDoc = await PromptModel.findOne({ promptName });

    if (!promptDoc) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    return NextResponse.json({ prompt: promptDoc.prompt });
  } catch (error: any) {
    console.error('Error fetching prompt:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Handle PUT request to update or create a prompt
export async function PUT(req: NextRequest) {
  const body = await req.json();
  const { promptName, prompt } = body;

  if (!promptName || !prompt) {
    return NextResponse.json({ error: 'Prompt name and prompt are required' }, { status: 400 });
  }

  try {
    // Connect to MongoDB using the existing dbConnect function
    const conn = await dbConnect();

    // Get the Prompt model
    PromptModel = getPromptModel(conn);

    // Find existing prompt or create new one
    let updatedPrompt = await PromptModel.findOne({ promptName });

    // If the prompt doesn't exist, create a new document
    if (!updatedPrompt) {
      updatedPrompt = new PromptModel({
        uuid: uuidv4(), // Generate a new UUID
        promptName,
        prompt,
      });
    } else {
      // If the prompt exists, update its prompt field
      updatedPrompt.prompt = prompt;
    }

    // Save the updated (or new) prompt document
    await updatedPrompt.save();

    return NextResponse.json({ prompt: updatedPrompt.prompt });
  } catch (error: any) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
















// import { NextRequest, NextResponse } from 'next/server';
// import mongoose, { Schema, Document, Model } from 'mongoose';
// import dbConnect from '@/lib/mongoDB/dbConnect_SocialContent';

// // Define the Prompt interface and schema
// interface IPrompt extends Document {
//   uuid: string;
//   promptName: string;
//   prompt: string;
// }

// const promptSchema = new Schema<IPrompt>({
//   uuid: { type: String, required: true },
//   promptName: { type: String, required: true, unique: true },
//   prompt: { type: String, required: true },
// });

// // Define a helper function to get the Prompt model
// let PromptModel: Model<IPrompt>;

// function getPromptModel(connection: mongoose.Connection): Model<IPrompt> {
//   if (connection.models.Prompt) {
//     return connection.models.Prompt as Model<IPrompt>;
//   }
//   return connection.model<IPrompt>('Prompt', promptSchema);
// }

// // Handle GET request to fetch a prompt by promptName
// export async function GET(req: NextRequest) {
//   const { searchParams } = new URL(req.url);  // Accessing the searchParams
//   const promptName = searchParams.get('promptName');  // Get 'promptName' query param

//   if (!promptName) {
//     return NextResponse.json({ error: 'Prompt name is required' }, { status: 400 });
//   }

//   try {
//     // Connect to MongoDB using the existing dbConnect function
//     const conn = await dbConnect();

//     // Get the Prompt model
//     PromptModel = getPromptModel(conn);

//     // Fetch the prompt from the database
//     const promptDoc = await PromptModel.findOne({ promptName });

//     if (!promptDoc) {
//       return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
//     }

//     return NextResponse.json({ prompt: promptDoc.prompt });
//   } catch (error: any) {
//     console.error('Error fetching prompt:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }

// // Handle PUT request to update or create a prompt
// export async function PUT(req: NextRequest) {
//   const body = await req.json();
//   const { promptName, prompt } = body;

//   if (!promptName || !prompt) {
//     return NextResponse.json({ error: 'Prompt name and prompt are required' }, { status: 400 });
//   }

//   try {
//     // Connect to MongoDB using the existing dbConnect function
//     const conn = await dbConnect();

//     // Get the Prompt model
//     PromptModel = getPromptModel(conn);

//     // Update or create the prompt document in the database
//     const updatedPrompt = await PromptModel.findOneAndUpdate(
//       { promptName },
//       { prompt },
//       { new: true, upsert: true } // Upsert: create the document if it doesn't exist
//     );

//     return NextResponse.json({ prompt: updatedPrompt.prompt });
//   } catch (error: any) {
//     console.error('Error updating prompt:', error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }
