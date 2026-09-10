const mongoose = require("mongoose");
const dotenv = require("dotenv");
const axios = require("axios");
const jwt = require("jsonwebtoken");

dotenv.config();

const API_BASE = process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 8000}/api`;

const debugAuth = async () => {
  try {
    console.log("🔐 Debugging Authentication Issue\n");

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    // Test 1: Check if server is running
    console.log("\n1. Testing server health...");
    try {
      const healthResponse = await axios.get(`${API_BASE}/health`);
      console.log("   ✅ Server is running:", healthResponse.data.message);
    } catch (error) {
      console.log("   ❌ Server is not responding");
      return;
    }

    // Test 2: Try to verify the hardcoded token
    console.log("\n2. Analyzing JWT token...");
    const hardcodedToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGZmNWI4Nzk3YzQzNmRiOTAwYTJlOGEiLCJpYXQiOjE3NjE1NjU1ODgsImV4cCI6MTc2MjE3MDM4OH0.WdZNeKVBqFzmQgY9cGcUCLDRVupvQWSFQBo5DL39KuQ";

    try {
      const decoded = jwt.verify(hardcodedToken, process.env.JWT_SECRET);
      console.log("   ✅ Token is valid and not expired");
      console.log("   👤 User ID:", decoded.userId);
      console.log("   📅 Issued at:", new Date(decoded.iat * 1000));
      console.log("   📅 Expires at:", new Date(decoded.exp * 1000));
    } catch (error) {
      console.log("   ❌ Token verification failed:", error.message);
    }

    // Test 3: Try to use the token to access a protected endpoint
    console.log("\n3. Testing token with protected endpoint...");
    try {
      const meResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${hardcodedToken}`,
        },
      });
      console.log("   ✅ Token works with /auth/me");
      console.log("   👤 User:", meResponse.data.data.user.name);
    } catch (error) {
      console.log(
        "   ❌ Token failed with /auth/me:",
        error.response?.data?.error || error.message,
      );
    }

    // Test 4: Try with community context
    console.log("\n4. Testing token with community context...");
    try {
      const communityResponse = await axios.get(`${API_BASE}/communities/current`, {
        headers: {
          Authorization: `Bearer ${hardcodedToken}`,
          "x-community-subdomain": "sunrise",
        },
      });
      console.log("   ✅ Token works with community context");
      console.log("   🏢 Community:", communityResponse.data.data.community.name);
    } catch (error) {
      console.log(
        "   ❌ Token failed with community context:",
        error.response?.data?.error || error.message,
      );
    }

    // Test 5: Create a new test user and get fresh token
    console.log("\n5. Creating new test user...");
    try {
      const registerResponse = await axios.post(`${API_BASE}/auth/register`, {
        name: "Debug Test User",
        email: "debug@test.com",
        password: "password123",
        role: "resident",
        communitySubdomain: "sunrise",
        apartmentNumber: "999",
      });
      console.log("   ✅ New user created");
      const newToken = registerResponse.data.data.token;
      console.log("   🔑 New token:", newToken.substring(0, 50) + "...");

      // Test the new token
      const testResponse = await axios.get(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      console.log("   ✅ New token works");
      return newToken;
    } catch (error) {
      console.log("   ❌ Failed to create new user:", error.response?.data?.error || error.message);
    }
  } catch (error) {
    console.error("❌ Debug failed:", error.message);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Database connection closed");
  }
};

debugAuth();
