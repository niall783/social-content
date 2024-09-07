// app/flashcards/page.tsx
import VideoTranscriptProcessor from './components/VideoTranscriptProcessor';
import TranscriptionList from '@/components/TranscriptionList';


export default function FlashcardsPage() {
  return (
    <>
    <div className="flex flex-col items-center justify-center bg-gray-100 p-4">
      <VideoTranscriptProcessor />
      
    </div>
    <div >
        <TranscriptionList/>
    </div>
    </>
  );
}