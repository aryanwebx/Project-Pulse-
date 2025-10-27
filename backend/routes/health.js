const express = require('express');
const { testCloudinaryConnection, getCloudinaryConfig } = require('../config/cloudinary');

const router = express.Router();

// @desc    Health check with Cloudinary status
// @route   GET /api/health/cloudinary
// @access  Public
router.get('/cloudinary', async (req, res) => {
  try {
    const cloudinaryConfig = getCloudinaryConfig();
    const cloudinaryTest = await testCloudinaryConnection();

    res.json({
      success: true,
      message: 'Cloudinary Health Check',
      data: {
        cloudinary: {
          configured: cloudinaryConfig.cloud_name !== undefined,
          config: cloudinaryConfig,
          connection: cloudinaryTest
        },
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Cloudinary health check error:', error);
    res.status(500).json({
      success: false,
      error: 'Cloudinary health check failed'
    });
  }
});

module.exports = router;