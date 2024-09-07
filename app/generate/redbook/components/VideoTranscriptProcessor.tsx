import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface GeneratedContent {
  title: string;
  description: string;
  tags: string[];
}

interface VideoTranscriptProcessorProps {
  transcriptText: string;
  setTranscriptText: React.Dispatch<React.SetStateAction<string>>;
}

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
  <button
    {...props}
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea
    {...props}
    className="w-full text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="px-4 py-5 sm:px-6">
      <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
    </div>
    <div className="px-4 py-5 sm:p-6">{children}</div>
  </div>
);

const CopyButton: React.FC<{ text: string }> = ({ text }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <button
      onClick={copyToClipboard}
      className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      <ClipboardIcon className="h-5 w-5 text-gray-500" />
    </button>
  );
};

const VideoTranscriptProcessor: React.FC<VideoTranscriptProcessorProps> = ({ transcriptText, setTranscriptText }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await fetch('/api/prompts?promptName=RedBook_Prompt');
        const data = await response.json();
        if (data.prompt) {
          setPrompt(data.prompt);
        }
      } catch (error) {
        toast.error('Error fetching prompt');
        console.error('Error fetching prompt:', error);
      }
    };

    fetchPrompt();
  }, []);

  const handlePromptSave = async () => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptName: 'RedBook_Prompt', prompt }),
      });
      if (!response.ok) throw new Error('Failed to save the prompt');
      toast.success('Prompt saved successfully');
    } catch (error) {
      toast.error('Failed to save the prompt. Please try again.');
      console.error('Error saving prompt:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate-video-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${prompt}\n\n${transcriptText}` }),
      });

      if (!response.ok) throw new Error('Failed to generate content');

      const data: GeneratedContent = await response.json();
      setGeneratedContent(data);
      toast.success('Content generated successfully');
    } catch (error) {
      toast.error('Failed to generate content. Please try again.');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Edit the prompt here..."
          rows={5}
        />
        <Button type="button" onClick={handlePromptSave}>
          Save Prompt
        </Button>
        <Textarea
          value={transcriptText}
          onChange={(e) => setTranscriptText(e.target.value)}
          placeholder="Paste your video transcript here or use the 'Set for Processing' button in the Transcription List"
          rows={5}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Content'}
        </Button>
      </form>

      {generatedContent && (
        <div className="mt-8 space-y-4">
          <Card title="Title (Chinese)">
            <div className="flex justify-between items-center">
              <p className="text-gray-700">{generatedContent.title}</p>
              <CopyButton text={generatedContent.title} />
            </div>
          </Card>

          <Card title="Description (Chinese)">
            <div className="flex justify-between items-center">
              <p className="text-gray-700">{generatedContent.description}</p>
              <CopyButton text={generatedContent.description} />
            </div>
          </Card>

          <Card title="Tags (Chinese)">
            <div className="grid grid-cols-2 gap-4">
              {generatedContent.tags.map((tag, index) => (
                <div key={index} className="bg-gray-100 p-2 rounded relative">
                  <p className="text-gray-700 pr-8">{tag}</p>
                  <div className="absolute top-1 right-1">
                    <CopyButton text={tag} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VideoTranscriptProcessor;


















// 'use client';
// //VideoTranscriptProcessor.tsx

// import React, { useState, useEffect } from 'react';
// import { ClipboardIcon } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';

// interface GeneratedContent {
//   title: string;
//   description: string;
//   tags: string[];
// }

// const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
//   <button
//     {...props}
//     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
//   >
//     {children}
//   </button>
// );

// const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
//   <textarea
//     {...props}
//     className="w-full text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//   />
// );

// const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
//   <div className="bg-white shadow-md rounded-lg overflow-hidden">
//     <div className="px-4 py-5 sm:px-6">
//       <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//     </div>
//     <div className="px-4 py-5 sm:p-6">{children}</div>
//   </div>
// );

// const CopyButton: React.FC<{ text: string }> = ({ text }) => {
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(text);
//     toast.success('Copied to clipboard!');
//   };

//   return (
//     <button
//       onClick={copyToClipboard}
//       className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//     >
//       <ClipboardIcon className="h-5 w-5 text-gray-500" />
//     </button>
//   );
// };

// const VideoTranscriptProcessor: React.FC = () => {
//   const [transcript, setTranscript] = useState<string>('');
//   const [prompt, setPrompt] = useState<string>(''); // Initially empty
//   const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   // Load prompt from MongoDB when the component loads
//   useEffect(() => {
//     const fetchPrompt = async () => {
//       try {
//         const response = await fetch('/api/prompts?promptName=RedBook_Prompt');
//         const data = await response.json();
//         if (data.prompt) {
//           setPrompt(data.prompt); // Set the prompt from MongoDB
//         }
//       } catch (error) {
//         toast.error('Error fetching prompt');
//         console.error('Error fetching prompt:', error);
//       }
//     };

//     fetchPrompt();
//   }, []);

//   const handlePromptSave = async () => {
//     try {
//       const response = await fetch('/api/prompts', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ promptName: 'RedBook_Prompt', prompt }),
//       });
//       if (!response.ok) throw new Error('Failed to save the prompt');
//       toast.success('Prompt saved successfully');
//     } catch (error) {
//       toast.error('Failed to save the prompt. Please try again.');
//       console.error('Error saving prompt:', error);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/generate-video-info', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: `${prompt}\n\n${transcript}` }),
//       });

//       if (!response.ok) throw new Error('Failed to generate content');

//       const data: GeneratedContent = await response.json();
//       setGeneratedContent(data);
//       toast.success('Content generated successfully');
//       console.log('data', data);
//     } catch (error) {
//       toast.error('Failed to generate content. Please try again.');
//       console.error('Error:', error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Textarea
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Edit the prompt here..."
//           rows={5}
//         />
//         <Button type="button" onClick={handlePromptSave}>
//           Save Prompt
//         </Button>
//         <Textarea
//           value={transcript}
//           onChange={(e) => setTranscript(e.target.value)}
//           placeholder="Paste your video transcript here..."
//           rows={5}
//         />
//         <Button type="submit" disabled={isLoading}>
//           {isLoading ? 'Generating...' : 'Generate Content'}
//         </Button>
//       </form>

//       {generatedContent && (
//         <div className="mt-8 space-y-4">
//           <Card title="Title (Chinese)">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-700">{generatedContent.title}</p>
//               <CopyButton text={generatedContent.title} />
//             </div>
//           </Card>

//           <Card title="Description (Chinese)">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-700">{generatedContent.description}</p>
//               <CopyButton text={generatedContent.description} />
//             </div>
//           </Card>

//           <Card title="Tags (Chinese)">
//             <div className="grid grid-cols-2 gap-4">
//               {generatedContent.tags.map((tag, index) => (
//                 <div key={index} className="bg-gray-100 p-2 rounded relative">
//                   <p className="text-gray-700 pr-8">{tag}</p>
//                   <div className="absolute top-1 right-1">
//                     <CopyButton text={tag} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoTranscriptProcessor;














// 'use client';

// import React, { useState, useEffect } from 'react';
// import { ClipboardIcon } from '@heroicons/react/24/outline';
// import { toast } from 'react-hot-toast';


// interface GeneratedContent {
//   title: string;
//   description: string;
//   tags: string[];
// }

// const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
//   <button
//     {...props}
//     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
//   >
//     {children}
//   </button>
// );

// const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
//   <textarea
//     {...props}
//     className="w-full text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//   />
// );

// const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
//   <div className="bg-white shadow-md rounded-lg overflow-hidden">
//     <div className="px-4 py-5 sm:px-6">
//       <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//     </div>
//     <div className="px-4 py-5 sm:p-6">{children}</div>
//   </div>
// );

// const CopyButton: React.FC<{ text: string }> = ({ text }) => {
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(text);
//   };

//   return (
//     <button
//       onClick={copyToClipboard}
//       className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//     >
//       <ClipboardIcon className="h-5 w-5 text-gray-500" />
//     </button>
//   );
// };

// const VideoTranscriptProcessor: React.FC = () => {
//   const [transcript, setTranscript] = useState<string>('');
//   const [prompt, setPrompt] = useState<string>(''); // Initially empty
//   const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   // Load prompt from MongoDB when the component loads
//   useEffect(() => {
//     const fetchPrompt = async () => {
//       try {
//         const response = await fetch('/api/prompts?promptName=RedBook_Prompt');
//         const data = await response.json();
//         if (data.prompt) {
//           setPrompt(data.prompt); // Set the prompt from MongoDB
//         }
//       } catch (error) {
//         console.error('Error fetching prompt:', error);
//       }
//     };

//     fetchPrompt();
//   }, []);

//   const handlePromptSave = async () => {
//     try {
//       const response = await fetch('/api/prompts', {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ promptName: 'RedBook_Prompt', prompt }),
//       });
//       if (!response.ok) throw new Error('Failed to save the prompt');
//       alert('Prompt saved successfully');
//     } catch (error) {
//       console.error('Error saving prompt:', error);
//       alert('Failed to save the prompt. Please try again.');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/generate-video-info', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: `${prompt}\n\n${transcript}` }),
//       });

//       if (!response.ok) throw new Error('Failed to generate content');

//       const data: GeneratedContent = await response.json();
//       setGeneratedContent(data);
//       console.log('data', data);
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to generate content. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Textarea
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Edit the prompt here..."
//           rows={5}
//         />
//         <Button type="button" onClick={handlePromptSave}>
//           Save Prompt
//         </Button>
//         <Textarea
//           value={transcript}
//           onChange={(e) => setTranscript(e.target.value)}
//           placeholder="Paste your video transcript here..."
//           rows={5}
//         />
//         <Button type="submit" disabled={isLoading}>
//           {isLoading ? 'Generating...' : 'Generate Content'}
//         </Button>
//       </form>

//       {generatedContent && (
//         <div className="mt-8 space-y-4">
//           <Card title="Title (Chinese)">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-700">{generatedContent.title}</p>
//               <CopyButton text={generatedContent.title} />
//             </div>
//           </Card>

//           <Card title="Description (Chinese)">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-700">{generatedContent.description}</p>
//               <CopyButton text={generatedContent.description} />
//             </div>
//           </Card>

//           <Card title="Tags (Chinese)">
//             <div className="grid grid-cols-2 gap-4">
//               {generatedContent.tags.map((tag, index) => (
//                 <div key={index} className="bg-gray-100 p-2 rounded relative">
//                   <p className="text-gray-700 pr-8">{tag}</p>
//                   <div className="absolute top-1 right-1">
//                     <CopyButton text={tag} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoTranscriptProcessor;














// 'use client'

// import React, { useState } from 'react';
// import { ClipboardIcon } from '@heroicons/react/24/outline';



// interface GeneratedContent {
//   title: string;
//   description: string;
//   tags: string[];
// }

// const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
//   <button
//     {...props}
//     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
//   >
//     {children}
//   </button>
// );

// const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
//   <textarea
//     {...props}
//     className="w-full text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//   />
// );

// const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
//   <div className="bg-white shadow-md rounded-lg overflow-hidden">
//     <div className="px-4 py-5 sm:px-6">
//       <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//     </div>
//     <div className="px-4 py-5 sm:p-6">{children}</div>
//   </div>
// );

// const CopyButton: React.FC<{ text: string }> = ({ text }) => {
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(text);
//   };

//   return (
//     <button
//       onClick={copyToClipboard}
//       className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//     >
//       <ClipboardIcon className="h-5 w-5 text-gray-500" />
//     </button>
//   );
// };

// const VideoTranscriptProcessor: React.FC = () => {
//   const [transcript, setTranscript] = useState<string>('');
//   const [prompt, setPrompt] = useState<string>(
    // `Please generate a short video title (5-10 characters), an engaging description, and 3-5 relevant tags for a Little Red Book post based on the following video transcript. All content should be in Chinese.`
//   );
//   const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/generate-video-info', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: `${prompt}\n\n${transcript}` }),
//       });

//       if (!response.ok) throw new Error('Failed to generate content');

//       const data: GeneratedContent = await response.json();
//       setGeneratedContent(data);
//       console.log('data',data)
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to generate content. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Textarea
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Edit the prompt here..."
//           rows={5}
//         />
//         <Textarea
//           value={transcript}
//           onChange={(e) => setTranscript(e.target.value)}
//           placeholder="Paste your video transcript here..."
//           rows={5}
//         />
//         <Button type="submit" disabled={isLoading}>
//           {isLoading ? 'Generating...' : 'Generate Content'}
//         </Button>
//       </form>

//       {generatedContent && (
//         <div className="mt-8 space-y-4">
//           <Card title="Title (Chinese)">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-700">{generatedContent.title}</p>
//               <CopyButton text={generatedContent.title} />
//             </div>
//           </Card>

//           <Card title="Description (Chinese)">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-700">{generatedContent.description}</p>
//               <CopyButton text={generatedContent.description} />
//             </div>
//           </Card>

//           <Card title="Tags (Chinese)">
//             <div className="grid grid-cols-2 gap-4">
//                 {generatedContent.tags.map((tag, index) => (
//                 <div key={index} className="border p-2 rounded relative">
//                     <p className="text-gray-700 pr-8">{tag}</p> {/* Updated to use tag directly since it's a string */}
//                     <div className="absolute top-1 right-1">
//                     <CopyButton text={tag} /> {/* Pass the string directly */}
//                     </div>
//                 </div>
//                 ))}
//             </div>
//             </Card>

//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoTranscriptProcessor;
















// 'use client'


// import React, { useState } from 'react';
// import { ClipboardIcon } from '@heroicons/react/24/outline';

// interface Tag {
//   name: string;
// }

// interface GeneratedContent {
//   title: string;
//   description: string;
//   tags: Tag[];
// }

// const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
//   <button
//     {...props}
//     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
//   >
//     {children}
//   </button>
// );

// const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
//   <textarea
//     {...props}
//     className="w-full text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//   />
// );

// const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
//   <div className="bg-white shadow-md rounded-lg overflow-hidden">
//     <div className="px-4 py-5 sm:px-6">
//       <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//     </div>
//     <div className="px-4 py-5 sm:p-6">{children}</div>
//   </div>
// );

// const CopyButton: React.FC<{ text: string }> = ({ text }) => {
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(text);
//     // alert('Copied to clipboard!');
//   };

//   return (
//     <button
//       onClick={copyToClipboard}
//       className="p-1 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//     >
//       <ClipboardIcon className="h-5 w-5 text-gray-500" />
//     </button>
//   );
// };

// const VideoTranscriptProcessor: React.FC = () => {
//   const [transcript, setTranscript] = useState<string>('');
//   const [prompt, setPrompt] = useState<string>(
//     `Please generate a short video title (5-10 characters), an engaging description, and 3-5 relevant tags for a Little Red Book post based on the following video transcript. All content should be in Chinese. No markdown in your response.`
  

// );
//   const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/generate-video-info', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: `${prompt}\n\n${transcript}` }),
//       });

//       if (!response.ok) throw new Error('Failed to generate content');

//       const data: GeneratedContent = await response.json();
//       setGeneratedContent(data);
//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to generate content. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Textarea
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Edit the prompt here..."
//           rows={5}
//         />
//         <Textarea
//           value={transcript}
//           onChange={(e) => setTranscript(e.target.value)}
//           placeholder="Paste your video transcript here..."
//           rows={5}
//         />
//         <Button type="submit" disabled={isLoading}>
//           {isLoading ? 'Generating...' : 'Generate Content'}
//         </Button>
//       </form>

//       {generatedContent && (
//         <div className="mt-8 space-y-4">
//           <Card title="Title (Chinese)">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-700">{generatedContent.title}</p>
//               <CopyButton text={generatedContent.title} />
//             </div>
//           </Card>

//           <Card title="Description (Chinese)">
//             <div className="flex justify-between items-center">
//               <p className="text-gray-700">{generatedContent.description}</p>
//               <CopyButton text={generatedContent.description} />
//             </div>
//           </Card>

//           <Card title="Tags (Chinese)">
//             <div className="grid grid-cols-2 gap-4">
//               {generatedContent.tags.map((tag, index) => (
//                 <div key={index} className="bg-gray-100 p-2 rounded relative">
//                   <p className="text-gray-700 pr-8">{tag.name}</p>
//                   <div className="absolute top-1 right-1">
//                     <CopyButton text={tag.name} />
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoTranscriptProcessor;
















// 'use client'

// import React, { useState } from 'react';

// interface GeneratedContent {
//   title: string;
//   description: string;
//   tags: string;
// }

// const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, ...props }) => (
//   <button
//     {...props}
//     className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
//   >
//     {children}
//   </button>
// );

// const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
//   <textarea
//     {...props}
//     className="w-full text-black p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//   />
// );

// const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
//   <div className="bg-white shadow-md rounded-lg overflow-hidden">
//     <div className="px-4 py-5 sm:px-6">
//       <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
//     </div>
//     <div className="px-4 py-5 sm:p-6">{children}</div>
//   </div>
// );

// const VideoTranscriptProcessor: React.FC = () => {
//   const [transcript, setTranscript] = useState<string>('');
//   const [prompt, setPrompt] = useState<string>(
//     `Please generate a short title (5-10 characters), a description (50-100 characters), and 5-8 relevant tags for a Little Red Book post based on the following video transcript. All content should be in Chinese:`
//   );
//   const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
//   const [isLoading, setIsLoading] = useState<boolean>(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);

//     try {
//       const response = await fetch('/api/generate-video-info', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ prompt: `${prompt}\n\n${transcript}` }),
//       });

//       if (!response.ok) throw new Error('Failed to generate content');

//       const data: GeneratedContent = await response.json();

//       setGeneratedContent(data);


//     } catch (error) {
//       console.error('Error:', error);
//       alert('Failed to generate content. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     alert('Copied to clipboard!');
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <Textarea
//           value={prompt}
//           onChange={(e) => setPrompt(e.target.value)}
//           placeholder="Edit the prompt here..."
//           rows={5}
//         />
//         <Textarea
//           value={transcript}
//           onChange={(e) => setTranscript(e.target.value)}
//           placeholder="Paste your video transcript here..."
//           rows={5}
//         />
//         <Button type="submit" disabled={isLoading}>
//           {isLoading ? 'Generating...' : 'Generate Content'}
//         </Button>
//       </form>

//       {generatedContent && (
//         <div className="mt-8 space-y-4">
//           <Card title="Title (Chinese)">
//             <p className="text-gray-700">{generatedContent.title}</p>
//             <Button onClick={() => copyToClipboard(generatedContent.title)} className="mt-2">
//               Copy
//             </Button>
//           </Card>

        

//           <Card title="Description (Chinese)">
//             <p className="text-gray-700">{generatedContent.description}</p>
//             <Button onClick={() => copyToClipboard(generatedContent.description)} className="mt-2">
//               Copy
//             </Button>
//           </Card>

//           <Card title="Tags (Chinese)">
//             <p className="text-gray-700">{generatedContent.tags}</p>
//             <Button onClick={() => copyToClipboard(generatedContent.tags)} className="mt-2">
//               Copy
//             </Button>
//           </Card>
//         </div>
//       )}
//     </div>
//   );
// };

// export default VideoTranscriptProcessor;