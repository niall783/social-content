'use client'

import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { CloudArrowUpIcon, XCircleIcon } from '@heroicons/react/24/solid';

interface FileUploaderProps {
  sessionID: string;
  individualFileSizeLimit?: number;
  totalFileSizeLimit?: number;
}

function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const FileUploader: React.FC<FileUploaderProps> = ({
  sessionID,
  individualFileSizeLimit = 250 * 1024 * 1024,
  totalFileSizeLimit = 500 * 1024 * 1024
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: string}>({});
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelectClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files: File[]) => {
    setErrorMessage('');
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    if (totalSize > totalFileSizeLimit) {
      setErrorMessage(`Total file size exceeds the limit of ${formatBytes(totalFileSizeLimit)}`);
      return;
    }
    const validFiles = files.filter(file => file.size <= individualFileSizeLimit);
    if (validFiles.length !== files.length) {
      setErrorMessage(`Some files exceed the individual size limit of ${formatBytes(individualFileSizeLimit)}`);
    }
    setSelectedFiles(prevFiles => [...prevFiles, ...validFiles]);
  };

  const handleDeleteFile = (index: number) => {
    setSelectedFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const fetchPresignedUrl = async (objectKey: string) => {
    try {
      const response = await axios.get(`/api/aws/s3/get-presigned-s3-url`, {
        params: { objectKey }
      });
      return response.data.url;
    } catch (error) {
      console.error('Error fetching pre-signed URL:', error);
      throw error;
    }
  };

  const isAudioFile = (file: File): boolean => {
    return file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a)$/i) !== null;
  };

  const transcribeAudio = async (fileKey: string) => {
    try {
      const response = await axios.post('/api/transcribe-and-save', { fileKey, timestamp: Date.now() });
      console.log(`Transcription completed and saved. Transcription ID: ${response.data.uuid}`);
    } catch (error) {
      console.error('Error transcribing file:', error);
      setErrorMessage(`Error transcribing file: ${(error as Error).message}`);
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage('Please select files to upload.');
      return;
    }

    setUploading(true);
    setErrorMessage('');

    const initialProgress = selectedFiles.reduce((acc, file) => {
      acc[file.name] = "0%";
      return acc;
    }, {} as {[key: string]: string});
    setUploadProgress(initialProgress);

    const uploadFile = async (file: File) => {
      try {
        const objectKey = `uploads/${sessionID}/${file.name}`;
        const presignedUrl = await fetchPresignedUrl(objectKey);

        await axios.put(presignedUrl, file, {
          headers: {
            'Content-Type': file.type,
          },
          onUploadProgress: progressEvent => {
            const progress = Math.round((progressEvent.loaded * 100) / (progressEvent.total ?? file.size)) + "%";
            setUploadProgress(prevProgress => ({
              ...prevProgress,
              [file.name]: progress
            }));
          }
        });

        if (isAudioFile(file)) {
          await transcribeAudio(objectKey);
        }
      } catch (error) {
        console.error('Upload error for file:', file.name, error);
        setErrorMessage(`Error uploading file ${file.name}: ${(error as Error).message}`);
      }
    };

    await Promise.all(selectedFiles.map(uploadFile));

    setUploading(false);
    setSelectedFiles([]);
  };

  useEffect(() => {
    const dragEl = dragRef.current;
    if (dragEl) {
      dragEl.addEventListener('dragenter', handleDrag as any);
      dragEl.addEventListener('dragover', handleDrag as any);
      dragEl.addEventListener('dragleave', handleDragLeave as any);
      dragEl.addEventListener('drop', handleDrop as any);

      return () => {
        dragEl.removeEventListener('dragenter', handleDrag as any);
        dragEl.removeEventListener('dragover', handleDrag as any);
        dragEl.removeEventListener('dragleave', handleDragLeave as any);
        dragEl.removeEventListener('drop', handleDrop as any);
      };
    }
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-lg border shadow-sm" ref={dragRef}>
      <div className="flex flex-col space-y-1.5 p-6 pb-4">
        <h3 className="text-2xl md:text-3xl font-semibold tracking-tight">Upload your Files</h3>
        <p className="text-sm text-gray-500">
          Drag and drop your files here or click the button below to browse files. Audio files will be automatically transcribed.
        </p>
      </div>
      <div className="px-6 flex flex-col gap-3">
        <div 
          className={`w-full h-32 border-2 ${dragActive ? "border-blue-500" : "border-gray-200"} border-dashed rounded-md flex items-center justify-center cursor-pointer`}
          onClick={handleFileSelectClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />
          <CloudArrowUpIcon className="w-12 h-12 text-gray-400" />
        </div>

        <p className="text-sm text-gray-500">
          Max Individual File Size: {formatBytes(individualFileSizeLimit)}
        </p>

        <div className="flex justify-between items-center gap-4">
          <button
            onClick={handleFileSelectClick}
            className="rounded-md text-sm font-medium px-4 py-2 w-full bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50"
            disabled={uploading}
          >
            Browse Files
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className={`rounded-md text-sm font-medium px-4 py-2 w-full ${
              uploading ? 'bg-green-300' : 'bg-green-500 hover:bg-green-600'
            } text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50`}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>

      <div className={`${selectedFiles.length > 0 ? 'py-5' : ''} space-y-2 p-2 px-6`}>
        {selectedFiles.map((file, index) => (
          <div key={index} className="bg-white p-2 border border-gray-300 shadow-sm rounded-md mb-2">
            <div className="flex justify-between items-center">
              <p className="text-gray-700 text-sm flex-grow truncate">
                {file.name} ({formatBytes(file.size)})
                {isAudioFile(file) && " (Will be transcribed)"}
              </p>
              {uploading ? (
                uploadProgress[file.name] && (
                  <div className="text-xs font-medium ml-2">
                    {uploadProgress[file.name]}
                  </div>
                )
              ) : (
                <button onClick={() => handleDeleteFile(index)} title="Delete file" className="ml-2 p-1 bg-transparent rounded">
                  <XCircleIcon className="w-6 h-6 text-red-600 cursor-pointer" />
                </button>
              )}
            </div>
            {uploading && uploadProgress[file.name] && (
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-md">
                  <div 
                    className="h-1 bg-blue-500 rounded-md" 
                    style={{ width: uploadProgress[file.name] }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-6 flex flex-col mb-5">
        {errorMessage && (
          <p className="text-red-500 text-center mt-4">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default FileUploader;