const http = require('http');
const { Server } = require('socket.io');

let io;
let httpServer;

const initSocket = (expressApp, corsOptions) => {
  httpServer = http.createServer(expressApp);
  
  io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Room for community-wide events
    socket.on('join:community', (communityId) => {
      socket.join(communityId);
      console.log(`🏢 User ${socket.id} joined community room: ${communityId}`);
    });

    // Room for issue-specific events
    socket.on('join:issue', (issueId) => {
      socket.join(issueId);
      console.log(`📋 User ${socket.id} joined issue room: ${issueId}`);
    });

    // *** NEW: Room for user-specific notifications ***
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      console.log(`👤 User ${socket.id} joined personal room: user:${userId}`);
    });

    socket.on('disconnect', (reason) => {
      console.log(`🔥 Socket disconnected: ${socket.id}, Reason: ${reason}`);
    });

    socket.on('error', (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  return { io, httpServer };
};

// Export the io instance to be used in other files
const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };