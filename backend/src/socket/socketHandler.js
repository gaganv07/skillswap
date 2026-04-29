const socketIO = require('socket.io');
const env = require('../config/env');
const logger = require('../config/logger');

const setupSocket = (server) => {
  const io = socketIO(server, {
    cors: {
      origin: env.corsOrigins,
      methods: ['GET', 'POST']
    }
  });

  // Store active connections
  const activeConnections = {};
  // Store online users for presence
  const onlineUsers = new Set();

  // Add emitNotification method to io
  io.emitNotification = (userId, notification) => {
    const socketId = activeConnections[userId];
    if (socketId) {
      io.to(socketId).emit('notification', notification);
      logger.info(`Notification sent to user ${userId}:`, notification.type);
    }
  };

  io.on('connection', (socket) => {
    logger.info(`New socket connection: ${socket.id}`);

    // User joins
    socket.on('user_join', (userId) => {
      activeConnections[userId] = socket.id;
      onlineUsers.add(userId);
      logger.info(`User ${userId} connected with socket ${socket.id}`);

      // Emit presence update
      io.emit('presence:update', { userId, online: true });
    });

// Join room
    socket.on('room:join', (roomId) => {
      socket.join(roomId);
      logger.info(`User ${getUserIdBySocket(socket.id)} joined room ${roomId}`);
    });

    // Leave room
    socket.on('room:leave', (roomId) => {
      socket.leave(roomId);
      logger.info(`User ${getUserIdBySocket(socket.id)} left room ${roomId}`);
    });

    // Send room message
    socket.on('message:send', (data) => {
      const { roomId, senderId, content, type = 'text', fileUrl, fileName, fileSize } = data;

      // Emit to room (including sender for consistency)
      io.to(roomId).emit('message:new', {
        roomId,
        senderId,
        content,
        type,
        fileUrl,
        fileName,
        fileSize,
        timestamp: new Date(),
      });
    });

    // Typing in room
    socket.on('typing:start', (data) => {
      const { roomId, userId } = data;
      socket.to(roomId).emit('typing', { userId });
    });

    socket.on('typing:stop', (data) => {
      const { roomId } = data;
      socket.to(roomId).emit('typing:stop');
    });

    // WebRTC signaling for calls
    socket.on('call:offer', (data) => {
      const { toUserId, offer } = data;
      const recipientSocketId = activeConnections[toUserId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call:offer', { fromUserId: getUserIdBySocket(socket.id), offer });
      }
    });

    socket.on('call:answer', (data) => {
      const { toUserId, answer } = data;
      const recipientSocketId = activeConnections[toUserId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call:answer', { fromUserId: getUserIdBySocket(socket.id), answer });
      }
    });

    socket.on('ice:candidate', (data) => {
      const { toUserId, candidate } = data;
      const recipientSocketId = activeConnections[toUserId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('ice:candidate', { fromUserId: getUserIdBySocket(socket.id), candidate });
      }
    });

    socket.on('call:end', (data) => {
      const { toUserId } = data;
      const recipientSocketId = activeConnections[toUserId];
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call:end', { fromUserId: getUserIdBySocket(socket.id) });
      }
    });

    // Disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId = null;
      for (const userId in activeConnections) {
        if (activeConnections[userId] === socket.id) {
          delete activeConnections[userId];
          onlineUsers.delete(userId);
          disconnectedUserId = userId;
          logger.info(`User ${userId} disconnected`);
          break;
        }
      }

      // Emit presence update
      if (disconnectedUserId) {
        io.emit('presence:update', { userId: disconnectedUserId, online: false });
      }
    });
  });

  // Helper function to get userId by socketId
  const getUserIdBySocket = (socketId) => {
    for (const userId in activeConnections) {
      if (activeConnections[userId] === socketId) {
        return userId;
      }
    }
    return null;
  };

  return io;
};

module.exports = setupSocket;
