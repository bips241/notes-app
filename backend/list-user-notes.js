const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const Note = require('./src/models/notes.model');

async function listAllNotesForUser() {
  try {
    const userId = '6866e5d3f1e4b5b04a972896';

    console.log('🔍 Finding ALL notes for user:', userId);

    // Get all notes for this user (regardless of archive status)
    const allNotes = await Note.find({ owner: userId }).sort({ updatedAt: -1 });
    
    console.log(`📝 Total notes owned by user: ${allNotes.length}`);
    
    if (allNotes.length > 0) {
      console.log('\n📋 All notes:');
      allNotes.forEach((note, index) => {
        console.log(`${index + 1}. ${note._id}: "${note.title}"`);
        console.log(`   - Content preview: "${note.content.substring(0, 100)}..."`);
        console.log(`   - Archived: ${note.isArchived}`);
        console.log(`   - Created: ${note.createdAt}`);
        console.log(`   - Updated: ${note.updatedAt}`);
        console.log(`   - Tags: [${note.tags.join(', ')}]`);
        console.log('');
      });
    }

    // Also check if there are any notes with similar content
    console.log('\n🔍 Looking for notes with "admin" in title or content...');
    const adminNotes = await Note.find({
      $or: [
        { title: /admin/i },
        { content: /admin/i }
      ]
    });

    console.log(`📝 Found ${adminNotes.length} notes with "admin":`);
    adminNotes.forEach(note => {
      console.log(`- ${note._id}: "${note.title}" (owner: ${note.owner})`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

listAllNotesForUser();
