const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Community = require('../models/Community');
const Issue = require('../models/Issue');

// Load environment variables
dotenv.config();

const testMultiTenant = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for multi-tenant testing');

    // Clear existing test data
    await User.deleteMany({ email: /test/ });
    await Community.deleteMany({ subdomain: /test/ });
    await Issue.deleteMany({ title: /test/ });
    console.log('🧹 Cleared existing test data');

    // FIRST: Create a super admin user to be the creator
    const superAdmin = new User({
      name: 'Super Admin',
      email: 'superadmin@test.com',
      password: 'password123',
      role: 'super_admin'
    });
    await superAdmin.save();
    console.log('✅ Created super admin for community creation');

    // Create multiple test communities with the super admin as creator
    const communities = [
      {
        name: 'Sunrise Apartments',
        subdomain: 'sunrise',
        contactEmail: 'admin@sunrise.com',
        description: 'Luxury apartments with great amenities',
        createdBy: superAdmin._id
      },
      {
        name: 'Oakwood Residences', 
        subdomain: 'oakwood',
        contactEmail: 'admin@oakwood.com',
        description: 'Family-friendly residential community',
        createdBy: superAdmin._id
      },
      {
        name: 'Tech Park Offices',
        subdomain: 'techpark',
        contactEmail: 'admin@techpark.com',
        description: 'Modern office spaces for tech companies',
        createdBy: superAdmin._id
      }
    ];

    const createdCommunities = await Community.insertMany(communities);
    console.log(`✅ Created ${createdCommunities.length} test communities`);

    // Create users for each community
    const users = [];
    
    for (const community of createdCommunities) {
      // Community admin
      users.push({
        name: `${community.name} Admin`,
        email: `admin@${community.subdomain}.com`,
        password: 'password123',
        role: 'community_admin',
        community: community._id,
        apartmentNumber: 'Office'
      });

      // Residents
      for (let i = 1; i <= 3; i++) {
        users.push({
          name: `Resident ${i} - ${community.name}`,
          email: `resident${i}@${community.subdomain}.com`,
          password: 'password123',
          role: 'resident',
          community: community._id,
          apartmentNumber: `${i}0${i}`
        });
      }
    }

    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} test users across communities`);

    // Create issues for each community
    const issues = [];
    const categories = ['Plumbing', 'Electrical', 'Security', 'Cleanliness', 'Parking'];
    const statuses = ['open', 'acknowledged', 'in_progress', 'resolved'];
    const urgencies = ['low', 'medium', 'high', 'critical'];

    for (const community of createdCommunities) {
      const communityUsers = createdUsers.filter(user => 
        user.community.toString() === community._id.toString() && 
        user.role === 'resident'
      );

      for (let i = 1; i <= 5; i++) {
        const randomUser = communityUsers[Math.floor(Math.random() * communityUsers.length)];
        const randomCategory = categories[Math.floor(Math.random() * categories.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const randomUrgency = urgencies[Math.floor(Math.random() * urgencies.length)];

        issues.push({
          title: `${randomCategory} Issue #${i} - ${community.name}`,
          description: `This is a test ${randomCategory.toLowerCase()} issue for ${community.name}. Description of the problem that needs to be addressed.`,
          category: randomCategory,
          status: randomStatus,
          urgency: randomUrgency,
          location: `Building ${Math.floor(Math.random() * 5) + 1}, Unit ${Math.floor(Math.random() * 100) + 1}`,
          createdBy: randomUser._id,
          community: community._id,
          tags: [randomCategory.toLowerCase(), 'test', community.subdomain],
          upvoteCount: Math.floor(Math.random() * 10),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000) // Random date in last 7 days
        });
      }
    }

    const createdIssues = await Issue.insertMany(issues);
    console.log(`✅ Created ${createdIssues.length} test issues across communities`);

    // Test data isolation
    console.log('\n🔒 Testing Multi-Tenant Data Isolation:');
    
    for (const community of createdCommunities) {
      const communityUsers = await User.countDocuments({ community: community._id });
      const communityIssues = await Issue.countDocuments({ community: community._id });
      
      console.log(`\n🏢 ${community.name} (${community.subdomain}):`);
      console.log(`   👥 Users: ${communityUsers}`);
      console.log(`   📋 Issues: ${communityIssues}`);
      
      // Verify no data leakage
      const otherCommunityIds = createdCommunities
        .filter(c => c._id.toString() !== community._id.toString())
        .map(c => c._id);
      
      const leakedUsers = await User.countDocuments({
        community: { $in: otherCommunityIds },
        email: { $regex: community.subdomain, $options: 'i' }
      });
      
      const leakedIssues = await Issue.countDocuments({
        community: { $in: otherCommunityIds },
        title: { $regex: community.name, $options: 'i' }
      });
      
      console.log(`   🔍 Data leakage check:`);
      console.log(`      - Users leaked: ${leakedUsers}`);
      console.log(`      - Issues leaked: ${leakedIssues}`);
      
      if (leakedUsers === 0 && leakedIssues === 0) {
        console.log(`   ✅ Data isolation verified for ${community.name}`);
      } else {
        console.log(`   ❌ Data isolation FAILED for ${community.name}`);
      }
    }

    // Test super admin access
    console.log('\n👑 Testing Super Admin Access:');
    const totalUsers = await User.countDocuments();
    const totalIssues = await Issue.countDocuments();
    const totalCommunities = await Community.countDocuments();
    
    console.log(`   📊 Platform Totals:`);
    console.log(`      - Communities: ${totalCommunities}`);
    console.log(`      - Users: ${totalUsers}`);
    console.log(`      - Issues: ${totalIssues}`);
    
    console.log('\n🎉 Multi-tenant architecture test completed!');
    console.log('\n📋 Test Data Summary:');
    console.log(`   - Communities: ${createdCommunities.length}`);
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Issues: ${createdIssues.length}`);
    console.log('\n🚀 You can now test the multi-tenant endpoints with Postman');

  } catch (error) {
    console.error('❌ Error in multi-tenant test:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testMultiTenant();