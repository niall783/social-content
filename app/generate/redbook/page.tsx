'use client';

import React, { useState } from 'react';
import VideoTranscriptProcessor from './components/VideoTranscriptProcessor';
import TranscriptionList from '@/components/TranscriptionList';
import FileUploader from '@/components/FileUploaderAutoTranscribe';

export default function SocialMediaGeneration() {
  const [transcriptText, setTranscriptText] = useState('');

  return (
    <>
      <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
        <VideoTranscriptProcessor transcriptText={transcriptText} setTranscriptText={setTranscriptText} />
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










// // app/flashcards/page.tsx
// import VideoTranscriptProcessor from './components/VideoTranscriptProcessor';
// import TranscriptionList from '@/components/TranscriptionList';
// import FileUploader from '@/components/FileUploaderAutoTranscribe';



// export default function FlashcardsPage() {
//   return (
//     <>
//     <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
//       <VideoTranscriptProcessor />
      
//     </div>
//     <div>
//         <FileUploader sessionID="unique-session-id"/>
//     </div>
//     <div >
//         <TranscriptionList/>
//     </div>
//     </>
//   );
// }