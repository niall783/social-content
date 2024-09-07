import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return new NextResponse('Missing prompt. Please provide a valid prompt.', {
        status: 400,
      });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format:{ "type": "json_object" },
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates content based on user prompts. You out put it in json.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const messageContent = completion.choices[0].message?.content;

    if (!messageContent) {
      return new NextResponse('Failed to generate content.', { status: 500 });
    }

    const generatedContent = JSON.parse(messageContent);

    if (!generatedContent) {
      return new NextResponse('Failed to generate content.', { status: 500 });
    }

    const { title, description, tags } = generatedContent;

    return NextResponse.json({ title, description, tags }, { status: 200 });
  } catch (error) {
    console.error('Error occurred:', error);
    return new NextResponse('An error occurred while processing the request.', {
      status: 500,
    });
  }
}












// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(request: NextRequest) {
//   try {
//     const { prompt } = await request.json();

//     if (!prompt) {
//       return new NextResponse('Missing prompt. Please provide a valid prompt.', {
//         status: 400,
//       });
//     }

//     const completion = await openai.chat.completions.create({
//       model: 'gpt-4o-mini',
      // response_format:{ "type": "json_object" },
//       messages: [
//         {
//           role: 'system',
//           content: 'You are a helpful assistant that generates content based on user prompts.',
//         },
//         {
//           role: 'user',
//           content: prompt,
//         },
//       ],
//     });

//     const generatedContent = JSON.parse(completion.choices[0].message.content);

//     if (!generatedContent) {
//       return new NextResponse('Failed to generate content.', { status: 500 });
//     }

//     const { title, description, tags } = generatedContent;

//     return NextResponse.json({ title, description, tags }, { status: 200 });
//   } catch (error) {
//     console.error('Error occurred:', error);
//     return new NextResponse('An error occurred while processing the request.', {
//       status: 500,
//     });
//   }
// }

















// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// interface Tag {
//   name: string;
// }

// export async function POST(request: NextRequest) {
//   try {
//     const { prompt } = await request.json();

//     if (!prompt) {
//       return new NextResponse('Missing prompt. Please provide a valid prompt.', {
//         status: 400,
//       });
//     }

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4o-mini",
//       messages: [
//         {
//           role: "system",
//           content: "You are a helpful assistant that generates content based on user prompts. Return tags as a comma-separated list."
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//     });

//     const generatedContent = completion.choices[0].message.content;

//     if (!generatedContent) {
//       return new NextResponse('Failed to generate content.', { status: 500 });
//     }

//     // Assuming the generated content is in the format: Title\n\nDescription\n\nTag1, Tag2, Tag3, ...
//     const contentParts = generatedContent.split('\n\n');

//     if (contentParts.length !== 3) {
//       return new NextResponse('Generated content is not in the expected format.', { status: 500 });
//     }

//     const [title, description, tagsString] = contentParts;
//     const tags: Tag[] = tagsString.split(',').map(tag => ({ name: tag.trim() }));

//     return NextResponse.json({ title, description, tags }, { status: 200 });
//   } catch (error) {
//     console.error('Error occurred:', error);
//     return new NextResponse('An error occurred while processing the request.', {
//       status: 500,
//     });
//   }
// }











// import { NextRequest, NextResponse } from 'next/server';
// import OpenAI from 'openai';

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(request: NextRequest) {
//   try {
//     const { prompt } = await request.json();

//     if (!prompt) {
//       return new NextResponse('Missing prompt. Please provide a valid prompt.', {
//         status: 400,
//       });
//     }

//     const completion = await openai.chat.completions.create({
//       model: "gpt-4-mini",
//       messages: [
//         {
//           role: "system",
//           content: "You are a helpful assistant that generates content based on user prompts."
//         },
//         {
//           role: "user",
//           content: prompt
//         }
//       ],
//     });

//     const generatedContent = completion.choices[0].message.content;

//     if (!generatedContent) {
//       return new NextResponse('Failed to generate content.', { status: 500 });
//     }

//     // Assuming the generated content is in the format: Title\n\nDescription\n\nTags
//     const contentParts = generatedContent.split('\n\n');

//     if (contentParts.length !== 3) {
//       return new NextResponse('Generated content is not in the expected format.', { status: 500 });
//     }

//     const [title, description, tags] = contentParts;

//     return NextResponse.json({ title, description, tags }, { status: 200 });
//   } catch (error) {
//     console.error('Error occurred:', error);
//     return new NextResponse('An error occurred while processing the request.', {
//       status: 500,
//     });
//   }
// }