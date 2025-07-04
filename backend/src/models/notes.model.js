const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    minlength: 3
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sharedWith: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    permission: {
      type: String,
      enum: ['read', 'write'],
      default: 'read'
    }
  }],
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for search functionality
noteSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Note', noteSchema);