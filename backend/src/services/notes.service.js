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
    const { page = 1, limit = 10, search, tags, isArchived } = options;
    const skip = (page - 1) * limit;

    // Build query
    const query = {
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

    if (typeof isArchived === 'boolean') {
      query.isArchived = isArchived;
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
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
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
      throw new Error('Note not found or access denied');
    }

    return note;
  },

  async updateNote(noteId, updateData, userId) {
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
      throw new Error('Note not found or no write permission');
    }

    Object.assign(note, updateData);
    await note.save();

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
    const note = await Note.findOne({
      _id: noteId,
      owner: ownerId
    });

    if (!note) {
      throw new Error('Note not found or you are not the owner');
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
  }
};

module.exports = notesService;