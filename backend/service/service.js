// services/socket.service.js
const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const { secret } = require('../config/jwt.config');
const User = require('../models/user.model');

const setupSocketIO = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware for Socket.IO
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, secret);
      socket.user = decoded;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.id}`);

    // Update user's online status
    await User.findByIdAndUpdate(socket.user.id, { isOnline: true });
    io.emit('user_status_change', { userId: socket.user.id, isOnline: true });

    // Join user's own room for private messages
    socket.join(socket.user.id);

    // Handle WebRTC signaling
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

    // Handle disconnection
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.user.id}`);
      await User.findByIdAndUpdate(socket.user.id, { isOnline: false });
      io.emit('user_status_change', { userId: socket.user.id, isOnline: false });
    });
  });

  return io;
};

module.exports = setupSocketIO;