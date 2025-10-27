const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { identifyTenant } = require('../middleware/tenant');
const {
  uploadImage,
  uploadMultipleImages,
  deleteImage
} = require('../config/cloudinary');

const router = express.Router();

// Configure Multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check if file is an image
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
});

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private
router.post('/image', auth, identifyTenant, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Please select an image to upload'
      });
    }

    // Create folder path based on community
    const folder = `project-pulse/${req.community.subdomain}/issues`;

    // Upload image using cloudinary config
    const result = await uploadImage(req.file.buffer, req.file.mimetype, folder);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    console.log(`🖼️ Image uploaded to Cloudinary: ${result.image.publicId}`);

    res.json({
      success: true,
      message: 'Image uploaded successfully',
      data: {
        image: result.image
      }
    });

  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload image'
    });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/images
// @access  Private
router.post('/images', auth, identifyTenant, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select images to upload'
      });
    }

    if (req.files.length > 5) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 5 images allowed'
      });
    }

    // Create folder path based on community
    const folder = `project-pulse/${req.community.subdomain}/issues`;

    // Upload multiple images using cloudinary config
    const result = await uploadMultipleImages(req.files, folder);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    console.log(`🖼️ ${result.images.length} images uploaded to Cloudinary`);

    res.json({
      success: true,
      message: `${result.images.length} images uploaded successfully`,
      data: { images: result.images }
    });

  } catch (error) {
    console.error('Multiple image upload error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload images'
    });
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private
router.delete('/image/:publicId', auth, identifyTenant, async (req, res) => {
  try {
    const { publicId } = req.params;

    const result = await deleteImage(publicId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error
      });
    }

    console.log(`🗑️ Image deleted from Cloudinary: ${publicId}`);
    
    res.json({
      success: true,
      message: result.message
    });

  } catch (error) {
    console.error('Image deletion error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete image'
    });
  }
});

// @desc    Get Cloudinary status
// @route   GET /api/upload/status
// @access  Private
router.get('/status', auth, async (req, res) => {
  try {
    const { getCloudinaryConfig, testCloudinaryConnection } = require('../config/cloudinary');
    
    const config = getCloudinaryConfig();
    const connectionTest = await testCloudinaryConnection();

    res.json({
      success: true,
      data: {
        configured: connectionTest.success,
        config: config,
        connection: connectionTest
      }
    });

  } catch (error) {
    console.error('Cloudinary status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get Cloudinary status'
    });
  }
});

module.exports = router;