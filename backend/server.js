const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http"); // 1. Import http
const { Server } = require("socket.io"); // 2. Import Server from socket.io
const connectDB = require("./config/database");
const { configureCloudinary } = require("./config/cloudinary");
// const { setupEmail } = require('./services/emailService'); // Assuming emailService is set up

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Connect to Cloudinary
configureCloudinary();

// Initialize Email Service (if you have it)
// setupEmail(); // Uncomment if you have setupEmail

const app = express();

// --- CORS Configuration ---
// Ensure FRONTEND_URL is set in your .env file (e.g., FRONTEND_URL=http://localhost:5173)
const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], // Add OPTIONS for preflight requests
  credentials: true // If you need cookies/sessions
};
app.use(cors(corsOptions)); // Use configured CORS

// --- HTTP Server and Socket.io Integration ---
// 3. Create an HTTP server from your Express app
const server = http.createServer(app);

// 4. Initialize Socket.io, attaching it to the HTTP server
const io = new Server(server, {
  cors: corsOptions, // Use the same CORS options
  // Optional: Add transport options if needed, e.g., for polling fallback
  // transports: ['websocket', 'polling']
});

// --- Middleware ---
app.use(express.json({ limit: "10mb" })); // For parsing JSON bodies
app.use(express.urlencoded({ extended: true })); // For parsing URL-encoded bodies

// 5. Make the `io` instance accessible in your routes
app.set("io", io);

// --- Socket.io Connection Logic ---
// 6. Handle Socket.io connections and events
io.on("connection", (socket) => {
  console.log(`🔌 Socket connected: ${socket.id}`);

  // Event listener for clients joining a community-wide room (optional)
  socket.on("join-community", (communityId) => {
    socket.join(communityId);
    console.log(`🏢 User ${socket.id} joined community room: ${communityId}`);
  });

  // Event listener for clients joining an issue-specific room
  socket.on("join:issue", (issueId) => {
    socket.join(issueId); // The client joins a room named after the issue ID
    console.log(`📋 User ${socket.id} joined issue room: ${issueId}`);
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`🔥 Socket disconnected: ${socket.id}, Reason: ${reason}`);
  });

  // Optional: Error handling for socket events
  socket.on("error", (error) => {
     console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});
// --- End Socket.io Integration ---

// --- Define API Routes ---
// It's good practice to ensure routes exist before using them
try {
    app.use("/api/auth", require("./routes/auth"));
    app.use("/api/communities", require("./routes/communities"));
    app.use("/api/issues", require("./routes/issues"));
    app.use("/api/upload", require("./routes/upload"));
    app.use('/api/health', require('./routes/health'));
    app.use('/api/superadmin', require('./routes/superadmin'));
} catch (err) {
    console.error("❌ Error loading routes:", err);
    // Optionally exit if routes are critical
    // process.exit(1);
}


// --- Basic Health Check and API Info Routes ---
// Note: Your specific /api/health route might be handled by routes/health.js now
// If routes/health.js exports a router for GET /, this might conflict or be overridden.
// It's usually better to have specific health checks in their own file.
// Let's keep a root health check here for basic server status.
app.get("/health", (req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});

app.get("/api", (req, res) => {
  res.json({
    message: "📡 Project Pulse API",
    version: "1.0.0", // Consider reading from package.json
    status: "✅ Operational",
  });
});

// --- Error Handling ---
// Handle undefined routes (404 Not Found) - Place after all valid routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: `🔍 Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handling middleware - Place last
app.use((error, req, res, next) => {
  console.error("💥 Global Error Handler:", error.name, "-", error.message);
  // Log stack trace in development
  if (process.env.NODE_ENV !== 'production') {
      console.error(error.stack);
  }

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      error: `Validation Error: ${errors.join(", ")}`,
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    const value = error.keyValue[field];
    return res.status(400).json({
      success: false,
      error: `Duplicate field value entered: '${value}' for field '${field}'. Please use another value.`,
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, error: "Unauthorized: Invalid token" });
  }
  if (error.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, error: "Unauthorized: Token expired" });
  }

  // Default server error
  res.status(error.status || 500).json({ // Use error.status if available
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal Server Error" : error.message,
  });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5000;

// 7. Start listening on the `server` (the http server), NOT the `app`
server.listen(PORT, () => {
  console.log("\n🎉 ==================================");
  console.log("🚀 Project Pulse Backend Started!");
  console.log("==================================");
  console.log(`📍 Listening on Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🗄️  Database: ${
      mongoose.connection.readyState === 1 ? "✅ Connected" : `❌ Disconnected (State: ${mongoose.connection.readyState})`
    }`
  );
  // Add Cloudinary status if configureCloudinary provides a status check
  // console.log(`☁️ Cloudinary: ${getCloudinaryStatus()}`); // Example
  console.log("==================================");
  console.log(`🔗 Frontend URL (for CORS): ${allowedOrigins[0]}`);
  console.log(`🩺 Health Check: http://localhost:${PORT}/health`); // Updated simple health check path
  console.log("==================================\n");
});

// Optional: Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server')
  server.close(() => {
    console.log('HTTP server closed')
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed')
      process.exit(0)
    })
  })
})