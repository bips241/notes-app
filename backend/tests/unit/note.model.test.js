const Note = require('../../src/models/notes.model');
const User = require('../../src/models/user.model');

describe('Note Model', () => {
  let testUser;

  beforeEach(async () => {
    const userData = testHelpers.createTestUser();
    testUser = new User(userData);
    await testUser.save();
  });

  describe('Note Creation', () => {
    it('should create a new note with valid data', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      const note = new Note(noteData);
      const savedNote = await note.save();

      expect(savedNote.title).toBe(noteData.title);
      expect(savedNote.content).toBe(noteData.content);
      expect(savedNote.tags).toEqual(noteData.tags);
      expect(savedNote.owner.toString()).toBe(testUser._id.toString());
      expect(savedNote.isArchived).toBe(false);
      expect(savedNote.createdAt).toBeDefined();
      expect(savedNote.updatedAt).toBeDefined();
    });

    it('should not save note without required fields', async () => {
      const note = new Note({});
      
      await expect(note.save()).rejects.toThrow();
    });

    it('should not save note without title', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      delete noteData.title;
      const note = new Note(noteData);
      
      await expect(note.save()).rejects.toThrow();
    });

    it('should not save note without content', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      delete noteData.content;
      const note = new Note(noteData);
      
      await expect(note.save()).rejects.toThrow();
    });

    it('should not save note without owner', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      delete noteData.owner;
      const note = new Note(noteData);
      
      await expect(note.save()).rejects.toThrow();
    });
  });

  describe('Note Validation', () => {
    it('should validate title length', async () => {
      const noteData = testHelpers.createTestNote(testUser._id, { title: 'ab' });
      const note = new Note(noteData);
      
      await expect(note.save()).rejects.toThrow();
    });

    it('should validate content length', async () => {
      const noteData = testHelpers.createTestNote(testUser._id, { content: 'ab' });
      const note = new Note(noteData);
      
      await expect(note.save()).rejects.toThrow();
    });

    it('should accept empty tags array', async () => {
      const noteData = testHelpers.createTestNote(testUser._id, { tags: [] });
      const note = new Note(noteData);
      const savedNote = await note.save();

      expect(savedNote.tags).toEqual([]);
    });

    it('should accept undefined tags', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      delete noteData.tags;
      const note = new Note(noteData);
      const savedNote = await note.save();

      expect(savedNote.tags).toEqual([]);
    });
  });

  describe('Note Sharing', () => {
    let sharedUser;

    beforeEach(async () => {
      const userData = testHelpers.createTestUser({
        username: 'shared',
        email: 'shared@example.com'
      });
      sharedUser = new User(userData);
      await sharedUser.save();
    });

    it('should initialize with empty sharedWith array', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      const note = new Note(noteData);
      await note.save();

      expect(note.sharedWith).toEqual([]);
    });

    it('should allow sharing with users', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      const note = new Note(noteData);
      note.sharedWith.push({
        user: sharedUser._id,
        permission: 'read'
      });
      await note.save();

      expect(note.sharedWith).toHaveLength(1);
      expect(note.sharedWith[0].user.toString()).toBe(sharedUser._id.toString());
      expect(note.sharedWith[0].permission).toBe('read');
    });

    it('should validate permission enum', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      const note = new Note(noteData);
      note.sharedWith.push({
        user: sharedUser._id,
        permission: 'invalid'
      });

      await expect(note.save()).rejects.toThrow();
    });

    it('should allow multiple users to share', async () => {
      const user2 = new User(testHelpers.createTestUser({
        username: 'user2',
        email: 'user2@example.com'
      }));
      await user2.save();

      const noteData = testHelpers.createTestNote(testUser._id);
      const note = new Note(noteData);
      note.sharedWith.push(
        { user: sharedUser._id, permission: 'read' },
        { user: user2._id, permission: 'write' }
      );
      await note.save();

      expect(note.sharedWith).toHaveLength(2);
      expect(note.sharedWith[0].permission).toBe('read');
      expect(note.sharedWith[1].permission).toBe('write');
    });
  });

  describe('Note Archiving', () => {
    it('should default to not archived', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      const note = new Note(noteData);
      await note.save();

      expect(note.isArchived).toBe(false);
    });

    it('should allow archiving', async () => {
      const noteData = testHelpers.createTestNote(testUser._id, { isArchived: true });
      const note = new Note(noteData);
      await note.save();

      expect(note.isArchived).toBe(true);
    });
  });

  describe('Note Population', () => {
    it('should populate owner information', async () => {
      const noteData = testHelpers.createTestNote(testUser._id);
      const note = new Note(noteData);
      await note.save();

      const populatedNote = await Note.findById(note._id).populate('owner');
      expect(populatedNote.owner.email).toBe(testUser.email);
      expect(populatedNote.owner.firstName).toBe(testUser.firstName);
    });

    it('should populate shared user information', async () => {
      const sharedUser = new User(testHelpers.createTestUser({
        username: 'shared',
        email: 'shared@example.com'
      }));
      await sharedUser.save();

      const noteData = testHelpers.createTestNote(testUser._id);
      const note = new Note(noteData);
      note.sharedWith.push({
        user: sharedUser._id,
        permission: 'read'
      });
      await note.save();

      const populatedNote = await Note.findById(note._id).populate('sharedWith.user');
      expect(populatedNote.sharedWith[0].user.email).toBe(sharedUser.email);
      expect(populatedNote.sharedWith[0].user.firstName).toBe(sharedUser.firstName);
    });
  });
});
