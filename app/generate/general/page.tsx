'use client';

import React, { useState } from 'react';
import VideoDescriptionGenerator from './components/VideoDescriptionGenerator';
import TranscriptionList from '@/components/TranscriptionList';
import FileUploader from '@/components/FileUploaderAutoTranscribe';

export default function SocialMediaGeneration() {
  const [transcriptText, setTranscriptText] = useState('');

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
        <VideoDescriptionGenerator transcriptText={transcriptText} setTranscriptText={setTranscriptText} />
      </div>
      <div>
        <FileUploader sessionID="unique-session-id"/>
      </div>
      <div>
        <TranscriptionList setTranscriptText={setTranscriptText} />
      </div>
    </>
  );
}
