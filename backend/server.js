// // server.js
// const express = require('express');
// const http = require('http');
// const { Server } = require('socket.io');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();
// const server = http.createServer(app);

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Socket.IO setup with CORS
// const io = new Server(server, {
//   cors: {
//     origin: "http://localhost:3000", // Your React app URL
//     methods: ["GET", "POST"],
//     allowedHeaders: ["my-custom-header"],
//     credentials: true
//   }
// });

// // MongoDB connection (optional)
// mongoose.connect(process.env.MONGODB_URI || ' mongodb://localhost:27017', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// });

// // MongoDB Models (optional)
// const User = mongoose.model('User', {
//   socketId: String,
//   deviceId: String,
//   username: String,
//   connectedPeers: [String],
//   createdAt: { type: Date, default: Date.now }
// });

// const Transfer = mongoose.model('Transfer', {
//   senderId: String,
//   receiverId: String,
//   filename: String,
//   size: Number,
//   status: String,
//   createdAt: { type: Date, default: Date.now }
// });

// // Store active connections
// const activeConnections = new Map();

// // Socket.IO connection handling
// io.on('connection', (socket) => {
//   console.log(`New connection: ${socket.id}`);
  
//   // Store socket connection
//   activeConnections.set(socket.id, {
//     deviceId: socket.handshake.query.deviceId,
//     socket: socket
//   });

//   // Broadcast new peer to all connected clients
//   socket.broadcast.emit('peer-connected', {
//     peerId: socket.id,
//     deviceId: socket.handshake.query.deviceId
//   });

//   // Send list of active peers to newly connected client
//   const activePeers = Array.from(activeConnections.entries())
//     .filter(([id]) => id !== socket.id)
//     .map(([id, data]) => ({
//       peerId: id,
//       deviceId: data.deviceId
//     }));
  
//   socket.emit('active-peers', activePeers);

//   // Handle connection request
//   socket.on('connection-request', async (data) => {
//     const { targetPeerId } = data;
//     const targetSocket = activeConnections.get(targetPeerId)?.socket;

//     if (targetSocket) {
//       targetSocket.emit('connection-request', {
//         peerId: socket.id,
//         deviceId: activeConnections.get(socket.id).deviceId
//       });
//     }
//   });

//   // Handle connection response
//   socket.on('connection-response', (data) => {
//     const { peerId, accepted } = data;
//     const peerSocket = activeConnections.get(peerId)?.socket;

//     if (peerSocket) {
//       peerSocket.emit('connection-response', {
//         peerId: socket.id,
//         accepted
//       });

//       // If accepted, initiate WebRTC signaling
//       if (accepted) {
//         // Update connected peers in database (optional)
//         User.findOneAndUpdate(
//           { socketId: socket.id },
//           { $addToSet: { connectedPeers: peerId } }
//         ).exec();
//       }
//     }
//   });

//   // Handle WebRTC signaling
//   socket.on('offer', (data) => {
//     const { targetPeerId, offer } = data;
//     const targetSocket = activeConnections.get(targetPeerId)?.socket;

//     if (targetSocket) {
//       targetSocket.emit('offer', {
//         peerId: socket.id,
//         offer
//       });
//     }
//   });

//   socket.on('answer', (data) => {
//     const { targetPeerId, answer } = data;
//     const targetSocket = activeConnections.get(targetPeerId)?.socket;

//     if (targetSocket) {
//       targetSocket.emit('answer', {
//         peerId: socket.id,
//         answer
//       });
//     }
//   });

//   socket.on('ice-candidate', (data) => {
//     const { targetPeerId, candidate } = data;
//     const targetSocket = activeConnections.get(targetPeerId)?.socket;

//     if (targetSocket) {
//       targetSocket.emit('ice-candidate', {
//         peerId: socket.id,
//         candidate
//       });
//     }
//   });

//   // Handle transfer status updates
//   socket.on('transfer-started', async (data) => {
//     const { receiverId, filename, size } = data;
    
//     // Log transfer in database (optional)
//     await Transfer.create({
//       senderId: socket.id,
//       receiverId,
//       filename,
//       size,
//       status: 'started'
//     });
//   });

//   socket.on('transfer-progress', (data) => {
//     const { targetPeerId, progress } = data;
//     const targetSocket = activeConnections.get(targetPeerId)?.socket;

//     if (targetSocket) {
//       targetSocket.emit('transfer-progress', {
//         peerId: socket.id,
//         progress
//       });
//     }
//   });

//   socket.on('transfer-complete', async (data) => {
//     const { transferId } = data;
    
//     // Update transfer status in database (optional)
//     await Transfer.findByIdAndUpdate(transferId, {
//       status: 'completed'
//     });
//   });

//   // Handle disconnection
//   socket.on('disconnect', () => {
//     console.log(`Disconnected: ${socket.id}`);
    
//     // Broadcast peer disconnection
//     socket.broadcast.emit('peer-disconnected', {
//       peerId: socket.id
//     });

//     // Remove from active connections
//     activeConnections.delete(socket.id);

//     // Update database (optional)
//     User.updateMany(
//       { connectedPeers: socket.id },
//       { $pull: { connectedPeers: socket.id } }
//     ).exec();
//   });
// });

// // API Routes
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'healthy' });
// });

// // Get transfer history (optional)
// app.get('/api/transfers/:userId', async (req, res) => {
//   try {
//     const transfers = await Transfer.find({
//       $or: [
//         { senderId: req.params.userId },
//         { receiverId: req.params.userId }
//       ]
//     }).sort('-createdAt');
    
//     res.json(transfers);
//   } catch (error) {
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

// // Start server
// const PORT = process.env.PORT || 3001;
// server.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

































// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const mongoose = require('mongoose');
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Socket.IO setup
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST'],
  },
});

// Socket.IO middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', async (socket) => {
  console.log(`User connected: ${socket.user.id}`);
  
  // Join user's room
  socket.join(socket.user.id);
  
  // Update user's online status
  await mongoose.model('User').findByIdAndUpdate(socket.user.id, { isOnline: true });
  io.emit('user_status_change', { userId: socket.user.id, isOnline: true });

  // WebRTC signaling
  socket.on('offer', ({ targetId, offer }) => {
    socket.to(targetId).emit('offer', {
      offer,
      from: socket.user.id,
    });
  });

  socket.on('answer', ({ targetId, answer }) => {
    socket.to(targetId).emit('answer', {
      answer,
      from: socket.user.id,
    });
  });

  socket.on('ice_candidate', ({ targetId, candidate }) => {
    socket.to(targetId).emit('ice_candidate', {
      candidate,
      from: socket.user.id,
    });
  });

  // File transfer events
  socket.on('file_transfer_start', ({ targetId, fileInfo }) => {
    socket.to(targetId).emit('file_transfer_start', {
      fileInfo,
      from: socket.user.id,
    });
  });

  socket.on('file_transfer_progress', ({ targetId, progress }) => {
    socket.to(targetId).emit('file_transfer_progress', {
      progress,
      from: socket.user.id,
    });
  });

  // Disconnect handling
  socket.on('disconnect', async () => {
    console.log(`User disconnected: ${socket.user.id}`);
    await mongoose.model('User').findByIdAndUpdate(socket.user.id, { isOnline: false });
    io.emit('user_status_change', { userId: socket.user.id, isOnline: false });
  });
});

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());

// Make io accessible to routes
app.set('io', io);

// Routes
 app.use('/api/auth', require('./routes/userRoutes'));
app.use('/api/devices', require('./routes/deviceRoutes'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});