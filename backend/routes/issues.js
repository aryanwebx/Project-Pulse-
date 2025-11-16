const express = require("express");
const Issue = require("../models/Issue");
const Comment = require("../models/Comment");
const { auth, requireCommunityAdmin } = require("../middleware/auth");
const { identifyTenant } = require("../middleware/tenant");
const multer = require("multer");
const { uploadMultipleImages } = require("../config/cloudinary");

// --- Import all required services ---
const { analyzeIssue, generateAiReply } = require("../services/aiService");
const { createNotification } = require('../services/notificationService');
const { getIO } = require('../socket'); // Use getIO, not app.get('io')
// ------------------------------------

const router = express.Router();

// All routes require auth and tenant context
router.use(auth, identifyTenant);

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

// @desc    Get all issues for current community
// @route   GET /api/issues
// @access  Private
router.get("/", async (req, res) => {
  try {
    const {
      status,
      category,
      urgency,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 20,
      search = "",
    } = req.query;

    const filter = { community: req.communityId };

    if (status && status !== "all") filter.status = status;
    if (category && category !== "all") filter.category = category;
    if (urgency && urgency !== "all") filter.urgency = urgency;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const sortOptions = {};
    if (sortBy === "upvotes") {
      sortOptions.upvoteCount = sortOrder === "desc" ? -1 : 1;
    } else {
      sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;
    }

    const issuesDocs = await Issue.find(filter)
      .populate("createdBy", "name email apartmentNumber avatar")
      .populate("assignedTo", "name email")
      .sort(sortOptions)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Issue.countDocuments(filter);

    const userId = req.user._id;
    const issues = issuesDocs.map((doc) => {
      const issue = doc.toObject();
      issue.hasCurrentUserUpvoted = issue.upvotes.some((upvoteId) =>
        upvoteId.equals(userId)
      );
      return issue;
    });

    res.json({
      success: true,
      data: {
        issues,
        totalPages: Math.ceil(total / limit),
        currentPage: parseInt(page),
        total,
      },
    });
  } catch (error) {
    console.error("Get issues error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching issues",
    });
  }
});

// @desc    Get a single issue
// @route   GET /api/issues/:id
// @access  Private
router.get("/:id", async (req, res) => {
  try {
    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId,
    })
      .populate("createdBy", "name email apartmentNumber avatar")
      .populate("assignedTo", "name email avatar")
      .populate("upvotes", "name email")
      .populate({
        path: "comments",
        populate: {
          path: "author",
          select: "name email avatar role",
        },
        options: { sort: { createdAt: 1 } },
      });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: "Issue not found",
      });
    }

    const issueObject = issue.toObject();
    const userId = req.user._id;
    issueObject.hasCurrentUserUpvoted = issue.upvotes.some((user) =>
      user._id.equals(userId)
    );

    res.json({
      success: true,
      data: { issue: issueObject },
    });
  } catch (error) {
    console.error("Get issue error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching issue",
    });
  }
});

// @desc    Create a new issue
// @route   POST /api/issues
// @access  Private
router.post("/", upload.array("images", 5), async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      urgency = "medium",
      location,
      tags = [],
    } = req.body;

    let uploadedImages = [];

    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        error: "Please provide title, description, and category",
      });
    }

    const allowedCategories = req.community.settings.categories || [
      "Plumbing",
      "Electrical",
      "Security",
      "Cleanliness",
      "Parking",
      "Other",
    ];

    if (!allowedCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        error: `Invalid category. Allowed categories: ${allowedCategories.join(
          ", "
        )}`,
      });
    }

    if (req.files && req.files.length > 0) {
      const folder = `project-pulse/${req.community.subdomain}/issues`;
      const result = await uploadMultipleImages(req.files, folder);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error || "Failed to upload images",
        });
      }
      uploadedImages = result.images.map((img) => ({
        url: img.url,
        publicId: img.publicId,
      }));
    }

    // *** FIX: Wrap AI call in its own try/catch block ***
    let aiData = null;
    try {
      if (req.community.settings.aiFeatures) {
        console.log("AI analysis enabled, attempting to analyze issue...");
        aiData = await analyzeIssue(title, description, allowedCategories);
      } else {
        console.log("AI analysis disabled for this community.");
      }
    } catch (aiError) {
      console.error(
        "AI analysis failed, but proceeding with issue creation:",
        aiError.message
      );
      // We explicitly set aiData to null and continue
    }
    // *** END FIX ***

    const issue = new Issue({
      title: title.trim(),
      description: description.trim(),
      category,
      urgency,
      location: location ? location.trim() : "",
      images: uploadedImages,
      tags: Array.isArray(tags)
        ? tags.map((tag) => tag.trim())
        : tags
        ? [tags.trim()]
        : [],
      createdBy: req.user._id,
      community: req.communityId,
      aiAnalysis: aiData
        ? {
            predictedCategory: aiData.predictedCategory,
            confidence: aiData.predictedCategory === category ? 0.9 : 0.6,
            sentiment: aiData.sentiment,
            summary: aiData.summary,
            suggestedTags: aiData.suggestedTags,
            analyzedAt: new Date(),
          }
        : null,
    });

    await issue.save();
    await issue.populate("createdBy", "name email apartmentNumber avatar");

    console.log(
      `New issue created (AI: ${aiData ? 'success' : 'skipped/failed'}) with ${issue.images.length} images: "${issue.title}" by ${req.user.name} in ${req.community.name}`
    );

    const issueObject = issue.toObject();
    issueObject.hasCurrentUserUpvoted = false;

    // *** ADDED: Emit socket event for new issue ***
    const io = getIO();
    io.to(req.communityId.toString()).emit("issue:new", issueObject);
    console.log(`Socket: Emitted 'issue:new' to room ${req.communityId}`);

    res.status(201).json({
      success: true,
      message: "Issue created successfully",
      data: { issue: issueObject },
    });
  } catch (error) {
    console.error("Create issue error:", error);
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: errors.join(", "),
      });
    }
    res.status(500).json({
      success: false,
      error: "Server error during issue creation",
    });
  }
});

// @desc    Generate AI-assisted reply for an issue (Admin only)
// @route   POST /api/issues/:id/ai-reply
// @access  Private (Community Admin or Super Admin)
router.post("/:id/ai-reply", requireCommunityAdmin, async (req, res) => {
  try {
    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId,
    }).select("title description category status");

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: "Issue not found",
      });
    }

    const aiData = await generateAiReply(issue);

    if (!aiData || !aiData.suggestedReply) {
      throw new Error("AI failed to generate a valid reply.");
    }

    res.json({
      success: true,
      message: "AI reply generated successfully.",
      data: {
        suggestedReply: aiData.suggestedReply,
      },
    });
  } catch (error) {
    console.error("AI reply generation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Server error generating AI reply",
    });
  }
});

// @desc    Update issue status (Admin only)
// @route   PUT /api/issues/:id/status
// @access  Private (Community Admin or Super Admin)
router.put("/:id/status", requireCommunityAdmin, async (req, res) => {
  try {
    const { status, assignedTo, adminNotes } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: "Status is required" });
    }
    const validStatuses = ["open", "acknowledged", "in_progress", "resolved"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId,
    }).populate("createdBy", "name email");

    if (!issue) {
      return res.status(404).json({ success: false, error: "Issue not found" });
    }

    const oldStatus = issue.status;
    issue.status = status;
    if (assignedTo) issue.assignedTo = assignedTo;
    if (status === "resolved" && !issue.resolvedAt) {
      issue.resolvedAt = new Date();
    }

    await issue.save();

    if (adminNotes || oldStatus !== status) {
      const comment = new Comment({
        content: adminNotes || `Status changed from ${oldStatus} to ${status}.`,
        issue: issue._id,
        author: req.user._id,
        community: req.communityId,
        isAdminUpdate: true,
        statusUpdate: {
          oldStatus,
          newStatus: status,
        },
      });
      await comment.save();
    }

    console.log(
      `🔔 Issue status updated: "${issue.title}" -> ${status} by ${req.user.name}`
    );

    // --- CREATE NOTIFICATION ---
    if (issue.createdBy._id.toString() !== req.user._id.toString()) {
      createNotification(
        issue.createdBy._id,
        issue.community,
        'STATUS_UPDATE',
        `Your issue "${issue.title}" was updated to "${status}".`,
        `/app/issues/${issue._id}`,
        req.user._id
      );
    }
    // --- END NOTIFICATION ---

    // Repopulate all fields for the response
    await issue.populate([
      { path: "createdBy", select: "name email apartmentNumber avatar" },
      { path: "assignedTo", select: "name email" },
      { path: "comments", populate: { path: "author", select: "name email avatar role" } }
    ]);

    const issueObject = issue.toObject();
    const userId = req.user._id;
    issueObject.hasCurrentUserUpvoted = issue.upvotes.some((upvoteId) =>
      upvoteId.equals(userId)
    );

    const io = getIO(); // Use getIO()
    io.to(issue._id.toString()).emit("issue:update", issueObject);
    console.log(`Socket: Emitted 'issue:update' to room ${issue._id}`);

    res.json({
      success: true,
      message: "Issue status updated successfully",
      data: { issue: issueObject },
    });
  } catch (error) {
    console.error("Update issue status error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during status update",
    });
  }
});

// @desc    Upvote an issue
// @route   POST /api/issues/:id/upvote
// @access  Private
router.post("/:id/upvote", async (req, res) => {
  try {
    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId,
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: "Issue not found",
      });
    }

    const hasUpvoted = issue.upvotes.includes(req.user._id);

    if (hasUpvoted) {
      issue.upvotes.pull(req.user._id);
      console.log(
        `Upvote removed from "${issue.title}" by ${req.user.name}`
      );
    } else {
      issue.upvotes.push(req.user._id);
      console.log(`Upvote added to "${issue.title}" by ${req.user.name}`);
    }

    await issue.save();
    
    // Repopulate all fields for the response
    await issue.populate([
      { path: "createdBy", select: "name email apartmentNumber avatar" },
      { path: "assignedTo", select: "name email" },
      { path: "upvotes", select: "name" },
      { path: "comments", populate: { path: "author", select: "name email avatar role" } }
    ]);

    const issueObject = issue.toObject();
    issueObject.hasCurrentUserUpvoted = !hasUpvoted;

    const io = getIO(); // Use getIO()
    io.to(issue._id.toString()).emit("issue:update", issueObject);
    console.log(
      `Socket: Emitted 'issue:update' (from upvote) to room ${issue._id}`
    );

    res.json({
      success: true,
      message: hasUpvoted ? "Upvote removed" : "Issue upvoted",
      data: { issue: issueObject },
    });
  } catch (error) {
    console.error("Upvote issue error:", error);
    res.status(500).json({
      success: false,
      error: "Server error during upvote",
    });
  }
});

// @desc    Add comment to issue
// @route   POST /api/issues/:id/comments
// @access  Private
router.post("/:id/comments", async (req, res) => {
  try {
    const { content, isInternal = false, parentComment = null } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: "Comment content is required",
      });
    }

    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId,
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: "Issue not found",
      });
    }

    const canPostInternal = ["super_admin", "community_admin"].includes(
      req.user.role
    );

    const comment = new Comment({
      content: content.trim(),
      issue: issue._id,
      author: req.user._id,
      community: req.communityId,
      isInternal: isInternal && canPostInternal,
      parentComment: parentComment,
    });

    await comment.save();
    await comment.populate("author", "name email avatar role");

    console.log(`Comment added to issue "${issue.title}" by ${req.user.name}`);

    // --- CREATE NOTIFICATION ---
    // Notify the issue creator, ONLY if they aren't the one commenting
    if (issue.createdBy.toString() !== req.user._id.toString()) {
      createNotification(
        issue.createdBy,
        issue.community,
        'NEW_COMMENT',
        `${req.user.name} commented on your issue: "${issue.title}"`,
        `/app/issues/${issue._id}`,
        req.user._id
      );
    }
    // --- END NOTIFICATION ---

    const io = getIO(); // Use getIO()
    const populatedComment = comment.toObject();
    io.to(issue._id.toString()).emit("comment:new", populatedComment);
    console.log(`Socket: Emitted 'comment:new' to room ${issue._id}`);
    
    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: { comment: populatedComment }, // Send populated comment back
    });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while adding comment",
    });
  }
});

// @desc    Get comments for an issue
// @route   GET /api/issues/:id/comments
// @access  Private
router.get("/:id/comments", async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const issue = await Issue.findOne({
      _id: req.params.id,
      community: req.communityId,
    });

    if (!issue) {
      return res.status(404).json({
        success: false,
        error: "Issue not found",
      });
    }

    const filter = { issue: issue._id };
    if (!["super_admin", "community_admin"].includes(req.user.role)) {
      filter.isInternal = false;
    }

    const comments = await Comment.find(filter)
      .populate("author", "name email avatar role")
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
        total,
      },
    });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching comments",
    });
  }
});

// @desc    Get issue statistics for current community
// @route   GET /api/issues/stats/overview
// @access  Private
router.get("/stats/overview", async (req, res) => {
  try {
    const communityId = req.communityId;
    
    // 1. General Stats
    const statsPromise = Issue.aggregate([
      { $match: { community: communityId } },
      {
        $group: {
          _id: null,
          totalIssues: { $sum: 1 },
          openIssues: {
            $sum: {
              $cond: [
                { $in: ["$status", ["open", "acknowledged", "in_progress"]] },
                1,
                0,
              ],
            },
          },
          resolvedIssues: {
            $sum: { $cond: [{ $eq: ["$status", "resolved"] }, 1, 0] },
          },
          highPriorityIssues: {
            $sum: {
              $cond: [{ $in: ["$urgency", ["high", "critical"]] }, 1, 0],
            },
          },
          totalUpvotes: { $sum: "$upvoteCount" },
        },
      },
    ]);

    // 2. Stats by Category
    const categoryStatsPromise = Issue.aggregate([
      { $match: { community: communityId } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // 3. Stats by AI Sentiment
    const sentimentStatsPromise = Issue.aggregate([
      {
        $match: {
          community: communityId,
          "aiAnalysis.sentiment": { $ne: null },
        },
      },
      { $group: { _id: "$aiAnalysis.sentiment", count: { $sum: 1 } } },
    ]);

    // 4. Average Resolution Time
    const resolutionTimePromise = Issue.aggregate([
      {
        $match: {
          community: communityId,
          status: "resolved",
          resolvedAt: { $ne: null },
          createdAt: { $ne: null },
        },
      },
      {
        $project: {
          resolutionTimeHours: {
            $divide: [
              { $subtract: ["$resolvedAt", "$createdAt"] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          avgResolutionHours: { $avg: "$resolutionTimeHours" },
        },
      },
    ]);

    const [stats, categoryStats, sentimentStats, resolutionStats] =
      await Promise.all([
        statsPromise,
        categoryStatsPromise,
        sentimentStatsPromise,
        resolutionTimePromise,
      ]);

    const defaultStats = {
      totalIssues: 0,
      openIssues: 0,
      resolvedIssues: 0,
      highPriorityIssues: 0,
      totalUpvotes: 0,
    };

    const overview = stats.length > 0 ? stats[0] : defaultStats;
    const resolution =
      resolutionStats.length > 0
        ? resolutionStats[0]
        : { avgResolutionHours: 0 };

    res.json({
      success: true,
      data: {
        overview: { ...overview, ...resolution },
        categories: categoryStats,
        sentiments: sentimentStats,
      },
    });
  } catch (error) {
    console.error("Get issue stats error:", error);
    res.status(500).json({
      success: false,
      error: "Server error while fetching statistics",
    });
  }
});

module.exports = router;