const mongoose = require('mongoose');
require('dotenv').config();

const Note = require('./src/models/notes.model');
const User = require('./src/models/user.model');

// Simple sample data for demonstration
const sampleNotes = [
  {
    title: 'Project Planning Meeting',
    content: 'Discussed Q3 roadmap and resource allocation',
    tags: ['work', 'planning', 'meeting'],
    isArchived: false,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Shopping List',
    content: 'Groceries for the week',
    tags: ['personal', 'shopping'],
    isArchived: false,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Study Notes',
    content: 'JavaScript concepts and examples',
    tags: ['study', 'javascript', 'programming'],
    isArchived: false,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Travel Plans',
    content: 'Summer vacation ideas',
    tags: ['travel', 'vacation', 'personal'],
    isArchived: false,
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
  },
  {
    title: 'Old Project Notes',
    content: 'Archived project documentation',
    tags: ['work', 'archived'],
    isArchived: true,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
  }
];

async function seedSimpleData() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing users
    const users = await User.find({});
    console.log(`📊 Found ${users.length} users`);

    if (users.length === 0) {
      console.log('❌ No users found. Please register some users first.');
      process.exit(1);
    }

    // Clear existing notes
    await Note.deleteMany({});
    console.log('🧹 Cleared existing notes');

    // Add sample notes to different users
    for (let i = 0; i < sampleNotes.length; i++) {
      const note = sampleNotes[i];
      const userIndex = i % users.length; // Distribute notes among users
      
      await Note.create({
        ...note,
        owner: users[userIndex]._id
      });
    }

    console.log(`✅ Created ${sampleNotes.length} sample notes`);
    console.log('📊 Simple sample data seeded successfully!');

    // Show summary
    const totalNotes = await Note.countDocuments();
    const archivedNotes = await Note.countDocuments({ isArchived: true });
    const activeNotes = await Note.countDocuments({ isArchived: false });

    console.log('\n📈 Summary:');
    console.log(`- Total notes: ${totalNotes}`);
    console.log(`- Active notes: ${activeNotes}`);
    console.log(`- Archived notes: ${archivedNotes}`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedSimpleData();
