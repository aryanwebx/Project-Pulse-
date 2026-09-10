const http = require("http");
const { Server } = require("socket.io");

let io;
let httpServer;

const initSocket = (expressApp, corsOptions) => {
  httpServer = http.createServer(expressApp);

  io = new Server(httpServer, {
    cors: corsOptions,
  });

  io.on("connection", (socket) => {
    // Room for community-wide events
    socket.on("join:community", (communityId) => {
      socket.join(communityId);
    });

    // Room for issue-specific events
    socket.on("join:issue", (issueId) => {
      socket.join(issueId);
    });

    // *** NEW: Room for user-specific notifications ***
    socket.on("join:user", (userId) => {
      socket.join(`user:${userId}`);
    });

    socket.on("disconnect", (reason) => {});

    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  return { io, httpServer };
};

// Export the io instance to be used in other files
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};

module.exports = { initSocket, getIO };
