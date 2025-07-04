const express = require('express');
const { body } = require('express-validator');
const notesController = require('../controllers/notes.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = express.Router();

// Validation rules
const noteValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array')
];

const shareValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('permission')
    .isIn(['read', 'write'])
    .withMessage('Permission must be either read or write')
];

// All routes require authentication
router.use(authMiddleware);

// Routes
router.post('/', noteValidation, notesController.createNote);
router.get('/', notesController.getNotes);
router.get('/shared', notesController.getSharedNotes);
router.get('/archived', notesController.getArchivedNotes);
router.patch('/:id/archive', notesController.archiveNote);
router.patch('/:id/unarchive', notesController.unarchiveNote);
router.get('/:id', notesController.getNoteById);
router.put('/:id', noteValidation, notesController.updateNote);
router.delete('/:id', notesController.deleteNote);
router.post('/:id/share', shareValidation, notesController.shareNote);
router.delete('/:id/share/:userId', notesController.removeShare);

module.exports = router;