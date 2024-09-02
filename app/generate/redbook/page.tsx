// app/flashcards/page.tsx
import VideoTranscriptProcessor from './components/VideoTranscriptProcessor';

export default function FlashcardsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <VideoTranscriptProcessor />
    </div>
  );
}