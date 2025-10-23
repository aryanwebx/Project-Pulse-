const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/communities', require('./routes/communities'));

// Basic health check route
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  res.json({ 
    success: true,
    message: 'Project Pulse Backend is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Test protected route
app.get('/api/protected-test', require('./middleware/auth').auth, (req, res) => {
  res.json({
    success: true,
    message: 'You have accessed a protected route!',
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// Test admin protected route
app.get('/api/admin-test', 
  require('./middleware/auth').auth,
  require('./middleware/auth').requireCommunityAdmin,
  (req, res) => {
    res.json({
      success: true,
      message: 'You have accessed an admin protected route!',
      user: req.user
    });
  }
);

// Test multi-tenant route
app.get('/api/tenant-test', 
  require('./middleware/auth').auth,
  require('./middleware/tenant').identifyTenant,
  (req, res) => {
    res.json({
      success: true,
      message: 'Multi-tenant route accessed successfully!',
      data: {
        user: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role
        },
        community: req.community ? {
          id: req.community._id,
          name: req.community.name,
          subdomain: req.community.subdomain
        } : null
      }
    });
  }
);

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
});


// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth routes: http://localhost:${PORT}/api/auth`);
});