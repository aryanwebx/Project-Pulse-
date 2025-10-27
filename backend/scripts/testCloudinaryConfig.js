const {
  configureCloudinary,
  testCloudinaryConnection,
  getCloudinaryConfig,
} = require("../config/cloudinary");

const testCloudinaryConfig = async () => {
  console.log("🔧 Testing Cloudinary Configuration\n");

  // Configure Cloudinary
  const configured = configureCloudinary();

  if (!configured) {
    console.log("❌ Cloudinary configuration failed");
    return;
  }

  // Test connection
  console.log("\n🧪 Testing Cloudinary connection...");
  const connectionTest = await testCloudinaryConnection();

  if (connectionTest.success) {
    console.log("✅ Cloudinary connection successful");
    console.log("   Status:", connectionTest.status);
    console.log("   Service:", connectionTest.service);
  } else {
    console.log("❌ Cloudinary connection failed:", connectionTest.error);
    return;
  }

  // Display configuration (safely)
  console.log("\n⚙️  Cloudinary Configuration:");
  const config = getCloudinaryConfig();
  console.log("   Cloud Name:", config.cloud_name);
  console.log("   API Key:", config.api_key);
  console.log("   Secure:", config.secure);

  console.log("\n🎉 Cloudinary configuration test completed successfully!");
};

testCloudinaryConfig();
