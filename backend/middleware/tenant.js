const Community = require('../models/Community');

const identifyTenant = async (req, res, next) => {
  try {
    let community = null;
    let communityId = null;

    // Method 1: Get from subdomain header (from frontend proxy)
    if (req.headers['x-community-subdomain']) {
      community = await Community.findOne({ 
        subdomain: req.headers['x-community-subdomain'].toLowerCase(),
        isActive: true 
      });
      
      if (community) {
        communityId = community._id;
        console.log(`🏢 Tenant identified from subdomain: ${community.subdomain}`);
      }
    }

    // Method 2: Get from authenticated user's community
    if (!communityId && req.user && req.user.community) {
      communityId = req.user.community._id || req.user.community;
      community = await Community.findById(communityId);
      
      if (community) {
        console.log(`🏢 Tenant identified from user context: ${community.subdomain}`);
      }
    }

    // Method 3: Get from query parameter (for super admin operations)
    if (!communityId && req.query.communityId) {
      communityId = req.query.communityId;
      community = await Community.findById(communityId);
      
      if (community) {
        console.log(`🏢 Tenant identified from query: ${community.subdomain}`);
      }
    }

    // For super admin, community might be optional for some operations
    if (!communityId && req.user && req.user.role === 'super_admin') {
      console.log(`👑 Super admin operation - no tenant context required`);
      return next();
    }

    // For non-super admin users, community is required
    if (!communityId) {
      return res.status(400).json({
        success: false,
        error: 'Community context is required. Please provide community subdomain or ensure user is associated with a community.'
      });
    }

    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found or inactive'
      });
    }

    // Set community context on request
    req.community = community;
    req.communityId = communityId;
    
    console.log(`✅ Tenant context set: ${community.name} (${community.subdomain})`);
    next();
  } catch (error) {
    console.error('Tenant identification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to identify tenant context'
    });
  }
};

// Middleware to require tenant context (even for super admin)
const requireTenant = async (req, res, next) => {
  try {
    let communityId = null;

    // Try all methods to get community context
    if (req.headers['x-community-subdomain']) {
      const community = await Community.findOne({ 
        subdomain: req.headers['x-community-subdomain'].toLowerCase(),
        isActive: true 
      });
      if (community) communityId = community._id;
    }

    if (!communityId && req.user && req.user.community) {
      communityId = req.user.community._id || req.user.community;
    }

    if (!communityId && req.query.communityId) {
      communityId = req.query.communityId;
    }

    if (!communityId) {
      return res.status(400).json({
        success: false,
        error: 'Community context is required for this operation'
      });
    }

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        error: 'Community not found'
      });
    }

    req.community = community;
    req.communityId = communityId;
    next();
  } catch (error) {
    console.error('Require tenant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to set tenant context'
    });
  }
};

module.exports = { identifyTenant, requireTenant };