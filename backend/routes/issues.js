const express = require('express');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');
const { auth, requireCommunityAdmin } = require('../middleware/auth');
const { identifyTenant } = require('../middleware/tenant');

const router = express.Router();

// All routes require auth and tenant context
router.use(auth, identifyTenant);

// @desc    Get all issues for current community
// @route   GET /api/issues
// @access  Private
router.get('/', async (req, res) => {
  try {
    const {
      status,
      category,
      urgency,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      search = ''
    } = req.query;

    // Build filter object
    const filter = { community: req.communityId };

    // Add optional filters
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (urgency && urgency !== 'all') {
      filter.urgency = urgency;
    }

    // Search in title and description
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    if (sortBy === 'upvotes') {
      sortOptions.upvoteCount = sortOrder === 'desc' ? -1 : 1;
    } else {
      sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;
    }

    // Execute query with pagination
    const issues = await Issue.find(filter)
      .populate('createdBy', 'name email apartmentNumber avatar')
      .populate('assignedTo', 'name email')
      .populate('upvotes', 'name')
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count for pagination
    const total = await Issue.countDocuments(filter);

    res.json({
      success: true,
      data: {
        issues,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });

  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching issues'
    });
  }
});

// @desc    Get a single issue
// @route   GET /api/issues/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId
    })
      .populate('createdBy', 'name email apartmentNumber avatar')
      .populate('assignedTo', 'name email avatar')
      .populate('upvotes', 'name email')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email avatar role'
        },
        options: { sort: { createdAt: 1 } }
      });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    res.json({
      success: true,
      data: { issue }
    });

  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching issue'
    });
  }
});

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      urgency = 'medium',
      location,
      images = [],
      tags = []
    } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: 'Please provide title, description, and category'
      });
    }

    // Validate category against community's allowed categories
    const allowedCategories = req.community.settings.categories || [
      'Plumbing', 'Electrical', 'Security', 'Cleanliness', 'Parking', 'Other'
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Allowed categories: ${allowedCategories.join(', ')}`
      });
    }

    // Create issue
    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      category,
      urgency,
      location: location ? location.trim() : '',
      images,
      tags: tags.map(tag => tag.trim()),
      createdBy: req.user._id,
      community: req.communityId
    });

    await issue.save();
    await issue.populate('createdBy', 'name email apartmentNumber avatar');

    console.log(`📋 New issue created: "${issue.title}" by ${req.user.name} in ${req.community.name}`);

    res.status(201).json({
      success: true,
      message: 'Issue created successfully',
      data: { issue }
    });

  } catch (error) {
    console.error('Create issue error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error during issue creation'
    });
  }
});

// @desc    Update issue status (Admin only)
// @route   PUT /api/issues/:id/status
// @access  Private (Community Admin or Super Admin)
router.put('/:id/status', requireCommunityAdmin, async (req, res) => {
  try {
    const { status, assignedTo, adminNote } = req.body;
    console.log(assignedTo)

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      });
    }

    // Validate status
    const validStatuses = ['open', 'acknowledged', 'in_progress', 'resolved'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    // Find issue in current community
    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Store old status for comment
    const oldStatus = issue.status;

    // Update issue
    issue.status = status;
    if (assignedTo) {
      issue.assignedTo = assignedTo;
    }

    // Set resolvedAt if status is resolved
    if (status === 'resolved' && !issue.resolvedAt) {
      issue.resolvedAt = new Date();
    }

    await issue.save();
    await issue.populate('createdBy', 'name email apartmentNumber avatar');
    await issue.populate('assignedTo', 'name email');

    // Create admin comment if note provided or status changed
    if (adminNote || oldStatus !== status) {
      const comment = new Comment({
        content: adminNote || `Status updated from ${oldStatus} to ${status}`,
        issue: issue._id,
        author: req.user._id,
        community: req.communityId,
        isAdminUpdate: true,
        statusUpdate: {
          oldStatus,
          newStatus: status
        }
      });
      await comment.save();
    }

    console.log(`🔄 Issue status updated: "${issue.title}" -> ${status} by ${req.user.name}`);

    res.json({
      success: true,
      message: 'Issue status updated successfully',
      data: { issue }
    });

  } catch (error) {
    console.error('Update issue status error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during status update'
    });
  }
});

// @desc    Upvote an issue
// @route   POST /api/issues/:id/upvote
// @access  Private
router.post('/:id/upvote', async (req, res) => {
  try {
    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    const hasUpvoted = issue.upvotes.includes(req.user._id);

    if (hasUpvoted) {
      // Remove upvote
      issue.upvotes.pull(req.user._id);
      console.log(`👎 Upvote removed from "${issue.title}" by ${req.user.name}`);
    } else {
      // Add upvote
      issue.upvotes.push(req.user._id);
      console.log(`👍 Upvote added to "${issue.title}" by ${req.user.name}`);
    }

    await issue.save();
    await issue.populate('createdBy', 'name email apartmentNumber avatar');
    await issue.populate('upvotes', 'name');

    res.json({
      success: true,
      message: hasUpvoted ? 'Upvote removed' : 'Issue upvoted',
      data: { issue }
    });

  } catch (error) {
    console.error('Upvote issue error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error during upvote'
    });
  }
});

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
router.post('/:id/comments', async (req, res) => {
  try {
    const { content, isInternal = false } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Comment content is required'
      });
    }

    // Verify issue exists in current community
    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Only admins can post internal comments
    const canPostInternal = ['super_admin', 'community_admin'].includes(req.user.role);

    // Create comment
    const comment = new Comment({
      content: content.trim(),
      issue: issue._id,
      author: req.user._id,
      community: req.communityId,
      isInternal: isInternal && canPostInternal
    });

    await comment.save();
    await comment.populate('author', 'name email avatar role');

    console.log(`💬 Comment added to issue "${issue.title}" by ${req.user.name}`);

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while adding comment'
    });
  }
});

// @desc    Get comments for an issue
// @route   GET /api/issues/:id/comments
// @access  Private
router.get('/:id/comments', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    // Verify issue exists in current community
    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: 'Issue not found'
      });
    }

    // Build filter - residents can't see internal comments
    const filter = { issue: issue._id };
    if (!['super_admin', 'community_admin'].includes(req.user.role)) {
      filter.isInternal = false;
    }

    const comments = await Comment.find(filter)
      .populate('author', 'name email avatar role')
      .sort({ createdAt: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments(filter);

    res.json({
      success: true,
      data: {
        comments,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total
      }
    });

  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching comments'
    });
  }
});

// @desc    Get issue statistics for current community
// @route   GET /api/issues/stats/overview
// @access  Private
router.get('/stats/overview', async (req, res) => {
  try {
    const stats = await Issue.aggregate([
      { $match: { community: req.communityId } },
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          openIssues: {
            $sum: { $cond: [{ $in: ['$status', ['open', 'acknowledged', 'in_progress']] }, 1, 0] }
          },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
          },
          highPriorityIssues: {
            $sum: { $cond: [{ $in: ['$urgency', ['high', 'critical']] }, 1, 0] }
          },
          totalUpvotes: { $sum: '$upvoteCount' }
        }
      }
    ]);

    const categoryStats = await Issue.aggregate([
      { $match: { community: req.communityId } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          upvotes: { $sum: '$upvoteCount' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const defaultStats = {
      totalIssues: 0,
      openIssues: 0,
      resolvedIssues: 0,
      highPriorityIssues: 0,
      totalUpvotes: 0
    };

    res.json({
      success: true,
      data: {
        overview: stats.length > 0 ? stats[0] : defaultStats,
        categories: categoryStats
      }
    });

  } catch (error) {
    console.error('Get issue stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error while fetching statistics'
    });
  }
});

module.exports = router;