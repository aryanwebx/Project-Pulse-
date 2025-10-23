const express = require('express');
const Community = require('../models/Community');
const User = require('../models/User');
const { auth, requireSuperAdmin, requireCommunityAdmin } = require('../middleware/auth');
const { identifyTenant, requireTenant } = require('../middleware/tenant');

const router = express.Router();

// @desc    Create a new community (Super Admin only)
// @route   POST /api/communities
// @access  Private (Super Admin)
router.post('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { 
      name, 
      subdomain, 
      contactEmail, 
      description = '',
      settings = {} 
    } = req.body;

    // Validation
    if (!name || !subdomain || !contactEmail) {
      return res.status(400).json({
        success: false,
        error: 'Please provide name, subdomain, and contact email'
      });
    }

    // Validate subdomain format
    const subdomainRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
    if (!subdomainRegex.test(subdomain)) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain can only contain lowercase letters, numbers, and hyphens'
      });
    }

    // Check if subdomain already exists
    const existingCommunity = await Community.findOne({ 
      subdomain: subdomain.toLowerCase() 
    });

    if (existingCommunity) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain already taken. Please choose a different one.'
      });
    }

    // Create community with default settings
    const community = new Community({
      name: name.trim(),
      subdomain: subdomain.toLowerCase(),
      contactEmail: contactEmail.toLowerCase(),
      description: description.trim(),
      settings: {
        primaryColor: settings.primaryColor || '#3B82F6',
        logo: settings.logo || '',
        categories: settings.categories || ['Plumbing', 'Electrical', 'Security', 'Cleanliness', 'Parking', 'Other'],
        aiFeatures: settings.aiFeatures !== undefined ? settings.aiFeatures : true,
        notifications: {
          email: settings.notifications?.email !== undefined ? settings.notifications.email : true,
          newIssues: settings.notifications?.newIssues !== undefined ? settings.notifications.newIssues : true,
          statusUpdates: settings.notifications?.statusUpdates !== undefined ? settings.notifications.statusUpdates : true
        }
      },
      createdBy: req.user._id
    });

    await community.save();

    console.log(`🏢 New community created: ${community.name} (${community.subdomain}) by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Community created successfully',
      data: { community }
    });

  } catch (error) {
    console.error('Create community error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during community creation'
    });
  }
});

// @desc    Get all communities (Super Admin only)
// @route   GET /api/communities
// @access  Private (Super Admin)
router.get('/', auth, requireSuperAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Build search filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { subdomain: { $regex: search, $options: 'i' } },
        { contactEmail: { $regex: search, $options: 'i' } }
      ];
    }

    // Get communities with pagination
    const communities = await Community.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Community.countDocuments(filter);

    // Get member counts for each community
    const communitiesWithStats = await Promise.all(
      communities.map(async (community) => {
        const memberCount = await User.countDocuments({ community: community._id });
        const issueCount = await require('../models/Issue').countDocuments({ community: community._id });
        
        return {
          ...community.toObject(),
          stats: {
            memberCount,
            issueCount
          }
        };
      })
    );

    res.json({
      success: true,
      data: {
        communities: communitiesWithStats,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });

  } catch (error) {
    console.error('Get communities error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching communities'
    });
  }
});

// @desc    Get current community info
// @route   GET /api/communities/current
// @access  Private (requires community context)
router.get('/current', auth, identifyTenant, async (req, res) => {
  try {
    if (!req.community) {
      return res.status(400).json({
        success: false,
        error: 'Community context required'
      });
    }

    // Get community stats
    const memberCount = await User.countDocuments({ community: req.communityId });
    const issueCount = await require('../models/Issue').countDocuments({ community: req.communityId });
    const activeIssueCount = await require('../models/Issue').countDocuments({ 
      community: req.communityId,
      status: { $in: ['open', 'acknowledged', 'in_progress'] }
    });

    const communityWithStats = {
      ...req.community.toObject(),
      stats: {
        memberCount,
        issueCount,
        activeIssueCount
      }
    };

    res.json({
      success: true,
      data: { community: communityWithStats }
    });

  } catch (error) {
    console.error('Get current community error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching community info'
    });
  }
});

// @desc    Update community settings
// @route   PUT /api/communities/settings
// @access  Private (Community Admin or Super Admin)
router.put('/settings', auth, identifyTenant, requireCommunityAdmin, async (req, res) => {
  try {
    const { settings } = req.body;

    if (!settings) {
      return res.status(400).json({
        success: false,
        error: 'Settings object is required'
      });
    }

    // Only allow certain fields to be updated
    const allowedUpdates = {
      'settings.primaryColor': settings.primaryColor,
      'settings.logo': settings.logo,
      'settings.categories': settings.categories,
      'settings.aiFeatures': settings.aiFeatures,
      'settings.notifications.email': settings.notifications?.email,
      'settings.notifications.newIssues': settings.notifications?.newIssues,
      'settings.notifications.statusUpdates': settings.notifications?.statusUpdates
    };

    // Remove undefined fields
    Object.keys(allowedUpdates).forEach(key => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    const community = await Community.findByIdAndUpdate(
      req.communityId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    res.json({
      success: true,
      message: 'Community settings updated successfully',
      data: { community }
    });

  } catch (error) {
    console.error('Update community settings error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during settings update'
    });
  }
});

// @desc    Get community members
// @route   GET /api/communities/members
// @access  Private (Community Admin or Super Admin)
router.get('/members', auth, identifyTenant, requireCommunityAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, role = '', search = '' } = req.query;

    // Build filter
    const filter = { community: req.communityId };
    
    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { apartmentNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const members = await User.find(filter)
      .select('name email role apartmentNumber phone avatar createdAt isActive')
      .sort({ role: 1, name: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        members,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });

  } catch (error) {
    console.error('Get community members error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching members'
    });
  }
});

// @desc    Update community member role
// @route   PUT /api/communities/members/:userId/role
// @access  Private (Community Admin or Super Admin)
router.put('/members/:userId/role', auth, identifyTenant, requireCommunityAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    const { userId } = req.params;

    if (!role || !['resident', 'community_admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Valid role (resident or community_admin) is required'
      });
    }

    // Find user and ensure they belong to the same community
    const user = await User.findOne({
      _id: userId,
      community: req.communityId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found in this community'
      });
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user._id.toString() && role === 'resident') {
      return res.status(400).json({
        success: false,
        error: 'You cannot change your own role to resident'
      });
    }

    user.role = role;
    await user.save();

    res.json({
      success: true,
      message: `User role updated to ${role}`,
      data: { user }
    });

  } catch (error) {
    console.error('Update member role error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during role update'
    });
  }
});

// @desc    Deactivate/Reactivate community member
// @route   PUT /api/communities/members/:userId/status
// @access  Private (Community Admin or Super Admin)
router.put('/members/:userId/status', auth, identifyTenant, requireCommunityAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;
    const { userId } = req.params;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({
        success: false,
        error: 'isActive (boolean) is required'
      });
    }

    // Find user and ensure they belong to the same community
    const user = await User.findOne({
      _id: userId,
      community: req.communityId
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found in this community'
      });
    }

    // Prevent self-deactivation
    if (user._id.toString() === req.user._id.toString() && !isActive) {
      return res.status(400).json({
        success: false,
        error: 'You cannot deactivate your own account'
      });
    }

    user.isActive = isActive;
    await user.save();

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      data: { user }
    });

  } catch (error) {
    console.error('Update member status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during status update'
    });
  }
});

module.exports = router;