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
      const { page, limit, search, tags, isArchived } = req.query;
      const options = { page, limit, search, isArchived };
      
      if (tags) {
        options.tags = tags.split(',').map(tag => tag.trim());
      }

      const result = await notesService.getNotes(req.user._id, options);
      
      res.json(result);
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
  }
};

module.exports = notesController;