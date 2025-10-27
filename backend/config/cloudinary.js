const cloudinary = require('cloudinary').v2;
require('dotenv').config({ path: './.env' }); 

/**
 * Configure Cloudinary with environment variables
 * Supports both CLOUDINARY_URL and individual environment variables
 */
const configureCloudinary = () => {
  try {
    // Method 1: Use CLOUDINARY_URL if provided
    if (process.env.CLOUDINARY_URL && process.env.CLOUDINARY_URL.startsWith('cloudinary://')) {
      const url = process.env.CLOUDINARY_URL;
      const matches = url.match(/cloudinary:\/\/([^:]+):([^@]+)@(.+)/);
      
      if (matches) {
        const [, api_key, api_secret, cloud_name] = matches;
        cloudinary.config({
          cloud_name,
          api_key,
          api_secret
        });
        console.log(`✅ Cloudinary configured from URL. Cloud: ${cloud_name}`);
        return true;
      } else {
        throw new Error('Invalid CLOUDINARY_URL format');
      }
    }

    // Method 2: Use individual environment variables
    else if (process.env.CLOUDINARY_CLOUD_NAME && 
             process.env.CLOUDINARY_API_KEY && 
             process.env.CLOUDINARY_API_SECRET &&
             process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloudinary_cloud_name') {
      
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
      console.log(`✅ Cloudinary configured from individual variables. Cloud: ${process.env.CLOUDINARY_CLOUD_NAME}`);
      return true;
    }

    // No configuration found
    else {
      console.log('❌ Cloudinary not configured');
      console.log('💡 Please set CLOUDINARY_URL or individual Cloudinary environment variables');
      return false;
    }

  } catch (error) {
    console.error('❌ Cloudinary configuration error:', error.message);
    return false;
  }
};

/**
 * Test Cloudinary connection
 */
const testCloudinaryConnection = async () => {
  try {
    const result = await cloudinary.api.ping();
    console.log('✅ Cloudinary connection test passed');
    return {
      success: true,
      status: result.status,
      service: result.service
    };
  } catch (error) {
    console.error('❌ Cloudinary connection test failed:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload image to Cloudinary
 */
const uploadImage = async (fileBuffer, mimetype, folder = 'project-pulse') => {
  try {
    // Convert buffer to base64 for Cloudinary
    const b64 = Buffer.from(fileBuffer).toString('base64');
    const dataURI = `data:${mimetype};base64,${b64}`;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: folder,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto' },
        { format: 'auto' }
      ]
    });

    return {
      success: true,
      image: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      }
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Upload multiple images to Cloudinary
 */
const uploadMultipleImages = async (files, folder = 'project-pulse') => {
  try {
    const uploadPromises = files.map(file => {
      const b64 = Buffer.from(file.buffer).toString('base64');
      const dataURI = `data:${file.mimetype};base64,${b64}`;

      return cloudinary.uploader.upload(dataURI, {
        folder: folder,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto' },
          { format: 'auto' }
        ]
      });
    });

    const results = await Promise.all(uploadPromises);

    const images = results.map(result => ({
      url: result.secure_url,
      publicId: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format
    }));

    return {
      success: true,
      images
    };
  } catch (error) {
    console.error('Cloudinary multiple upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete image from Cloudinary
 */
const deleteImage = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === 'ok') {
      return {
        success: true,
        message: 'Image deleted successfully'
      };
    } else {
      return {
        success: false,
        error: 'Image not found or deletion failed'
      };
    }
  } catch (error) {
    console.error('Cloudinary deletion error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Get Cloudinary configuration status
 */
const getCloudinaryConfig = () => {
  const config = cloudinary.config();
  return {
    cloud_name: config.cloud_name,
    api_key: config.api_key ? `${config.api_key.substring(0, 8)}...` : 'Not set',
    secure: config.secure || true
  };
};

module.exports = {
  configureCloudinary,
  testCloudinaryConnection,
  uploadImage,
  uploadMultipleImages,
  deleteImage,
  getCloudinaryConfig,
  cloudinary // Export the cloudinary instance for direct use if needed
};