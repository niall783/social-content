import React, { useState, useEffect } from 'react';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

interface GeneratedContent {
  description: string;
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
    className="w-full p-2 text-black border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  />
);

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white shadow-md rounded-lg overflow-hidden">
    <div className="px-4 py-5 sm:px-6 bg-gray-50">
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

const VideoDescriptionGenerator: React.FC<VideoTranscriptProcessorProps> = ({ transcriptText, setTranscriptText }) => {
  const [prompt, setPrompt] = useState<string>('');
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const response = await fetch('/api/prompts?promptName=GeneralVideo_Prompt');
        const data = await response.json();
        if (data.prompt) {
          setPrompt(data.prompt);
        }
      } catch (error) {
        console.error('Error fetching prompt:', error);
        toast.error('Error fetching prompt');
      }
    };

    fetchPrompt();
  }, []);

  const handlePromptSave = async () => {
    try {
      const response = await fetch('/api/prompts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptName: 'GeneralVideo_Prompt', prompt }),
      });
      if (!response.ok) throw new Error('Failed to save the prompt');
      toast.success('Prompt saved successfully');
    } catch (error) {
      console.error('Error saving prompt:', error);
      toast.error('Failed to save the prompt. Please try again.');
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
      console.error('Error:', error);
      toast.error('Failed to generate content. Please try again.');
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
          placeholder="Enter video transcript here..."
          rows={5}
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Description'}
        </Button>
      </form>

      {generatedContent && (
        <div className="mt-8">
          <Card title="Generated Description (JSON)">
            <div className="flex justify-between items-start">
              <div className=" text-black overflow-x-auto">
                {generatedContent.description}
              </div>
              <CopyButton text={generatedContent.description} />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default VideoDescriptionGenerator;

