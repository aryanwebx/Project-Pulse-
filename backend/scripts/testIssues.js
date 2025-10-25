const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Community = require('../models/Community');
const Issue = require('../models/Issue');
const Comment = require('../models/Comment');

// Load environment variables
dotenv.config();

const testIssues = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB for issue management testing');

    // Use existing test data from multi-tenant test
    const community = await Community.findOne({ subdomain: 'sunrise' });
    if (!community) {
      console.log('❌ Please run multi-tenant test first to create test data');
      return;
    }

    const adminUser = await User.findOne({ email: 'admin@sunrise.com' });
    const residentUser = await User.findOne({ email: 'resident1@sunrise.com' });

    if (!adminUser || !residentUser) {
      console.log('❌ Test users not found. Please run multi-tenant test first.');
      return;
    }

    console.log(`🏢 Testing with community: ${community.name}`);
    console.log(`👨‍💼 Admin: ${adminUser.name}`);
    console.log(`👨‍💼 Resident: ${residentUser.name}`);

    // Clear existing test issues
    await Issue.deleteMany({ title: /Test Issue/ });
    await Comment.deleteMany({});
    console.log('🧹 Cleared existing test issues and comments');

    // Test 1: Create a new issue
    console.log('\n1. Testing issue creation...');
    const newIssue = new Issue({
      title: 'Test Plumbing Issue - Kitchen Sink Leak',
      description: 'The kitchen sink is leaking water and needs immediate attention. The leak is getting worse and causing water damage.',
      category: 'Plumbing',
      urgency: 'high',
      location: 'Building A, Apartment 101',
      createdBy: residentUser._id,
      community: community._id,
      tags: ['kitchen', 'sink', 'leak', 'urgent']
    });

    await newIssue.save();
    await newIssue.populate('createdBy', 'name email apartmentNumber');
    console.log('✅ Issue created:', newIssue.title);
    console.log('   Status:', newIssue.status);
    console.log('   Urgency:', newIssue.urgency);
    console.log('   Created by:', newIssue.createdBy.name);

    // Test 2: Create multiple issues with different categories
    console.log('\n2. Creating multiple test issues...');
    const testIssues = [
      {
        title: 'Test Electrical Issue - Power Outage',
        description: 'No electricity in the living room since morning. All sockets are dead.',
        category: 'Electrical',
        urgency: 'medium',
        location: 'Building B, Apartment 205',
        createdBy: residentUser._id,
        community: community._id,
        tags: ['electricity', 'outage', 'sockets']
      },
      {
        title: 'Test Security Issue - Broken Gate',
        description: 'Main entrance gate is broken and not closing properly. Security concern.',
        category: 'Security',
        urgency: 'critical',
        location: 'Main Entrance',
        createdBy: residentUser._id,
        community: community._id,
        tags: ['gate', 'security', 'entrance']
      },
      {
        title: 'Test Cleanliness Issue - Garbage Accumulation',
        description: 'Garbage has been piling up near Building C for 3 days. Bad odor and hygiene issue.',
        category: 'Cleanliness',
        urgency: 'medium',
        location: 'Building C Area',
        createdBy: residentUser._id,
        community: community._id,
        tags: ['garbage', 'cleanliness', 'hygiene']
      }
    ];

    const createdIssues = await Issue.insertMany(testIssues);
    console.log(`✅ Created ${createdIssues.length} additional test issues`);

    // Test 3: Upvote issues
    console.log('\n3. Testing issue upvoting...');
    newIssue.upvotes.push(residentUser._id);
    newIssue.upvotes.push(adminUser._id);
    await newIssue.save();
    console.log(`✅ Issue upvoted by resident and admin. Upvote count: ${newIssue.upvoteCount}`);

    // Test 4: Add comments
    console.log('\n4. Testing comment system...');
    
    // Resident comment
    const residentComment = new Comment({
      content: 'This has been happening for 2 days now. The leak is getting worse.',
      issue: newIssue._id,
      author: residentUser._id,
      community: community._id
    });
    await residentComment.save();

    // Admin comment
    const adminComment = new Comment({
      content: 'We have scheduled a plumber for tomorrow morning. Please keep the area dry.',
      issue: newIssue._id,
      author: adminUser._id,
      community: community._id,
      isAdminUpdate: true
    });
    await adminComment.save();

    console.log('✅ Comments added by resident and admin');

    // Test 5: Update issue status
    console.log('\n5. Testing issue status update...');
    newIssue.status = 'acknowledged';
    newIssue.assignedTo = adminUser._id;
    await newIssue.save();
    await newIssue.populate('assignedTo', 'name email');
    console.log(`✅ Issue status updated to: ${newIssue.status}`);
    console.log(`✅ Issue assigned to: ${newIssue.assignedTo.name}`);

    // Test 6: Query issues with different filters
    console.log('\n6. Testing issue queries and filters...');
    
    const allIssues = await Issue.countDocuments({ community: community._id });
    const openIssues = await Issue.countDocuments({ 
      community: community._id, 
      status: 'open' 
    });
    const plumbingIssues = await Issue.countDocuments({ 
      community: community._id, 
      category: 'Plumbing' 
    });
    const highUrgencyIssues = await Issue.countDocuments({ 
      community: community._id, 
      urgency: 'high' 
    });

    console.log(`📊 Issue Statistics:`);
    console.log(`   - Total issues: ${allIssues}`);
    console.log(`   - Open issues: ${openIssues}`);
    console.log(`   - Plumbing issues: ${plumbingIssues}`);
    console.log(`   - High urgency issues: ${highUrgencyIssues}`);

    // Test 7: Get issue with populated data
    console.log('\n7. Testing issue population...');
    const populatedIssue = await Issue.findById(newIssue._id)
      .populate('createdBy', 'name email apartmentNumber')
      .populate('assignedTo', 'name email')
      .populate('upvotes', 'name')
      .populate('comments') // Add this to populate the virtual field
      .populate('commentCount'); // Add this to populate the count virtual

      // Get comments separately
    const comments = await Comment.find({ issue: newIssue._id })
      .populate('author', 'name email role')
      .sort({ createdAt: 1 });

    console.log('✅ Issue populated with:');
    console.log(`   - Created by: ${populatedIssue.createdBy.name}`);
    console.log(`   - Assigned to: ${populatedIssue.assignedTo?.name || 'None'}`);
    console.log(`   - Upvotes: ${populatedIssue.upvotes.length} users`);
    console.log(`   - Comments: ${populatedIssue.comments.length}`);

    // Test 8: Test comment filtering (internal vs public)
    console.log('\n8. Testing comment visibility...');
    const allComments = await Comment.countDocuments({ issue: newIssue._id });
    const publicComments = await Comment.countDocuments({ 
      issue: newIssue._id, 
      isInternal: false 
    });
    const adminComments = await Comment.countDocuments({ 
      issue: newIssue._id, 
      isAdminUpdate: true 
    });

    console.log(`💬 Comment Statistics:`);
    console.log(`   - Total comments: ${allComments}`);
    console.log(`   - Public comments: ${publicComments}`);
    console.log(`   - Admin comments: ${adminComments}`);

    console.log('\n🎉 Issue management testing completed successfully!');
    console.log('\n📋 Test Summary:');
    console.log(`   - Issues created: ${createdIssues.length + 1}`);
    console.log(`   - Comments added: ${allComments}`);
    console.log(`   - Upvotes tested: ${populatedIssue.upvotes.length}`);
    console.log(`   - Status updates: 1`);

  } catch (error) {
    console.error('❌ Error in issue management test:', error);
    console.error('Error details:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

// Run the test
testIssues();