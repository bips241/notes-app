const Note = require('../models/notes.model');
const mongoose = require('mongoose');

const notesService = {
  async createNote(noteData, userId) {
    const note = new Note({
      ...noteData,
      owner: userId
    });
    
    await note.save();
    return await note.populate('owner', 'username email firstName lastName');
  },

  async getNotes(userId, options = {}) {
    const { page = 1, limit = 10, search, tags, isArchived = false, includeShared = true, includeArchived = false } = options;
    const skip = (page - 1) * limit;

    // Build query
    let query;
    if (includeShared) {
      // Include both owned and shared notes
      query = {
        $or: [
          { owner: userId },
          { 'sharedWith.user': userId }
        ]
      };
    } else {
      // Only owned notes
      query = { 
        owner: userId
      };
    }

    // Handle archived notes
    if (includeArchived) {
      // Include both archived and non-archived notes - no filter needed
    } else {
      // Only non-archived notes
      query.isArchived = false;
    }

    // Only add text search if search term is provided
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    // First, let's check how many notes exist for this user without any filters
    const totalUserNotes = await Note.countDocuments({ owner: userId });

    const notes = await Note.find(query)
      .populate('owner', 'username email firstName lastName')
      .populate('sharedWith.user', 'username email firstName lastName')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    return {
      notes,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  },

  async getSharedNotes(userId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    // Only get notes that are shared with the user (not owned by the user) and not archived
    const query = {
      'sharedWith.user': userId,
      owner: { $ne: userId }, // Exclude notes owned by the user
      isArchived: false // Exclude archived notes
    };

    const notes = await Note.find(query)
      .populate('owner', 'username email firstName lastName')
      .populate('sharedWith.user', 'username email firstName lastName')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    return {
      notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  },

  async getNoteById(noteId, userId) {
    const note = await Note.findOne({
      _id: noteId,
      $or: [
        { owner: userId },
        { 'sharedWith.user': userId }
      ]
    })
    .populate('owner', 'username email firstName lastName')
    .populate('sharedWith.user', 'username email firstName lastName');

    if (!note) {
      // Check if note exists at all
      const noteExists = await Note.findById(noteId);
      if (!noteExists) {
        throw new Error('Note not found or access denied');
      } else {
        throw new Error('Access denied');
      }
    }

    return note;
  },

  async updateNote(noteId, updateData, userId) {
    // First check if note exists
    const noteExists = await Note.findById(noteId);
    if (!noteExists) {
      throw new Error('Note not found or access denied');
    }

    const note = await Note.findOne({
      _id: noteId,
      $or: [
        { owner: userId },
        { 
          'sharedWith.user': userId,
          'sharedWith.permission': 'write'
        }
      ]
    });

    if (!note) {
      throw new Error('Access denied');
    }

    // Update the note fields
    Object.assign(note, updateData);
    
    try {
      await note.save();
    } catch (error) {
      // If it's a validation error, but we've already checked permissions, re-throw as validation error
      if (error.name === 'ValidationError') {
        throw error;
      }
      throw error;
    }

    return await note.populate('owner', 'username email firstName lastName');
  },

  async deleteNote(noteId, userId) {
    const note = await Note.findOne({
      _id: noteId,
      owner: userId
    });

    if (!note) {
      throw new Error('Note not found or you are not the owner');
    }

    await Note.findByIdAndDelete(noteId);
    return { message: 'Note deleted successfully' };
  },

  async shareNote(noteId, targetUserId, permission, ownerId) {
    // Check if target user exists
    const User = require('../models/user.model');
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new Error('User not found');
    }

    const note = await Note.findOne({
      _id: noteId,
      owner: ownerId
    });

    if (!note) {
      throw new Error('Note not found or you are not the owner');
    }

    // Check for sharing restrictions
    const owner = await User.findById(ownerId);
    
    if (owner && owner.sharingRestrictedUsers && owner.sharingRestrictedUsers.includes(targetUserId)) {
      throw new Error('You are not allowed to share notes with this user due to sharing restrictions');
    }

    // Check if already shared with this user
    const existingShare = note.sharedWith.find(
      share => share.user.toString() === targetUserId
    );

    if (existingShare) {
      existingShare.permission = permission;
    } else {
      note.sharedWith.push({
        user: targetUserId,
        permission
      });
    }

    await note.save();
    return await note.populate('sharedWith.user', 'username email firstName lastName');
  },

  async removeShare(noteId, targetUserId, ownerId) {
    const note = await Note.findOne({
      _id: noteId,
      owner: ownerId
    });

    if (!note) {
      throw new Error('Note not found or you are not the owner');
    }

    note.sharedWith = note.sharedWith.filter(
      share => share.user.toString() !== targetUserId
    );

    await note.save();
    return { message: 'Share removed successfully' };
  },

  async archiveNote(noteId, userId) {
    const note = await Note.findOne({
      _id: noteId,
      $or: [
        { owner: userId },
        { 'sharedWith.user': userId, 'sharedWith.permission': 'write' }
      ]
    });

    if (!note) {
      throw new Error('Note not found or insufficient permissions');
    }

    note.isArchived = true;
    await note.save();

    return await note.populate('owner', 'username email firstName lastName');
  },

  async unarchiveNote(noteId, userId) {
    const note = await Note.findOne({
      _id: noteId,
      $or: [
        { owner: userId },
        { 'sharedWith.user': userId, 'sharedWith.permission': 'write' }
      ]
    });

    if (!note) {
      throw new Error('Note not found or insufficient permissions');
    }

    note.isArchived = false;
    await note.save();

    return await note.populate('owner', 'username email firstName lastName');
  },

  async getArchivedNotes(userId, options = {}) {
    const { page = 1, limit = 10, search, tags } = options;
    const skip = (page - 1) * limit;

    // Build query for archived notes
    let query = {
      isArchived: true,
      $or: [
        { owner: userId },
        { 'sharedWith.user': userId }
      ]
    };

    if (search) {
      query.$text = { $search: search };
    }

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    const notes = await Note.find(query)
      .populate('owner', 'username email firstName lastName')
      .populate('sharedWith.user', 'username email firstName lastName')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Note.countDocuments(query);

    return {
      notes,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    };
  }
};

module.exports = notesService;