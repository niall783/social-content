'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { CloudArrowDownIcon, TrashIcon, ArrowPathIcon, LanguageIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';

interface FileItem {
  name: string;
  key: string;
  url: string;
  size: number;
  lastModified: string;
  contentType?: string;
}

function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const FileList: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [transcribing, setTranscribing] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await axios.get<{ filesFound: boolean; message: string; files: FileItem[] }>('/api/aws/s3/list-s3-files');
      setFiles(response.data.files || []);
      setError(null);
    } catch (err) {
      setError('Failed to fetch files. Please try again later.');
      console.error('Error fetching files:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url: string, fileName: string): void => {
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openDeleteModal = (file: FileItem): void => {
    setFileToDelete(file);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = (): void => {
    setIsDeleteModalOpen(false);
    setFileToDelete(null);
  };
  

  const handleDelete = async (): Promise<void> => {
    if (!fileToDelete) return;

    try {
      await axios.delete(`/api/aws/s3/delete-file?key=${encodeURIComponent(fileToDelete.key)}`);
      await fetchFiles(); // Refresh the file list after deletion
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file. Please try again later.');
    }
  };

  const handleTranscribe = async (file: FileItem): Promise<void> => {
    setTranscribing(file.key);
    try {
      const response = await axios.post('/api/transcribe', { fileKey: file.key });
      alert(`Transcription completed. Transcription file: ${response.data.transcriptionFile}`);
    } catch (err) {
      console.error('Error transcribing file:', err);
      setError('Failed to transcribe file. Please try again later.');
    } finally {
      setTranscribing(null);
    }
  };

  const isAudioFile = (file: FileItem): boolean => {
    return file.contentType?.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a)$/i) !== null;
  };

  const isVideoFile = (file: FileItem): boolean => {
    return file.contentType?.startsWith('video/') || file.name.match(/\.(mp4|avi|mov|wmv|flv)$/i) !== null;
  };

  const canTranscribe = (file: FileItem): boolean => {
    return isAudioFile(file) || isVideoFile(file);
  };

  if (loading) {
    return <div className="text-center py-4">Loading files...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Uploaded Files</h2>
        <button
          onClick={fetchFiles}
          className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          title="Refresh Files"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>
      
      {files.length === 0 ? (
        <div className="text-center py-4">No files found.</div>
      ) : (
        files.map((file) => (
          <div key={file.key} className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
            <div className="flex-grow">
              <p className="font-medium text-black">{file.name}</p>
              <p className="text-sm text-gray-500">
                Size: {formatBytes(file.size)} | Last Modified: {new Date(file.lastModified).toLocaleString()}
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleDownload(file.url, file.name)}
                className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                title="Download"
              >
                <CloudArrowDownIcon className="h-5 w-5" />
              </button>
              {canTranscribe(file) && (
                <button
                  onClick={() => handleTranscribe(file)}
                  className={`p-2 text-white rounded transition-colors ${
                    transcribing === file.key ? 'bg-yellow-500' : 'bg-green-500 hover:bg-green-600'
                  }`}
                  title="Transcribe"
                  disabled={transcribing === file.key}
                >
                  <LanguageIcon className="h-5 w-5" />
                </button>
              )}
              <button
                onClick={() => openDeleteModal(file)}
                className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                title="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))
      )}

      <Transition appear show={isDeleteModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-2">
                   
                    <p className="text-sm text-gray-500">
                    Are you sure you want to delete the file {fileToDelete?.name}? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
                      onClick={closeDeleteModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
                      onClick={handleDelete}
                    >
                      Delete
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default FileList;

















// 'use client'


// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { CloudArrowDownIcon, TrashIcon, ArrowPathIcon, LanguageIcon } from '@heroicons/react/24/solid';
// import { Dialog, Transition } from '@headlessui/react';

// interface FileItem {
//   name: string;
//   key: string;
//   url: string;
//   size: number;
//   lastModified: string;
//   contentType?: string;
// }

// function formatBytes(bytes: number, decimals: number = 2): string {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// }

// const FileList: React.FC = () => {
//   const [files, setFiles] = useState<FileItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
//   const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
//   const [transcribing, setTranscribing] = useState<string | null>(null);

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   const fetchFiles = async (): Promise<void> => {
//     setLoading(true);
//     try {
//       const response = await axios.get<{ filesFound: boolean; message: string; files: FileItem[] }>('/api/aws/s3/list-s3-files');
//       setFiles(response.data.files || []);
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch files. Please try again later.');
//       console.error('Error fetching files:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = (url: string, fileName: string): void => {
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const openDeleteModal = (file: FileItem): void => {
//     setFileToDelete(file);
//     setIsDeleteModalOpen(true);
//   };

//   const closeDeleteModal = (): void => {
//     setIsDeleteModalOpen(false);
//     setFileToDelete(null);
//   };

//   const handleDelete = async (): Promise<void> => {
//     if (!fileToDelete) return;

//     try {
//       await axios.delete(`/api/aws/s3/delete-file?key=${encodeURIComponent(fileToDelete.key)}`);
//       await fetchFiles(); // Refresh the file list after deletion
//       closeDeleteModal();
//     } catch (err) {
//       console.error('Error deleting file:', err);
//       setError('Failed to delete file. Please try again later.');
//     }
//   };

//   const handleTranscribe = async (file: FileItem): Promise<void> => {
//     setTranscribing(file.key);
//     try {
//       const response = await axios.post('/api/transcribe', { fileKey: file.key });
//       alert(`Transcription completed. Transcription file: ${response.data.transcriptionFile}`);
//     } catch (err) {
//       console.error('Error transcribing file:', err);
//       setError('Failed to transcribe file. Please try again later.');
//     } finally {
//       setTranscribing(null);
//     }
//   };

//   const isAudioFile = (file: FileItem): boolean => {
//     return file.contentType?.startsWith('audio/') || file.name.match(/\.(mp3|wav|ogg|m4a)$/i) !== null;
//   };

//   if (loading) {
//     return <div className="text-center py-4">Loading files...</div>;
//   }

//   if (error) {
//     return <div className="text-center py-4 text-red-500">{error}</div>;
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Uploaded Files</h2>
//         <button
//           onClick={fetchFiles}
//           className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
//           title="Refresh Files"
//         >
//           <ArrowPathIcon className="h-5 w-5" />
//         </button>
//       </div>
      
//       {files.length === 0 ? (
//         <div className="text-center py-4">No files found.</div>
//       ) : (
//         files.map((file) => (
//           <div key={file.key} className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
//             <div className="flex-grow">
//               <p className="font-medium text-black">{file.name}</p>
//               <p className="text-sm text-gray-500">
//                 Size: {formatBytes(file.size)} | Last Modified: {new Date(file.lastModified).toLocaleString()}
//               </p>
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => handleDownload(file.url, file.name)}
//                 className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//                 title="Download"
//               >
//                 <CloudArrowDownIcon className="h-5 w-5" />
//               </button>
//               {isAudioFile(file) && (
//                 <button
//                   onClick={() => handleTranscribe(file)}
//                   className={`p-2 text-white rounded transition-colors ${
//                     transcribing === file.key ? 'bg-yellow-500' : 'bg-green-500 hover:bg-green-600'
//                   }`}
//                   title="Transcribe"
//                   disabled={transcribing === file.key}
//                 >
//                   <LanguageIcon className="h-5 w-5" />
//                 </button>
//               )}
//               <button
//                 onClick={() => openDeleteModal(file)}
//                 className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//                 title="Delete"
//               >
//                 <TrashIcon className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         ))
//       )}

//       <Transition appear show={isDeleteModalOpen} as={React.Fragment}>
//         <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
//           <Transition.Child
//             as={React.Fragment}
//             enter="ease-out duration-300"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="ease-in duration-200"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <div className="fixed inset-0 bg-black bg-opacity-25" />
//           </Transition.Child>

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4 text-center">
//               <Transition.Child
//                 as={React.Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                   <Dialog.Title
//                     as="h3"
//                     className="text-lg font-medium leading-6 text-gray-900"
//                   >
//                     Confirm Deletion
//                   </Dialog.Title>
//                   <div className="mt-2">
//                     <p className="text-sm text-gray-500">
//                       Are you sure you want to delete the file "{fileToDelete?.name}"? This action cannot be undone.
//                     </p>
//                   </div>

//                   <div className="mt-4 flex justify-end space-x-2">
//                     <button
//                       type="button"
//                       className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
//                       onClick={closeDeleteModal}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
//                       onClick={handleDelete}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default FileList;

















// 'use client'

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { CloudArrowDownIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
// import { Dialog, Transition } from '@headlessui/react';

// interface FileItem {
//   name: string;
//   key: string;
//   url: string;
//   size: number;
//   lastModified: string;
// }

// function formatBytes(bytes: number, decimals: number = 2): string {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// }

// const FileList: React.FC = () => {
//   const [files, setFiles] = useState<FileItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
//   const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   const fetchFiles = async (): Promise<void> => {
//     setLoading(true);
//     try {
//       const response = await axios.get<{ filesFound: boolean; message: string; files: FileItem[] }>('/api/aws/s3/list-s3-files');
//       setFiles(response.data.files || []);
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch files. Please try again later.');
//       console.error('Error fetching files:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = (url: string, fileName: string): void => {
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const openDeleteModal = (file: FileItem): void => {
//     setFileToDelete(file);
//     setIsDeleteModalOpen(true);
//   };

//   const closeDeleteModal = (): void => {
//     setIsDeleteModalOpen(false);
//     setFileToDelete(null);
//   };

//   const handleDelete = async (): Promise<void> => {
//     if (!fileToDelete) return;

//     try {
//       await axios.delete(`/api/aws/s3/delete-file?key=${encodeURIComponent(fileToDelete.key)}`);
//       await fetchFiles(); // Refresh the file list after deletion
//       closeDeleteModal();
//     } catch (err) {
//       console.error('Error deleting file:', err);
//       setError('Failed to delete file. Please try again later.');
//     }
//   };

//   if (loading) {
//     return <div className="text-center py-4">Loading files...</div>;
//   }

//   if (error) {
//     return <div className="text-center py-4 text-red-500">{error}</div>;
//   }

//   return (
//     <div className="space-y-4">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-xl font-semibold">Uploaded Files</h2>
//         <button
//           onClick={fetchFiles}
//           className="p-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
//           title="Refresh Files"
//         >
//           <ArrowPathIcon className="h-5 w-5" />
//         </button>
//       </div>
      
//       {files.length === 0 ? (
//         <div className="text-center py-4">No files found.</div>
//       ) : (
//         files.map((file) => (
//           <div key={file.key} className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
//             <div className="flex-grow">
//               <p className="font-medium text-black">{file.name}</p>
//               <p className="text-sm text-gray-500">
//                 Size: {formatBytes(file.size)} | Last Modified: {new Date(file.lastModified).toLocaleString()}
//               </p>
//             </div>
//             <div className="flex space-x-2">
//               <button
//                 onClick={() => handleDownload(file.url, file.name)}
//                 className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//                 title="Download"
//               >
//                 <CloudArrowDownIcon className="h-5 w-5" />
//               </button>
//               <button
//                 onClick={() => openDeleteModal(file)}
//                 className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//                 title="Delete"
//               >
//                 <TrashIcon className="h-5 w-5" />
//               </button>
//             </div>
//           </div>
//         ))
//       )}

//       <Transition appear show={isDeleteModalOpen} as={React.Fragment}>
//         <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
//           <Transition.Child
//             as={React.Fragment}
//             enter="ease-out duration-300"
//             enterFrom="opacity-0"
//             enterTo="opacity-100"
//             leave="ease-in duration-200"
//             leaveFrom="opacity-100"
//             leaveTo="opacity-0"
//           >
//             <div className="fixed inset-0 bg-black bg-opacity-25" />
//           </Transition.Child>

//           <div className="fixed inset-0 overflow-y-auto">
//             <div className="flex min-h-full items-center justify-center p-4 text-center">
//               <Transition.Child
//                 as={React.Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                   <Dialog.Title
//                     as="h3"
//                     className="text-lg font-medium leading-6 text-gray-900"
//                   >
//                     Confirm Deletion
//                   </Dialog.Title>
//                   <div className="mt-2">
//                     <p className="text-sm text-gray-500">
//                       Are you sure you want to delete the file "{fileToDelete?.name}"? This action cannot be undone.
//                     </p>
//                   </div>

//                   <div className="mt-4 flex justify-end space-x-2">
//                     <button
//                       type="button"
//                       className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2"
//                       onClick={closeDeleteModal}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
//                       onClick={handleDelete}
//                     >
//                       Delete
//                     </button>
//                   </div>
//                 </Dialog.Panel>
//               </Transition.Child>
//             </div>
//           </div>
//         </Dialog>
//       </Transition>
//     </div>
//   );
// };

// export default FileList;










// 'use client'
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { CloudArrowDownIcon, TrashIcon } from '@heroicons/react/24/solid';

// interface FileItem {
//   name: string;
//   key: string;
//   url: string;
//   size: number;
//   lastModified: string;
// }

// function formatBytes(bytes: number, decimals: number = 2): string {
//   if (bytes === 0) return '0 Bytes';
//   const k = 1024;
//   const dm = decimals < 0 ? 0 : decimals;
//   const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
// }

// const FileList: React.FC = () => {
//   const [files, setFiles] = useState<FileItem[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   const fetchFiles = async (): Promise<void> => {
//     setLoading(true);
//     try {
//       const response = await axios.get<{ filesFound: boolean; message: string; files: FileItem[] }>('/api/aws/s3/list-s3-files');
//       setFiles(response.data.files || []);
//       setError(null);
//     } catch (err) {
//       setError('Failed to fetch files. Please try again later.');
//       console.error('Error fetching files:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDownload = (url: string, fileName: string): void => {
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = fileName;
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   const handleDelete = async (key: string): Promise<void> => {
//     try {
//       await axios.delete(`/api/aws/s3/delete-file?key=${encodeURIComponent(key)}`);
//       await fetchFiles(); // Refresh the file list after deletion
//     } catch (err) {
//       console.error('Error deleting file:', err);
//       setError('Failed to delete file. Please try again later.');
//     }
//   };

//   if (loading) {
//     return <div className="text-center py-4">Loading files...</div>;
//   }

//   if (error) {
//     return <div className="text-center py-4 text-red-500">{error}</div>;
//   }

//   if (files.length === 0) {
//     return <div className="text-center py-4">No files found.</div>;
//   }

//   return (
//     <div className="space-y-4">
//       <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>
//       {files.map((file) => (
//         <div key={file.key} className="bg-white shadow rounded-lg p-4 flex items-center justify-between">
//           <div className="flex-grow">
//             <p className="font-medium text-black">{file.name}</p>
//             <p className="text-sm text-gray-500">
//               Size: {formatBytes(file.size)} | Last Modified: {new Date(file.lastModified).toLocaleString()}
//             </p>
//           </div>
//           <div className="flex space-x-2">
//             <button
//               onClick={() => handleDownload(file.url, file.name)}
//               className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
//               title="Download"
//             >
//               <CloudArrowDownIcon className="h-5 w-5" />
//             </button>
//             <button
//               onClick={() => handleDelete(file.key)}
//               className="p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
//               title="Delete"
//             >
//               <TrashIcon className="h-5 w-5" />
//             </button>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default FileList;