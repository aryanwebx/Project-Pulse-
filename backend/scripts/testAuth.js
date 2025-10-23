const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Community = require('../models/Community');

// Load environment variables
dotenv.config();

const testAuthentication = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for authentication testing');

    // Clear existing test data
    await User.deleteMany({ email: /test/ });
    await Community.deleteMany({ subdomain: /test/ });
    console.log('🧹 Cleared existing test data');

    // Create a test community
    const community = new Community({
      name: 'Green Valley Apartments',
      subdomain: 'greenvalley',
      contactEmail: 'admin@greenvalley.com',
      description: 'A beautiful apartment community',
      createdBy: new mongoose.Types.ObjectId()
    });

    await community.save();
    console.log('✅ Test community created:', community.name);

    // Create test users with different roles
    const testUsers = [
      {
        name: 'Super Admin User',
        email: 'superadmin@test.com',
        password: 'password123',
        role: 'super_admin'
      },
      {
        name: 'Community Admin User',
        email: 'admin@test.com',
        password: 'password123',
        role: 'community_admin',
        community: community._id,
        apartmentNumber: 'Office'
      },
      {
        name: 'Resident User',
        email: 'resident@test.com',
        password: 'password123',
        role: 'resident',
        community: community._id,
        apartmentNumber: '101'
      }
    ];

    for (const userData of testUsers) {
      const user = new User(userData);
      await user.save();
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('\n🎉 Authentication test data created successfully!');
    console.log('\n📋 Test Users:');
    console.log('   - Super Admin: superadmin@test.com / password123');
    console.log('   - Community Admin: admin@test.com / password123');
    console.log('   - Resident: resident@test.com / password123');
    console.log('\n🌐 Community: greenvalley');
    console.log('\n🚀 You can now test the authentication endpoints with Postman');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testAuthentication();