const express = require('express');
const router = express.Router();
const { auth, requireSuperAdmin } = require('../middleware/auth');
const Issue = require('../models/Issue');
const User = require('../models/User');
const Community = require('../models/Community');

// All routes in this file are protected and require super admin
router.use(auth, requireSuperAdmin);

/**
 * @desc    Get platform-wide statistics
 * @route   GET /api/superadmin/stats
 * @access  Private (Super Admin)
 */
router.get('/stats', async (req, res) => {
  try {
    const totalIssues = await Issue.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalCommunities = await Community.countDocuments();
    const openIssues = await Issue.countDocuments({ status: { $in: ['open', 'in_progress', 'acknowledged'] } });

    res.json({
      success: true,
      data: {
        totalIssues,
        totalUsers,
        totalCommunities,
        openIssues
      }
    });
  } catch (error) {
    console.error('Super admin stats error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching stats' });
  }
});

/**
 * @desc    Get all users on the platform
 * @route   GET /api/superadmin/users
 * @access  Private (Super Admin)
 */
router.get('/users', async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .populate('community', 'name subdomain')
      .sort({ createdAt: -1 });
      
    res.json({ success: true, data: { users } });
  } catch (error) {
    console.error('Super admin get users error:', error);
    res.status(500).json({ success: false, error: 'Server error fetching users' });
  }
});

/**
 * @desc    Update any user's details (role, community, status)
 * @route   PUT /api/superadmin/users/:userId
 * @access  Private (Super Admin)
 */
router.put('/users/:userId', async (req, res) => {
  try {
    const { role, community, isActive } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Super admin can change anything
    if (role) user.role = role;
    
    // Allow setting community to null (e.g., for other super admins)
    if (community !== undefined) {
        user.community = community === '' ? null : community;
    }
    
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();
    
    // Re-populate community if it exists
    if (user.community) {
        await user.populate('community', 'name subdomain');
    }

    res.json({ success: true, message: 'User updated successfully', data: { user } });
  } catch (error) {
    console.error('Super admin update user error:', error);
    res.status(500).json({ success: false, error: 'Server error updating user' });
  }
});

module.exports = router;