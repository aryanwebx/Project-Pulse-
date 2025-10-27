const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {isTokenBlacklisted} = require('./tokenBlacklist')

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false,
        error: 'No token provided, authorization denied' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if token is blacklisted
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ 
        success: false,
        error: 'Token has been invalidated' 
      });
    }
    
    // Get user from token
    const user = await User.findById(decoded.userId)
      .populate('community', 'name subdomain settings')
      .select('-password'); // Exclude password
    
    if (!user) {
      return res.status(401).json({ 
        success: false,
        error: 'Token is not valid - user not found' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false,
        error: 'Account is deactivated' 
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false,
        error: 'Invalid token' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false,
        error: 'Token expired' 
      });
    }

    res.status(500).json({ 
      success: false,
      error: 'Server error in authentication' 
    });
  }
};

// Middleware to require super admin role
const requireSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Super admin role required.' 
    });
  }
  next();
};

// Middleware to require community admin or super admin
const requireCommunityAdmin = (req, res, next) => {
  if (!['super_admin', 'community_admin'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Admin privileges required.' 
    });
  }
  next();
};

// Middleware to require resident or higher
const requireResident = (req, res, next) => {
  if (!['super_admin', 'community_admin', 'resident'].includes(req.user.role)) {
    return res.status(403).json({ 
      success: false,
      error: 'Access denied. Authentication required.' 
    });
  }
  next();
};

module.exports = { 
  auth, 
  requireSuperAdmin, 
  requireCommunityAdmin, 
  requireResident 
};