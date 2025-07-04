const notesService = require('../services/notes.service');
const { validationResult } = require('express-validator');

const notesController = {
  async createNote(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const note = await notesService.createNote(req.body, req.user._id);
      
      res.status(201).json({
        message: 'Note created successfully',
        note
      });
    } catch (error) {
      next(error);
    }
  },

  async getNotes(req, res, next) {
    try {
      const { page, limit, search, tags, isArchived, includeShared } = req.query;
      const options = { 
        page, 
        limit, 
        search, 
        isArchived,
        includeShared: includeShared !== 'false' // Default to true unless explicitly set to false
      };
      
      if (tags) {
        options.tags = tags.split(',').map(tag => tag.trim());
      }

      const result = await notesService.getNotes(req.user._id, options);
      
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async getSharedNotes(req, res, next) {
    try {
      const { page, limit } = req.query;
      const options = { page, limit };
      
      const result = await notesService.getSharedNotes(req.user._id, options);
      
      res.json({
        message: 'Shared notes retrieved successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  },

  async getNoteById(req, res, next) {
    try {
      const note = await notesService.getNoteById(req.params.id, req.user._id);
      res.json({ note });
    } catch (error) {
      next(error);
    }
  },

  async updateNote(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const note = await notesService.updateNote(req.params.id, req.body, req.user._id);
      
      res.json({
        message: 'Note updated successfully',
        note
      });
    } catch (error) {
      next(error);
    }
  },

  async deleteNote(req, res, next) {
    try {
      const result = await notesService.deleteNote(req.params.id, req.user._id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async shareNote(req, res, next) {
    try {
      const { userId, permission } = req.body;
      const note = await notesService.shareNote(req.params.id, userId, permission, req.user._id);
      
      res.json({
        message: 'Note shared successfully',
        note
      });
    } catch (error) {
      next(error);
    }
  },

  async removeShare(req, res, next) {
    try {
      const { userId } = req.params;
      const result = await notesService.removeShare(req.params.id, userId, req.user._id);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  async archiveNote(req, res, next) {
    try {
      const note = await notesService.archiveNote(req.params.id, req.user._id);
      res.json({
        message: 'Note archived successfully',
        note
      });
    } catch (error) {
      next(error);
    }
  },

  async unarchiveNote(req, res, next) {
    try {
      console.log('🔄 Unarchiving note:', req.params.id, 'for user:', req.user._id);
      const note = await notesService.unarchiveNote(req.params.id, req.user._id);
      console.log('✅ Note unarchived successfully:', note._id);
      res.json({
        message: 'Note unarchived successfully',
        note
      });
    } catch (error) {
      console.error('❌ Error unarchiving note:', error.message);
      next(error);
    }
  },

  async getArchivedNotes(req, res, next) {
    try {
      const { page, limit, search, tags } = req.query;
      const options = { page, limit, search, tags: tags ? tags.split(',') : undefined };
      
      const result = await notesService.getArchivedNotes(req.user._id, options);
      
      res.json({
        message: 'Archived notes retrieved successfully',
        ...result
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = notesController;