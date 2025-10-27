const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/database");
const { configureCloudinary } = require("./config/cloudinary");
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

//connect to Cloudinary
configureCloudinary();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Socket.io for real-time updates
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("join-community", (communityId) => {
    socket.join(communityId);
    console.log(`🏢 User ${socket.id} joined community: ${communityId}`);
  });

  socket.on("join-issue", (issueId) => {
    socket.join(issueId);
    console.log(`📋 User ${socket.id} joined issue: ${issueId}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 User disconnected:", socket.id);
  });
});

// Make io available to routes
app.set("io", io);

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/communities", require("./routes/communities"));
app.use("/api/issues", require("./routes/issues"));
app.use("/api/upload", require("./routes/upload"));
app.use('/api/health', require('./routes/health'));

// Health check route
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "🚀 Project Pulse Backend is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database:
      mongoose.connection.readyState === 1 ? "✅ Connected" : "❌ Disconnected",
    version: "1.0.0",
  });
});

// API Info route
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "📡 Project Pulse API",
    endpoints: {
      auth: "/api/auth",
      communities: "/api/communities",
      issues: "/api/issues",
      health: "/api/health",
    },
    documentation: "See README.md for API documentation",
  });
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `🔍 Route ${req.originalUrl} not found`,
  });
});

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("💥 Server error:", error);

  // Mongoose validation error
  if (error.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return res.status(400).json({
      success: false,
      error: errors.join(", "),
    });
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} already exists`,
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: "Token expired",
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error:
      process.env.NODE_ENV === "production"
        ? "Internal server error"
        : error.message,
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("\n🎉 ==================================");
  console.log("🚀 Project Pulse Backend Started!");
  console.log("==================================");
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(
    `🗄️  Database: ${
      mongoose.connection.readyState === 1 ? "Connected" : "Disconnected"
    }`
  );
  console.log("==================================");
  console.log(`📊 Health: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth: http://localhost:${PORT}/api/auth`);
  console.log(`🏢 Communities: http://localhost:${PORT}/api/communities`);
  console.log(`📋 Issues: http://localhost:${PORT}/api/issues`);
  console.log("==================================\n");
});
