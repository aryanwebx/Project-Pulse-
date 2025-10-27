// const mongoose = require('mongoose');
// const dotenv = require('dotenv');
// const axios = require('axios');
// const FormData = require('form-data');

// // Load environment variables
// dotenv.config();

// const API_BASE = 'http://localhost:5000/api';

// const createTestImage = () => {
//   // Create a simple red dot PNG (1x1 pixel)
//   const base64Image =
//     'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+osGZAAAAAElFTkSuQmCC';
//   return Buffer.from(base64Image, 'base64');
// };

// const testImageUpload = async () => {
//   try {
//     console.log('🖼️ Testing Image Upload Functionality\n');

//     // Check Cloudinary configuration using the new config
//     const { getCloudinaryConfig, configureCloudinary } = require('../config/cloudinary');
    
//     // Configure Cloudinary
//     const configured = configureCloudinary();
//     if (!configured) {
//       console.log('❌ Cloudinary not configured. Please set up Cloudinary first.');
//       console.log('📝 Instructions:');
//       console.log('   1. Go to https://cloudinary.com/');
//       console.log('   2. Sign up for free account');
//       console.log('   3. Copy your CLOUDINARY_URL from dashboard');
//       console.log('   4. Update your .env file with the CLOUDINARY_URL');
//       console.log('   Format: CLOUDINARY_URL=cloudinary://API_KEY:API_SECRET@CLOUD_NAME');
//       return;
//     }

//     const config = getCloudinaryConfig();
//     console.log('✅ Cloudinary configured');
//     console.log('   Cloud Name:', config.cloud_name);

//     // Connect to MongoDB
//     await mongoose.connect(process.env.MONGODB_URI);
//     console.log('✅ Connected to MongoDB');

//     // Get auth token
//     const token = await getAuthToken();
//     if (!token) {
//       console.log('❌ Failed to get authentication token');
//       return;
//     }

//     console.log('✅ Authentication token obtained');

//     // Test 1: Single Image Upload
//     await testSingleImageUpload(token);

//     // Test 2: Multiple Images Upload
//     await testMultipleImagesUpload(token);

//     // Test 3: Create Issue with Images
//     await testIssueWithImages(token);

//     // Test 4: Image Deletion
//     await testImageDeletion(token);

//     console.log('\n🎉 ==================================');
//     console.log('✅ ALL IMAGE UPLOAD TESTS PASSED!');
//     console.log('===================================');
//     console.log('📋 Test Summary:');
//     console.log('   - Single image upload: ✅');
//     console.log('   - Multiple images upload: ✅');
//     console.log('   - Issue creation with images: ✅');
//     console.log('   - Image deletion: ✅');
//     console.log('===================================\n');

//   } catch (error) {
//     console.error('\n❌ Image upload test failed:', error.message);
//     console.error('Error details:', error.response?.data || error.message);
//   } finally {
//     await mongoose.connection.close();
//     console.log('🔌 Database connection closed');
//     process.exit(0);
//   }
// };

// const getAuthToken = async () => {
//   try {
//     // Try to login with existing test user
//     const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
//       email: 'joe@test.com',
//       password: 'password123'
//     });
//     return loginResponse.data.data.token;
//   } catch (error) {
//     console.log('⚠️ Test user not found, creating new test data...');
    
//     // Create test data
//     try {
//       // Create super admin first
//       const superAdminResponse = await axios.post(`${API_BASE}/auth/register`, {
//         name: 'Image Test Super Admin',
//         email: 'imagetest-super@test.com',
//         password: 'password123',
//         role: 'super_admin'
//       });

//       const superAdminToken = superAdminResponse.data.data.token;

//       // Create community
//       const communityResponse = await axios.post(`${API_BASE}/communities`, {
//         name: 'Image Test Community',
//         subdomain: 'image-test',
//         contactEmail: 'admin@imagetest.com',
//         description: 'Community for image upload testing'
//       }, {
//         headers: { Authorization: `Bearer ${superAdminToken}` }
//       });

//       // Create resident user
//       const residentResponse = await axios.post(`${API_BASE}/auth/register`, {
//         name: 'Image Test Resident',
//         email: 'resident@imagetest.com',
//         password: 'password123',
//         role: 'resident',
//         communitySubdomain: 'image-test',
//         apartmentNumber: '101'
//       });

//       return residentResponse.data.data.token;

//     } catch (setupError) {
//       console.error('❌ Failed to create test data:', setupError.response?.data || setupError.message);
//       return null;
//     }
//   }
// };

// const testSingleImageUpload = async (token) => {
//   console.log('\n1. Testing Single Image Upload...');

//   const formData = new FormData();
//   const testImageBuffer = createTestImage();
  
//   // Create a fake file-like object for FormData
//   formData.append('image', testImageBuffer, {
//     filename: 'test-image.png',
//     contentType: 'image/png'
//   });

//   try {
//     const response = await axios.post(`${API_BASE}/upload/image`, formData, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'x-community-subdomain': 'sunrise', // Use existing community
//         ...formData.getHeaders()
//       },
//       timeout: 30000 // 30 seconds timeout for upload
//     });

//     if (response.data.success) {
//       console.log('   ✅ Single image upload successful');
//       console.log('   📁 Image URL:', response.data.data.image.url);
//       console.log('   🆔 Public ID:', response.data.data.image.publicId);
//       return response.data.data.image;
//     } else {
//       throw new Error('Single image upload failed: ' + response.data.error);
//     }
//   } catch (error) {
//     console.error('   ❌ Upload error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// const testMultipleImagesUpload = async (token) => {
//   console.log('\n2. Testing Multiple Images Upload...');

//   const formData = new FormData();
//   const testImageBuffer = createTestImage();
  
//   // Add multiple test images
//   for (let i = 1; i <= 3; i++) {
//     formData.append('images', testImageBuffer, {
//       filename: `test-image-${i}.png`,
//       contentType: 'image/png'
//     });
//   }

//   try {
//     const response = await axios.post(`${API_BASE}/upload/images`, formData, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'x-community-subdomain': 'sunrise',
//         ...formData.getHeaders()
//       },
//       timeout: 30000
//     });

//     if (response.data.success) {
//       console.log('   ✅ Multiple images upload successful');
//       console.log('   📁 Uploaded images:', response.data.data.images.length);
//       response.data.data.images.forEach((img, index) => {
//         console.log(`      ${index + 1}. ${img.publicId}`);
//       });
//       return response.data.data.images;
//     } else {
//       throw new Error('Multiple images upload failed: ' + response.data.error);
//     }
//   } catch (error) {
//     console.error('   ❌ Multiple upload error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// const testIssueWithImages = async (token) => {
//   console.log('\n3. Testing Issue Creation with Images...');

//   // First upload an image
//   const formData = new FormData();
//   const testImageBuffer = createTestImage();
  
//   formData.append('image', testImageBuffer, {
//     filename: 'issue-image.png',
//     contentType: 'image/png'
//   });

//   try {
//     const uploadResponse = await axios.post(`${API_BASE}/upload/image`, formData, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'x-community-subdomain': 'sunrise',
//         ...formData.getHeaders()
//       },
//       timeout: 30000
//     });

//     const uploadedImage = uploadResponse.data.data.image;

//     // Create issue with the uploaded image
//     const issueResponse = await axios.post(`${API_BASE}/issues`, {
//       title: 'Test Issue with Image - Broken Water Pipe',
//       description: 'This issue includes an uploaded image showing the broken water pipe in the basement. Water is leaking and causing damage.',
//       category: 'Plumbing',
//       urgency: 'critical',
//       location: 'Building A Basement',
//       images: [uploadedImage],
//       tags: ['water', 'pipe', 'leak', 'urgent', 'basement']
//     }, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'x-community-subdomain': 'sunrise',
//         'Content-Type': 'application/json'
//       }
//     });

//     if (issueResponse.data.success) {
//       console.log('   ✅ Issue created with image successfully');
//       console.log('   📋 Issue Title:', issueResponse.data.data.issue.title);
//       console.log('   🖼️  Attached Images:', issueResponse.data.data.issue.images.length);
//       console.log('   🔗 Image URL:', issueResponse.data.data.issue.images[0].url);
//       return { issue: issueResponse.data.data.issue, image: uploadedImage };
//     } else {
//       throw new Error('Issue creation with image failed: ' + issueResponse.data.error);
//     }
//   } catch (error) {
//     console.error('   ❌ Issue creation error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// const testImageDeletion = async (token) => {
//   console.log('\n4. Testing Image Deletion...');

//   // First upload an image to delete
//   const formData = new FormData();
//   const testImageBuffer = createTestImage();
  
//   formData.append('image', testImageBuffer, {
//     filename: 'delete-test.png',
//     contentType: 'image/png'
//   });

//   try {
//     const uploadResponse = await axios.post(`${API_BASE}/upload/image`, formData, {
//       headers: {
//         'Authorization': `Bearer ${token}`,
//         'x-community-subdomain': 'sunrise',
//         ...formData.getHeaders()
//       },
//       timeout: 30000
//     });

//     const uploadedImage = uploadResponse.data.data.image;

//     // Delete the image
//     const deleteResponse = await axios.delete(
//       `${API_BASE}/upload/image/${uploadedImage.publicId}`,
//       {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'x-community-subdomain': 'sunrise'
//         }
//       }
//     );

//     if (deleteResponse.data.success) {
//       console.log('   ✅ Image deletion successful');
//       console.log('   🗑️  Deleted image:', uploadedImage.publicId);
//     } else {
//       throw new Error('Image deletion failed: ' + deleteResponse.data.error);
//     }
//   } catch (error) {
//     console.error('   ❌ Image deletion error:', error.response?.data || error.message);
//     throw error;
//   }
// };

// // Run the test
// testImageUpload();



const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');
const FormData = require('form-data');

dotenv.config();

const API_BASE = 'http://localhost:5000/api';

const createTestImage = () => {
  const base64Image =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2P4//8/AwAI/AL+osGZAAAAAElFTkSuQmCC';
  return Buffer.from(base64Image, 'base64');
};

const testFreshUpload = async () => {
  try {
    console.log('🖼️ Fresh Image Upload Test\n');

    // Configure Cloudinary
    const { configureCloudinary, getCloudinaryConfig } = require('../config/cloudinary');
    configureCloudinary();
    
    const config = getCloudinaryConfig();
    console.log('✅ Cloudinary configured:', config.cloud_name);

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Create a fresh user
    console.log('\n1. Creating fresh test user...');
    const userData = {
      name: 'Fresh Test User',
      email: `fresh-${Date.now()}@test.com`,
      password: 'password123',
      role: 'resident',
      communitySubdomain: 'sunrise',
      apartmentNumber: '999'
    };

    const registerResponse = await axios.post(`${API_BASE}/auth/register`, userData);
    const token = registerResponse.data.data.token;
    console.log('   ✅ User created:', userData.email);
    console.log('   🔑 Token obtained');

    // Step 2: Verify the token works
    console.log('\n2. Verifying token...');
    const meResponse = await axios.get(`${API_BASE}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('   ✅ Token verified');
    console.log('   👤 User:', meResponse.data.data.user.name);

    // Step 3: Test single image upload
    console.log('\n3. Testing image upload...');
    
    const formData = new FormData();
    const testImageBuffer = createTestImage();
    
    formData.append('image', testImageBuffer, {
      filename: 'fresh-test.png',
      contentType: 'image/png'
    });

    const uploadResponse = await axios.post(`${API_BASE}/upload/image`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'x-community-subdomain': 'sunrise',
        ...formData.getHeaders()
      },
      timeout: 30000
    });

    if (uploadResponse.data.success) {
      console.log('   ✅ Image upload successful!');
      console.log('   📁 URL:', uploadResponse.data.data.image.url);
      console.log('   🆔 Public ID:', uploadResponse.data.data.image.publicId);
      console.log(uploadResponse.data.data)
      // Step 4: Test image deletion
      console.log('\n4. Testing image deletion...');
      await axios.delete(
        `${API_BASE}/upload/image/${encodeURIComponent(uploadResponse.data.data.image.publicId)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-community-subdomain': 'sunrise'
          }
        }
      );
      console.log('   ✅ Image deletion successful');

      console.log('\n🎉 Fresh test completed successfully!');
    }

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error('   Error:', error.response?.data?.error || error.message);
    
    if (error.response?.data?.error) {
      console.error('   Server error details:', error.response.data.error);
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

testFreshUpload();