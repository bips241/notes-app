const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Note = require('./src/models/notes.model');
const User = require('./src/models/user.model');

async function diagnosticReport() {
  try {
    console.log('📊 DIAGNOSTIC REPORT');
    console.log('===================\n');

    // Count total notes
    const totalNotes = await Note.countDocuments();
    console.log(`📝 Total notes in database: ${totalNotes}`);

    // Count archived vs non-archived
    const archivedCount = await Note.countDocuments({ isArchived: true });
    const activeCount = await Note.countDocuments({ isArchived: false });
    console.log(`📦 Archived notes: ${archivedCount}`);
    console.log(`✅ Active notes: ${activeCount}`);

    // List all users
    const users = await User.find({}, 'email firstName lastName');
    console.log(`\n👥 Total users: ${users.length}`);
    
    for (const user of users) {
      const userNotes = await Note.countDocuments({ owner: user._id });
      const userArchivedNotes = await Note.countDocuments({ owner: user._id, isArchived: true });
      console.log(`- ${user.email}: ${userNotes} notes (${userArchivedNotes} archived)`);
    }

    // Show recent notes
    console.log('\n📋 Recent notes:');
    const recentNotes = await Note.find({})
      .populate('owner', 'email firstName lastName')
      .sort({ updatedAt: -1 })
      .limit(5);

    recentNotes.forEach((note, index) => {
      console.log(`${index + 1}. ${note._id}: "${note.title}"`);
      console.log(`   Owner: ${note.owner.email}`);
      console.log(`   Archived: ${note.isArchived}`);
      console.log(`   Updated: ${note.updatedAt}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

diagnosticReport();
