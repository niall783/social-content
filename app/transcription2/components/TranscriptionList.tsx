// components/TranscriptionList.tsx
'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Transcription {
  transcriptionId: string;
  title: string;
  createdAt: string;
}

const TranscriptionList: React.FC = () => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTranscriptions = async () => {
      try {
        const response = await axios.get('/api/get-transcriptions');
        setTranscriptions(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch transcriptions');
        setLoading(false);
      }
    };

    fetchTranscriptions();
  }, []);

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Transcriptions</h1>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
         
          {transcriptions.map((transcription) => (
            
            <div
              key={transcription.transcriptionId}
              className="bg-white text-black overflow-hidden shadow rounded-lg"
            >
                 {JSON.stringify(transcription)}
              <div className="p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
                  {transcription.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Created: {new Date(transcription.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="bg-gray-50 px-5 py-3">
                <button
                  onClick={() => {
                    // Implement download functionality here
                    console.log(`Download transcription: ${transcription.transcriptionId}`);
                  }}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Download
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TranscriptionList;