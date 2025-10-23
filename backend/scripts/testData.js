const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Community = require('../models/Community');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

// Load environment variables
dotenv.config();

const testModels = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for testing');

    // Clear existing test data
    await User.deleteMany({ email: /test/ });
    await Community.deleteMany({ subdomain: /test/ });
    await Issue.deleteMany({ title: /test/ });
    await Comment.deleteMany({});
    console.log('🧹 Cleared existing test data');

    // Create a test community
    const community = new Community({
      name: 'Test Community',
      subdomain: 'test-community',
      contactEmail: 'admin@testcommunity.com',
      description: 'A test community for development',
      createdBy: new mongoose.Types.ObjectId() // Mock user ID for now
    });

    await community.save();
    console.log('✅ Test community created:', community.name);

    // Create a test user
    const user = new User({
      name: 'Test User',
      email: 'testuser@example.com',
      password: 'password123',
      role: 'resident',
      community: community._id,
      apartmentNumber: '101'
    });

    await user.save();
    console.log('✅ Test user created:', user.email);

    // Create test issues
    const issues = [
      {
        title: 'Test Plumbing Issue - Leaking faucet',
        description: 'The kitchen faucet is leaking continuously and needs repair.',
        category: 'Plumbing',
        urgency: 'high',
        location: 'Building A, Apartment 101',
        createdBy: user._id,
        community: community._id,
        tags: ['kitchen', 'faucet', 'leak']
      },
      {
        title: 'Test Electrical Issue - Power outage',
        description: 'No power in the living room sockets since this morning.',
        category: 'Electrical',
        urgency: 'medium',
        location: 'Building B, Common Area',
        createdBy: user._id,
        community: community._id,
        tags: ['electricity', 'sockets', 'outage']
      },
      {
        title: 'Test Security Concern - Broken gate',
        description: 'Main entrance gate is broken and not closing properly.',
        category: 'Security',
        urgency: 'critical',
        location: 'Main Entrance',
        createdBy: user._id,
        community: community._id,
        tags: ['gate', 'security', 'entrance']
      }
    ];

    const createdIssues = await Issue.insertMany(issues);
    console.log(`✅ Created ${createdIssues.length} test issues`);

    // Create test comments
    const comments = [
      {
        content: 'Thanks for reporting this issue. We will look into it soon.',
        issue: createdIssues[0]._id,
        author: user._id,
        community: community._id
      },
      {
        content: 'The maintenance team has been notified.',
        issue: createdIssues[0]._id,
        author: user._id,
        community: community._id,
        isAdminUpdate: true
      }
    ];

    const createdComments = await Comment.insertMany(comments);
    console.log(`✅ Created ${createdComments.length} test comments`);

    // Test relationships by populating data
    console.log('\n📊 Testing Model Relationships:');
    
    const populatedIssue = await Issue.findById(createdIssues[0]._id)
      .populate('createdBy', 'name email apartmentNumber')
      .populate('community', 'name subdomain')
      .populate('upvotes', 'name');

    console.log('✅ Issue with populated relationships:', {
      title: populatedIssue.title,
      createdBy: populatedIssue.createdBy.name,
      community: populatedIssue.community.name,
      upvoteCount: populatedIssue.upvoteCount
    });

    console.log('\n🎉 All models and relationships are working correctly!');
    console.log('\n📝 Sample Data Created:');
    console.log(`   - Communities: 1`);
    console.log(`   - Users: 1`);
    console.log(`   - Issues: ${createdIssues.length}`);
    console.log(`   - Comments: ${createdComments.length}`);

  } catch (error) {
    console.error('❌ Error testing models:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testModels();