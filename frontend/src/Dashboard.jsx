// import React, { useState, useEffect, useRef } from 'react';
// import { AlertTriangle, Check, Upload, Download, X, Loader } from 'lucide-react';
// import io from 'socket.io-client';

// // Create WebRTC connection configuration
// const configuration = {
//   iceServers: [
//     { urls: 'stun:stun.l.google.com:19302' },
//     { urls: 'stun:stun1.l.google.com:19302' },
//   ],
// };

// const FileTransferApp = () => {
//   // State management
//   const [selectedFile, setSelectedFile] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState('disconnected');
//   const [peerDevices, setPeerDevices] = useState([]);
//   const [transferProgress, setTransferProgress] = useState(0);
//   const [activeTransfers, setActiveTransfers] = useState([]);
//   const [notifications, setNotifications] = useState([]);

//   // Refs for WebRTC and Socket.io connections
//   const peerConnectionRef = useRef(null);
//   const dataChannelRef = useRef(null);
//   const socketRef = useRef(null);

//   // Connect to WebSocket server on component mount
//   useEffect(() => {
//     socketRef.current = io('http://localhost:3001');

//     socketRef.current.on('connect', () => {
//       console.log('Connected to socket server');
//       setConnectionStatus('connected');
//     });

//     socketRef.current.on('peer-connected', (peerId) => {
//       setPeerDevices(prev => [...prev, peerId]);
//     });

//     socketRef.current.on('connection-request', handleConnectionRequest);

//     return () => {
//       socketRef.current.disconnect();
//     };
//   }, []);

//   // Handle incoming connection requests
//   const handleConnectionRequest = async (request) => {
//     const notification = {
//       id: Date.now(),
//       type: 'connection-request',
//       message: `Device ${request.peerId} wants to connect`,
//       actions: [
//         {
//           label: 'Accept',
//           handler: () => acceptConnectionRequest(request.peerId),
//         },
//         {
//           label: 'Decline',
//           handler: () => declineConnectionRequest(request.peerId),
//         },
//       ],
//     };
//     setNotifications(prev => [...prev, notification]);
//   };

//   // Initialize WebRTC peer connection
//   const initializePeerConnection = async () => {
//     peerConnectionRef.current = new RTCPeerConnection(configuration);
    
//     // Set up data channel
//     dataChannelRef.current = peerConnectionRef.current.createDataChannel('fileTransfer');
//     dataChannelRef.current.onmessage = handleDataChannelMessage;
    
//     // Handle ICE candidates
//     peerConnectionRef.current.onicecandidate = (event) => {
//       if (event.candidate) {
//         socketRef.current.emit('ice-candidate', event.candidate);
//       }
//     };
//   };

//   // Handle file selection
//   const handleFileSelect = (event) => {
//     const file = event.target.files[0];
//     if (file) {
//       setSelectedFile(file);
//     }
//   };

//   // Start file transfer
//   const startFileTransfer = async () => {
//     if (!selectedFile || !dataChannelRef.current) return;

//     const transfer = {
//       id: Date.now(),
//       filename: selectedFile.name,
//       size: selectedFile.size,
//       progress: 0,
//       status: 'preparing',
//     };

//     setActiveTransfers(prev => [...prev, transfer]);

//     // Read and send file in chunks
//     const chunkSize = 16384; // 16KB chunks
//     const fileReader = new FileReader();
//     let offset = 0;

//     fileReader.onload = (e) => {
//       dataChannelRef.current.send(e.target.result);
//       offset += e.target.result.byteLength;
      
//       // Update progress
//       const progress = Math.min(100, Math.round((offset / selectedFile.size) * 100));
//       setTransferProgress(progress);
      
//       // Update transfer status
//       setActiveTransfers(prev => 
//         prev.map(t => 
//           t.id === transfer.id 
//             ? { ...t, progress, status: progress === 100 ? 'completed' : 'transferring' }
//             : t
//         )
//       );

//       // Continue sending chunks
//       if (offset < selectedFile.size) {
//         readSlice(offset);
//       }
//     };

//     const readSlice = (o) => {
//       const slice = selectedFile.slice(o, o + chunkSize);
//       fileReader.readAsArrayBuffer(slice);
//     };

//     readSlice(0);
//   };

//   // Handle received data
//   const handleDataChannelMessage = (event) => {
//     // Handle received file chunks
//     // Implementation depends on how you want to handle received files
//     console.log('Received data:', event.data);
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 p-8">
//       <div className="max-w-4xl mx-auto">
//         {/* Connection Status */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <div className="flex items-center justify-between mb-4">
//             <h2 className="text-xl font-semibold">Connection Status</h2>
//             <div className={`flex items-center space-x-2 ${
//               connectionStatus === 'connected' ? 'text-green-500' : 'text-gray-500'
//             }`}>
//               {connectionStatus === 'connected' ? (
//                 <Check className="w-5 h-5" />
//               ) : (
//                 <AlertTriangle className="w-5 h-5" />
//               )}
//               <span className="capitalize">{connectionStatus}</span>
//             </div>
//           </div>

//           {/* Connected Peers */}
//           <div className="space-y-2">
//             {peerDevices.map((peerId) => (
//               <div key={peerId} className="flex items-center justify-between bg-gray-50 p-3 rounded">
//                 <span>Device {peerId}</span>
//                 <button 
//                   className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
//                   onClick={() => {/* Handle disconnect */}}
//                 >
//                   Disconnect
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* File Transfer Section */}
//         <div className="bg-white rounded-lg shadow-md p-6 mb-6">
//           <h2 className="text-xl font-semibold mb-4">File Transfer</h2>
          
//           {/* File Selection */}
//           <div className="mb-6">
//             <input
//               type="file"
//               onChange={handleFileSelect}
//               className="hidden"
//               id="file-input"
//             />
//             <label
//               htmlFor="file-input"
//               className="flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 cursor-pointer"
//             >
//               <Upload className="w-5 h-5" />
//               <span>Select File</span>
//             </label>
//             {selectedFile && (
//               <div className="mt-2 text-sm text-gray-600">
//                 Selected: {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
//               </div>
//             )}
//           </div>

//           {/* Active Transfers */}
//           <div className="space-y-4">
//             {activeTransfers.map((transfer) => (
//               <div key={transfer.id} className="border rounded p-4">
//                 <div className="flex items-center justify-between mb-2">
//                   <span className="font-medium">{transfer.filename}</span>
//                   <div className="flex items-center space-x-2">
//                     <span className="text-sm text-gray-500">
//                       {transfer.status === 'completed' ? 'Completed' : `${transfer.progress}%`}
//                     </span>
//                     {transfer.status === 'transferring' && (
//                       <Loader className="w-4 h-4 animate-spin" />
//                     )}
//                     {transfer.status === 'completed' && (
//                       <Check className="w-4 h-4 text-green-500" />
//                     )}
//                   </div>
//                 </div>
//                 <div className="w-full bg-gray-200 rounded-full h-2">
//                   <div
//                     className="bg-blue-500 rounded-full h-2 transition-all duration-300"
//                     style={{ width: `${transfer.progress}%` }}
//                   />
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Notifications */}
//         <div className="fixed bottom-4 right-4 space-y-2">
//           {notifications.map((notification) => (
//             <div
//               key={notification.id}
//               className="bg-white rounded-lg shadow-lg p-4 max-w-sm animate-slide-in"
//             >
//               <div className="flex items-center justify-between mb-2">
//                 <span className="font-medium">{notification.message}</span>
//                 <button
//                   onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X className="w-4 h-4" />
//                 </button>
//               </div>
//               {notification.actions && (
//                 <div className="flex space-x-2 mt-2">
//                   {notification.actions.map((action, index) => (
//                     <button
//                       key={index}
//                       onClick={() => {
//                         action.handler();
//                         setNotifications(prev => prev.filter(n => n.id !== notification.id));
//                       }}
//                       className={`px-3 py-1 rounded ${
//                         index === 0
//                           ? 'bg-blue-500 text-white hover:bg-blue-600'
//                           : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                       }`}
//                     >
//                       {action.label}
//                     </button>
//                   ))}
//                 </div>
//               )}
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FileTransferApp;























import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const FileSharing = () => {
  const [onlineDevices, setOnlineDevices] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('devices');

  useEffect(() => {
    const socket = io('http://localhost:3000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('new_request', (request) => {
      setRequests(prev => [...prev, request]);
    });

    socket.on('request_accepted', ({ request, connection }) => {
      setRequests(prev => prev.map(req => 
        req._id === request._id ? request : req
      ));
    });

    fetchOnlineDevices();

    return () => socket.disconnect();
  }, []);

  const fetchOnlineDevices = async () => {
    try {
      const response = await fetch('/api/devices/online', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setOnlineDevices(data);
    } catch (error) {
      console.error('Error fetching devices:', error);
    }
  };

  const handleSendRequest = async (receiverId) => {
    try {
      const response = await fetch('/api/devices/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ receiverId })
      });
      const data = await response.json();
      setRequests(prev => [...prev, data]);
    } catch (error) {
      console.error('Error sending request:', error);
    }
  };

  const handleFileSelect = (event) => {
    setSelectedFiles([...event.target.files]);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-white border-b flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">File Sharing Hub</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 p-6 border-b">
          <button
            onClick={() => setActiveTab('devices')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              activeTab === 'devices' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Online Devices
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeTab === 'requests' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {requests.length}
              </span>
            )}
          </button>
        </div>

        <div className="p-6">
          {/* Online Devices */}
          {activeTab === 'devices' && (
            <div className="space-y-4">
              {onlineDevices.map(device => (
                <div
                  key={device._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{device.username}</h3>
                      <p className="text-sm text-gray-500">{device.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleSendRequest(device._id)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Send Files
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-4">
              {requests.map(request => (
                <div
                  key={request._id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        File Request from {request.sender.username}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Status: {request.status}
                      </p>
                    </div>
                  </div>
                  {request.status === 'pending' && (
                    <div className="flex gap-2">
                      <button className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                      <button className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* File Upload Area */}
          <div className="mt-8">
            <input
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="block w-full p-8 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-gray-600">
                Drop files here or click to select files
              </p>
              {selectedFiles.length > 0 && (
                <p className="mt-2 text-sm text-blue-500">
                  {selectedFiles.length} files selected
                </p>
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileSharing;