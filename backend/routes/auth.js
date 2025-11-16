const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Community = require('../models/Community');
const { auth } = require('../middleware/auth');
const crypto = require('crypto');
const { addToBlacklist } = require('../middleware/tokenBlacklist');
const router = express.Router();

// Helper function to generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId,
      jti: crypto.randomBytes(16).toString('hex')
     }, 
    process.env.JWT_SECRET, 
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      email, 
      password, 
      role = 'resident', 
      communitySubdomain, 
      apartmentNumber,
      phone 
    } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, email, and password'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Handle community assignment
    let community = null;
    
    if (role !== 'super_admin') {
      if (!communitySubdomain) {
        return res.status(400).json({
          success: false,
          error: 'Community subdomain is required for non-super admin users'
        });
      }

      // Find active community
      community = await Community.findOne({ 
        subdomain: communitySubdomain.toLowerCase(),
        isActive: true 
      });

      if (!community) {
        return res.status(400).json({
          success: false,
          error: 'Community not found or inactive'
        });
      }
    }

    // For super admin, no community needed
    if (role === 'super_admin' && communitySubdomain) {
      return res.status(400).json({
        success: false,
        error: 'Super admin cannot be associated with a community'
      });
    }

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase(),
      password,
      role,
      community: community?._id,
      apartmentNumber: apartmentNumber?.trim() || '',
      phone: phone?.trim() || ''
    });

    await user.save();

    // Populate community info for response
    if (community) {
      await user.populate('community', 'name subdomain settings');
    }

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          community: user.community,
          apartmentNumber: user.apartmentNumber,
          phone: user.phone,
          avatar: user.avatar
        },
        token
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    // Find user and include password for comparison
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password')
      .populate('community', 'name subdomain settings isActive');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Account is deactivated. Please contact administrator.'
      });
    }

    // Check if community is active (for non-super admin users)
    if (user.community && !user.community.isActive) {
      return res.status(400).json({
        success: false,
        error: 'Community is deactivated. Please contact administrator.'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Remove password from user object
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, apartmentNumber, phone, avatar } = req.body;
    const allowedUpdates = { name, apartmentNumber, phone, avatar };

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      allowedUpdates,
      { 
        new: true,
        runValidators: true 
      }
    ).populate('community', 'name subdomain settings');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during profile update'
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during password change'
    });
  }
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', auth, async (req, res) => {
  try {

    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      addToBlacklist(token);
    }
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    });
  }
});

module.exports = router;