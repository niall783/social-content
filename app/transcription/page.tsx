'use client'

import FileUploader from './components/FileUploader';
import FileList from './components/FileList2';


export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <FileUploader sessionID="unique-session-id" />
      <FileList />
    </div>
  );
}