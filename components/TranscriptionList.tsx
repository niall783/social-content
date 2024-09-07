'use client';

import React, { useState, useEffect, Fragment } from 'react';
import axios from 'axios';
import { ClipboardIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import { Dialog, Transition } from '@headlessui/react';

interface Transcription {
  uuid: string;
  title: string;
  createdAt: string;
  transcription: string;
}

const fetcher = (url: string) =>
  axios.get(url, {
    headers: {
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    params: {
      timestamp: Date.now(), // Cache-busting by adding timestamp
    },
  }).then((res) => res.data);

const TranscriptionList: React.FC = () => {
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null); // Track expanded transcription
  const [copiedId, setCopiedId] = useState<string | null>(null); // Track which transcription is copied
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [transcriptionToDelete, setTranscriptionToDelete] = useState<Transcription | null>(null);

  // Fetch transcriptions function using the cache-busting fetcher
  const fetchTranscriptions = async () => {
    setLoading(true);
    try {
      const response = await fetcher('/api/get-transcriptions');
      setTranscriptions(response);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch transcriptions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTranscriptions();
  }, []);

  const toggleExpand = (uuid: string) => {
    setExpandedId(expandedId === uuid ? null : uuid);
  };

  const copyToClipboard = (text: string, uuid: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(uuid);

    // Reset after 1.5 seconds
    setTimeout(() => setCopiedId(null), 1500);
  };

  const openDeleteModal = (transcription: Transcription) => {
    setTranscriptionToDelete(transcription);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTranscriptionToDelete(null);
  };

  const handleDelete = async () => {
    if (!transcriptionToDelete) return;

    try {
      await axios.delete(`/api/delete-transcription/${transcriptionToDelete.uuid}`);
      setTranscriptions((prev) => prev.filter((t) => t.uuid !== transcriptionToDelete.uuid));
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting transcription:', err);
    }
  };

  if (loading) return <div className="text-center">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="bg-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-semibold text-gray-900">Transcriptions</h1>
          <button
            onClick={fetchTranscriptions}
            className="flex items-center space-x-1 bg-gray-200 hover:bg-gray-300 text-gray-600 px-4 py-2 rounded-lg"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>

        <div className="space-y-4">
          {transcriptions.map((transcription) => (
            <div key={transcription.uuid} className="bg-white shadow rounded-lg overflow-hidden w-full">
              <div className="p-5 flex justify-between items-center">
                <div>
                  <h4 className="text-md leading-6 font-medium text-gray-900 break-words">
                    {transcription.title}
                  </h4>
                  <p className="mt-1 text-sm text-gray-500">
                    Created: {new Date(transcription.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => copyToClipboard(transcription.transcription, transcription.uuid)}
                    className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    <ClipboardIcon className="w-5 h-5 mr-1" />
                    {copiedId === transcription.uuid ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={() => openDeleteModal(transcription)}
                    className="text-red-600 hover:text-red-500"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div
                className="bg-gray-50 px-5 py-3 flex justify-between items-center cursor-pointer"
                onClick={() => toggleExpand(transcription.uuid)}
              >
                <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  {expandedId === transcription.uuid ? (
                    <>
                      <ChevronUpIcon className="w-5 h-5 mr-1" />
                      Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="w-5 h-5 mr-1" />
                      Expand
                    </>
                  )}
                </div>
              </div>
              {expandedId === transcription.uuid && transcription.transcription && (
                <div className="p-5 bg-gray-100">
                  <p className="text-gray-700 whitespace-pre-wrap">{transcription.transcription}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal for confirming delete */}
      <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
          <Transition.Child
            as={Fragment}
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
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Confirm Deletion
                  </Dialog.Title>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Are you sure you want to delete this transcription? This action cannot be undone.
                    </p>
                  </div>

                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
                      onClick={closeDeleteModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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

export default TranscriptionList;

















// 'use client';
// import React, { useState, useEffect, Fragment } from 'react';
// import axios from 'axios';
// import { ClipboardIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
// import { Dialog, Transition } from '@headlessui/react';

// interface Transcription {
//   uuid: string;
//   title: string;
//   createdAt: string;
//   transcription: string;
// }

// const TranscriptionList: React.FC = () => {
//   const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null); // Track expanded transcription
//   const [copiedId, setCopiedId] = useState<string | null>(null); // Track which transcription is copied
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
//   const [transcriptionToDelete, setTranscriptionToDelete] = useState<Transcription | null>(null);

//   // Fetch transcriptions function
//   const fetchTranscriptions = async () => {
//     try {
//       const response = await axios.get('/api/get-transcriptions');
//       setTranscriptions(response.data);
//       setLoading(false);
//     } catch (err) {
//       setError('Failed to fetch transcriptions');
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchTranscriptions();
//   }, []);

//   const toggleExpand = (uuid: string) => {
//     setExpandedId(expandedId === uuid ? null : uuid);
//   };

//   const copyToClipboard = (text: string, uuid: string) => {
//     navigator.clipboard.writeText(text);
//     setCopiedId(uuid);

//     // Reset after 1.5 seconds
//     setTimeout(() => setCopiedId(null), 1500);
//   };

//   const openDeleteModal = (transcription: Transcription) => {
//     setTranscriptionToDelete(transcription);
//     setIsDeleteModalOpen(true);
//   };

//   const closeDeleteModal = () => {
//     setIsDeleteModalOpen(false);
//     setTranscriptionToDelete(null);
//   };

//   const handleDelete = async () => {
//     if (!transcriptionToDelete) return;

//     try {
//       await axios.delete(`/api/delete-transcription/${transcriptionToDelete.uuid}`);
//       setTranscriptions((prev) => prev.filter((t) => t.uuid !== transcriptionToDelete.uuid));
//       closeDeleteModal();
//     } catch (err) {
//       console.error('Error deleting transcription:', err);
//     }
//   };

//   if (loading) return <div className="text-center">Loading...</div>;
//   if (error) return <div className="text-center text-red-500">{error}</div>;

//   return (
//     <div className="bg-gray-100 min-h-screen py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex justify-between items-center mb-6">
//           <h1 className="text-3xl font-semibold text-gray-900">Transcriptions</h1>
//           <button
//             onClick={fetchTranscriptions}
//             className="flex items-center space-x-1 bg-gray-200 hover:bg-gray-300 text-gray-600 px-4 py-2 rounded-lg"
//           >
//             <ArrowPathIcon className="h-5 w-5" />
//             <span>Refresh</span>
//           </button>
//         </div>

//         <div className="space-y-4">
//           {transcriptions.map((transcription) => (
//             <div key={transcription.uuid} className="bg-white shadow rounded-lg overflow-hidden w-full">
//               <div className="p-5 flex justify-between items-center">
//                 <div>
//                   {/* <h3 className="text-lg leading-6 font-medium text-gray-900 truncate"> */}
//                   <h4 className="text-md leading-6 font-medium text-gray-900 break-words">
//                     {transcription.title}
//                   </h4>

//                   <p className="mt-1 text-sm text-gray-500">
//                     Created: {new Date(transcription.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => copyToClipboard(transcription.transcription, transcription.uuid)}
//                     className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
//                   >
//                     <ClipboardIcon className="w-5 h-5 mr-1" />
//                     {copiedId === transcription.uuid ? 'Copied!' : 'Copy'}
//                   </button>
//                   <button
//                     onClick={() => openDeleteModal(transcription)}
//                     className="text-red-600 hover:text-red-500"
//                   >
//                     <TrashIcon className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//               <div
//                 className="bg-gray-50 px-5 py-3 flex justify-between items-center cursor-pointer"
//                 onClick={() => toggleExpand(transcription.uuid)}
//               >
//                 <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
//                   {expandedId === transcription.uuid ? (
//                     <>
//                       <ChevronUpIcon className="w-5 h-5 mr-1" />
//                       Collapse
//                     </>
//                   ) : (
//                     <>
//                       <ChevronDownIcon className="w-5 h-5 mr-1" />
//                       Expand
//                     </>
//                   )}
//                 </div>
//               </div>
//               {expandedId === transcription.uuid && transcription.transcription && (
//                 <div className="p-5 bg-gray-100">
//                   <p className="text-gray-700 whitespace-pre-wrap">{transcription.transcription}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Modal for confirming delete */}
//       <Transition appear show={isDeleteModalOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
//           <Transition.Child
//             as={Fragment}
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
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                   <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
//                     Confirm Deletion
//                   </Dialog.Title>
//                   <div className="mt-2">
//                     <p className="text-sm text-gray-500">
//                       Are you sure you want to delete this transcription? This action cannot be undone.
//                     </p>
//                   </div>

//                   <div className="mt-4 flex justify-end space-x-2">
//                     <button
//                       type="button"
//                       className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
//                       onClick={closeDeleteModal}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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

// export default TranscriptionList;











// 'use client';
// import React, { useState, useEffect, Fragment } from 'react';
// import axios from 'axios';
// import { ClipboardIcon, ChevronDownIcon, ChevronUpIcon, TrashIcon } from '@heroicons/react/24/solid';
// import { Dialog, Transition } from '@headlessui/react';

// interface Transcription {
//   uuid: string;
//   title: string;
//   createdAt: string;
//   transcription: string;
// }

// const TranscriptionList: React.FC = () => {
//   const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null); // Track expanded transcription
//   const [copiedId, setCopiedId] = useState<string | null>(null); // Track which transcription is copied
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
//   const [transcriptionToDelete, setTranscriptionToDelete] = useState<Transcription | null>(null);

//   useEffect(() => {
//     const fetchTranscriptions = async () => {
//       try {
//         const response = await axios.get('/api/get-transcriptions');
//         setTranscriptions(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch transcriptions');
//         setLoading(false);
//       }
//     };

//     fetchTranscriptions();
//   }, []);

//   const toggleExpand = (uuid: string) => {
//     setExpandedId(expandedId === uuid ? null : uuid);
//   };

//   const copyToClipboard = (text: string, uuid: string) => {
//     navigator.clipboard.writeText(text);
//     setCopiedId(uuid);

//     // Reset after 1.5 seconds
//     setTimeout(() => setCopiedId(null), 1500);
//   };

//   const openDeleteModal = (transcription: Transcription) => {
//     setTranscriptionToDelete(transcription);
//     setIsDeleteModalOpen(true);
//   };

//   const closeDeleteModal = () => {
//     setIsDeleteModalOpen(false);
//     setTranscriptionToDelete(null);
//   };

//   const handleDelete = async () => {
//     if (!transcriptionToDelete) return;

//     try {
//       await axios.delete(`/api/delete-transcription/${transcriptionToDelete.uuid}`);
//       setTranscriptions((prev) => prev.filter((t) => t.uuid !== transcriptionToDelete.uuid));
//       closeDeleteModal();
//     } catch (err) {
//       console.error('Error deleting transcription:', err);
//     }
//   };

//   if (loading) return <div className="text-center">Loading...</div>;
//   if (error) return <div className="text-center text-red-500">{error}</div>;

//   return (
//     <div className="bg-gray-100 min-h-screen py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h1 className="text-3xl font-semibold text-gray-900 mb-6">Transcriptions</h1>
//         <div className="space-y-4">
//           {transcriptions.map((transcription) => (
//             <div key={transcription.uuid} className="bg-white shadow rounded-lg overflow-hidden w-full">
//               <div className="p-5 flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
//                     {transcription.title}
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Created: {new Date(transcription.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <div className="flex space-x-2">
//                   <button
//                     onClick={() => copyToClipboard(transcription.transcription, transcription.uuid)}
//                     className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
//                   >
//                     <ClipboardIcon className="w-5 h-5 mr-1" />
//                     {copiedId === transcription.uuid ? 'Copied!' : 'Copy'}
//                   </button>
//                   <button
//                     onClick={() => openDeleteModal(transcription)}
//                     className="text-red-600 hover:text-red-500"
//                   >
//                     <TrashIcon className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>
//               <div
//                 className="bg-gray-50 px-5 py-3 flex justify-between items-center cursor-pointer"
//                 onClick={() => toggleExpand(transcription.uuid)}
//               >
//                 <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
//                   {expandedId === transcription.uuid ? (
//                     <>
//                       <ChevronUpIcon className="w-5 h-5 mr-1" />
//                       Collapse
//                     </>
//                   ) : (
//                     <>
//                       <ChevronDownIcon className="w-5 h-5 mr-1" />
//                       Expand
//                     </>
//                   )}
//                 </div>
//               </div>
//               {expandedId === transcription.uuid && transcription.transcription && (
//                 <div className="p-5 bg-gray-100">
//                   <p className="text-gray-700 whitespace-pre-wrap">{transcription.transcription}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Modal for confirming delete */}
//       <Transition appear show={isDeleteModalOpen} as={Fragment}>
//         <Dialog as="div" className="relative z-10" onClose={closeDeleteModal}>
//           <Transition.Child
//             as={Fragment}
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
//                 as={Fragment}
//                 enter="ease-out duration-300"
//                 enterFrom="opacity-0 scale-95"
//                 enterTo="opacity-100 scale-100"
//                 leave="ease-in duration-200"
//                 leaveFrom="opacity-100 scale-100"
//                 leaveTo="opacity-0 scale-95"
//               >
//                 <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
//                   <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
//                     Confirm Deletion
//                   </Dialog.Title>
//                   <div className="mt-2">
//                     <p className="text-sm text-gray-500">
//                       Are you sure you want to delete this transcription? This action cannot be undone.
//                     </p>
//                   </div>

//                   <div className="mt-4 flex justify-end space-x-2">
//                     <button
//                       type="button"
//                       className="inline-flex justify-center rounded-md border border-transparent bg-gray-100 px-4 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200"
//                       onClick={closeDeleteModal}
//                     >
//                       Cancel
//                     </button>
//                     <button
//                       type="button"
//                       className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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

// export default TranscriptionList;















// 'use client';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ClipboardIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Use Heroicons

// interface Transcription {
//   uuid: string;
//   title: string;
//   createdAt: string;
//   transcription: string; // Already fetched
// }

// const TranscriptionList: React.FC = () => {
//   const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null); // Track expanded transcription
//   const [copiedId, setCopiedId] = useState<string | null>(null); // Track which transcription is copied

//   useEffect(() => {
//     const fetchTranscriptions = async () => {
//       try {
//         const response = await axios.get('/api/get-transcriptions');
//         setTranscriptions(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch transcriptions');
//         setLoading(false);
//       }
//     };

//     fetchTranscriptions();
//   }, []);

//   const toggleExpand = (uuid: string) => {
//     setExpandedId(expandedId === uuid ? null : uuid);
//   };

//   const copyToClipboard = (text: string, uuid: string) => {
//     navigator.clipboard.writeText(text);
//     setCopiedId(uuid);

//     // Reset after 1.5 seconds
//     setTimeout(() => setCopiedId(null), 1500);
//   };

//   if (loading) return <div className="text-center">Loading...</div>;
//   if (error) return <div className="text-center text-red-500">{error}</div>;

//   return (
//     <div className="bg-gray-100 min-h-screen py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h1 className="text-3xl font-semibold text-gray-900 mb-6">Transcriptions</h1>
//         <div className="space-y-4"> {/* Full width stacking */}
//           {transcriptions.map((transcription) => (
//             <div
//               key={transcription.uuid}
//               className="bg-white shadow rounded-lg overflow-hidden w-full"
//             >
//               <div className="p-5 flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
//                     {transcription.title}
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Created: {new Date(transcription.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => copyToClipboard(transcription.transcription, transcription.uuid)}
//                   className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
//                 >
//                   <ClipboardIcon className="w-5 h-5 mr-1" />
//                   {copiedId === transcription.uuid ? 'Copied!' : 'Copy'}
//                 </button>
//               </div>

//               {/* Make the entire gray area clickable for expanding/collapsing */}
//               <div
//                 className="bg-gray-50 px-5 py-3 flex justify-between items-center cursor-pointer"
//                 onClick={() => toggleExpand(transcription.uuid)}
//               >
//                 <div className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500">
//                   {expandedId === transcription.uuid ? (
//                     <>
//                       <ChevronUpIcon className="w-5 h-5 mr-1" />
//                       Collapse
//                     </>
//                   ) : (
//                     <>
//                       <ChevronDownIcon className="w-5 h-5 mr-1" />
//                       Expand
//                     </>
//                   )}
//                 </div>
//               </div>

//               {expandedId === transcription.uuid && transcription.transcription && (
//                 <div className="p-5 bg-gray-100">
//                   <p className="text-gray-700 whitespace-pre-wrap">{transcription.transcription}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TranscriptionList;














// 'use client';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ClipboardIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Use Heroicons

// interface Transcription {
//   uuid: string;
//   title: string;
//   createdAt: string;
//   transcription: string; // Already fetched
// }

// const TranscriptionList: React.FC = () => {
//   const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null); // Track expanded transcription

//   useEffect(() => {
//     const fetchTranscriptions = async () => {
//       try {
//         const response = await axios.get('/api/get-transcriptions');
//         setTranscriptions(response.data);
//         console.log('response.data',response.data)
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch transcriptions');
//         setLoading(false);
//       }
//     };

//     fetchTranscriptions();
//   }, []);

//   const toggleExpand = (uuid: string) => {
//     setExpandedId(expandedId === uuid ? null : uuid);
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     alert('Transcription copied to clipboard!');
//   };

//   if (loading) return <div className="text-center">Loading...</div>;
//   if (error) return <div className="text-center text-red-500">{error}</div>;

//   return (
//     <div className="bg-gray-100 min-h-screen py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h1 className="text-3xl font-semibold text-gray-900 mb-6">Transcriptions</h1>
//         <div className="space-y-4"> {/* Full width stacking */}
//           {transcriptions.map((transcription) => (
//             <div
//               key={transcription.uuid}
//               className="bg-white shadow rounded-lg overflow-hidden w-full"
//             >

//               <div className="p-5 flex justify-between items-center">
//                 <div>
//                   <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
//                     {transcription.title}
//                   </h3>
//                   <p className="mt-1 text-sm text-gray-500">
//                     Created: {new Date(transcription.createdAt).toLocaleDateString()}
//                   </p>
//                 </div>
//                 <button
//                   onClick={() => copyToClipboard(transcription.transcription)}
//                   className="flex items-center text-sm text-indigo-600 hover:text-indigo-500"
//                 >
//                   <ClipboardIcon className="w-5 h-5 mr-1" />
//                   Copy
//                 </button>
//               </div>
//               <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
//                 <button
//                   onClick={() => toggleExpand(transcription.uuid)}
//                   className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
//                 >
//                   {expandedId === transcription.uuid ? (
//                     <>
//                       <ChevronUpIcon className="w-5 h-5 mr-1" />
//                       Collapse
//                     </>
//                   ) : (
//                     <>
//                       <ChevronDownIcon className="w-5 h-5 mr-1" />
//                       Expand
//                     </>
//                   )}
//                 </button>
//               </div>
//               {expandedId === transcription.uuid && transcription.transcription && (
//                 <div className="p-5 bg-gray-100">
//                   <p className="text-gray-700 whitespace-pre-wrap">{transcription.transcription}</p>
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TranscriptionList;















// 'use client';
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { ClipboardIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid'; // Use Heroicons

// interface Transcription {
//   uuid: string;
//   title: string;
//   createdAt: string;
//   transcription?: string; // Optional until fetched
// }

// const TranscriptionList: React.FC = () => {
//   const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [expandedId, setExpandedId] = useState<string | null>(null); // Track expanded transcription

//   useEffect(() => {
//     const fetchTranscriptions = async () => {
//       try {
//         const response = await axios.get('/api/get-transcriptions');
//         setTranscriptions(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch transcriptions');
//         setLoading(false);
//       }
//     };

//     fetchTranscriptions();
//   }, []);

//   const toggleExpand = async (uuid: string) => {
//     if (expandedId === uuid) {
//       setExpandedId(null); // Collapse if already expanded
//     } else {
//       try {
//         const response = await axios.get(`/api/get-transcription-content/${uuid}`);
//         setTranscriptions((prev) =>
//           prev.map((transcription) =>
//             transcription.uuid === uuid
//               ? { ...transcription, transcription: response.data.transcription }
//               : transcription
//           )
//         );
//         setExpandedId(uuid); // Set as expanded
//       } catch (error) {
//         console.error('Failed to fetch transcription content:', error);
//       }
//     }
//   };

//   const copyToClipboard = (text: string) => {
//     navigator.clipboard.writeText(text);
//     alert('Transcription copied to clipboard!');
//   };

//   if (loading) return <div className="text-center">Loading...</div>;
//   if (error) return <div className="text-center text-red-500">{error}</div>;

//   return (
//     <div className="bg-gray-100 min-h-screen py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h1 className="text-3xl font-semibold text-gray-900 mb-6">Transcriptions</h1>
//         <div className="space-y-4"> {/* Full width stacking */}
//           {transcriptions.map((transcription) => (
//             <div
//               key={transcription.uuid}
//               className="bg-white shadow rounded-lg overflow-hidden w-full"
//             >
//               <div className="p-5">
//                 <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
//                   {transcription.title}
//                 </h3>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Created: {new Date(transcription.createdAt).toLocaleDateString()}
//                 </p>

//                 {expandedId === transcription.uuid && transcription.transcription && (
//                   <div className="mt-4">
//                     <p className="text-gray-700 whitespace-pre-wrap">{transcription.transcription}</p>
//                     <button
//                       onClick={() => copyToClipboard(transcription.transcription!)}
//                       className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-500"
//                     >
//                       <ClipboardIcon className="w-5 h-5 mr-1" />
//                       Copy Transcription
//                     </button>
//                   </div>
//                 )}
//               </div>
//               <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
//                 <button
//                   onClick={() => toggleExpand(transcription.uuid)}
//                   className="flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500"
//                 >
//                   {expandedId === transcription.uuid ? (
//                     <>
//                       <ChevronUpIcon className="w-5 h-5 mr-1" />
//                       Collapse
//                     </>
//                   ) : (
//                     <>
//                       <ChevronDownIcon className="w-5 h-5 mr-1" />
//                       Expand
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TranscriptionList;
















// // components/TranscriptionList.tsx
// 'use client'
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// interface Transcription {
//   uuid: string;
//   title: string;
//   createdAt: string;
// }

// const TranscriptionList: React.FC = () => {
//   const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchTranscriptions = async () => {
//       try {
//         const response = await axios.get('/api/get-transcriptions');
//         setTranscriptions(response.data);
//         setLoading(false);
//       } catch (err) {
//         setError('Failed to fetch transcriptions');
//         setLoading(false);
//       }
//     };

//     fetchTranscriptions();
//   }, []);

//   if (loading) return <div className="text-center">Loading...</div>;
//   if (error) return <div className="text-center text-red-500">{error}</div>;

//   return (
//     <div className="bg-gray-100 min-h-screen py-8">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <h1 className="text-3xl font-semibold text-gray-900 mb-6">Transcriptions</h1>
//         <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
         
//           {transcriptions.map((transcription) => (
            
//             <div
//               key={transcription.uuid}
//               className="bg-white overflow-hidden shadow rounded-lg"
//             >
//               <div className="p-5">
//                 <h3 className="text-lg leading-6 font-medium text-gray-900 truncate">
//                   {transcription.title}
//                 </h3>
//                 <p className="mt-1 text-sm text-gray-500">
//                   Created: {new Date(transcription.createdAt).toLocaleDateString()}
//                 </p>
//               </div>
//               <div className="bg-gray-50 px-5 py-3">
//                 <button
//                   onClick={() => {
//                     // Implement download functionality here
//                     console.log(`Download transcription: ${transcription.uuid}`);
//                   }}

//                   className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
//                 >
//                   Download
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default TranscriptionList;