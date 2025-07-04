const request = require('supertest');
const app = require('../../src/app');
const Note = require('../../src/models/notes.model');
const TestFactory = require('../helpers/factory');

describe('Notes Routes', () => {
  let testFactory;
  let testUser;

  beforeEach(async () => {
    testFactory = new TestFactory(app);
    testUser = await testFactory.createUser();
  });

  describe('GET /api/notes', () => {
    it('should get user notes with valid token', async () => {
      await testFactory.createMultipleNotes(testUser.user._id, 3);

      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.notes).toHaveLength(3);
      expect(response.body.notes[0].owner._id).toBe(testUser.user._id);
    });

    it('should not get notes without token', async () => {
      const response = await request(app)
        .get('/api/notes')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should filter notes by search term', async () => {
      await testFactory.createNote(testUser.user._id, {
        title: 'Important Meeting',
        content: 'Meeting notes'
      });
      await testFactory.createNote(testUser.user._id, {
        title: 'Shopping List',
        content: 'Buy groceries'
      });

      const response = await request(app)
        .get('/api/notes?search=meeting')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.notes).toHaveLength(1);
      expect(response.body.notes[0].title).toBe('Important Meeting');
    });

    it('should filter notes by tags', async () => {
      await testFactory.createNote(testUser.user._id, {
        title: 'Work Note',
        tags: ['work', 'urgent']
      });
      await testFactory.createNote(testUser.user._id, {
        title: 'Personal Note',
        tags: ['personal']
      });

      const response = await request(app)
        .get('/api/notes?tags=work')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.notes).toHaveLength(1);
      expect(response.body.notes[0].title).toBe('Work Note');
    });

    it('should exclude archived notes by default', async () => {
      await testFactory.createNote(testUser.user._id, {
        title: 'Active Note',
        isArchived: false
      });
      await testFactory.createNote(testUser.user._id, {
        title: 'Archived Note',
        isArchived: true
      });

      const response = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.notes).toHaveLength(1);
      expect(response.body.notes[0].title).toBe('Active Note');
    });

    it('should include archived notes when requested', async () => {
      await testFactory.createNote(testUser.user._id, {
        title: 'Active Note',
        isArchived: false
      });
      await testFactory.createNote(testUser.user._id, {
        title: 'Archived Note',
        isArchived: true
      });

      const response = await request(app)
        .get('/api/notes?includeArchived=true')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.notes).toHaveLength(2);
    });
  });

  describe('POST /api/notes', () => {
    it('should create note with valid data', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note',
        tags: ['test', 'note']
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(noteData)
        .expect(201);

      expect(response.body.message).toBe('Note created successfully');
      expect(response.body.note.title).toBe(noteData.title);
      expect(response.body.note.content).toBe(noteData.content);
      expect(response.body.note.tags).toEqual(noteData.tags);
      expect(response.body.note.owner._id).toBe(testUser.user._id);
    });

    it('should not create note without token', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note'
      };

      const response = await request(app)
        .post('/api/notes')
        .send(noteData)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should not create note without title', async () => {
      const noteData = {
        content: 'This is a test note'
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(noteData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should not create note without content', async () => {
      const noteData = {
        title: 'Test Note'
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(noteData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should create note with empty tags array', async () => {
      const noteData = {
        title: 'Test Note',
        content: 'This is a test note',
        tags: []
      };

      const response = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(noteData)
        .expect(201);

      expect(response.body.note.tags).toEqual([]);
    });
  });

  describe('GET /api/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await testFactory.createNote(testUser.user._id);
    });

    it('should get note by id with valid token', async () => {
      const response = await request(app)
        .get(`/api/notes/${testNote._id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.note.title).toBe(testNote.title);
      expect(response.body.note.content).toBe(testNote.content);
    });

    it('should not get note without token', async () => {
      const response = await request(app)
        .get(`/api/notes/${testNote._id}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should not get note with invalid id', async () => {
      const response = await request(app)
        .get('/api/notes/invalid-id')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(400);

      expect(response.body.message).toBe('Invalid note ID');
    });

    it('should not get note that does not exist', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/notes/${fakeId}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(404);

      expect(response.body.message).toBe('Note not found');
    });

    it('should not get note from another user', async () => {
      const otherUser = await testFactory.createUser({
        email: 'other@example.com',
        username: 'otheruser'
      });
      const otherNote = await testFactory.createNote(otherUser.user._id);

      const response = await request(app)
        .get(`/api/notes/${otherNote._id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('PUT /api/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await testFactory.createNote(testUser.user._id);
    });

    it('should update note with valid data', async () => {
      const updateData = {
        title: 'Updated Title',
        content: 'Updated content',
        tags: ['updated', 'test']
      };

      const response = await request(app)
        .put(`/api/notes/${testNote._id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Note updated successfully');
      expect(response.body.note.title).toBe(updateData.title);
      expect(response.body.note.content).toBe(updateData.content);
      expect(response.body.note.tags).toEqual(updateData.tags);
    });

    it('should not update note without token', async () => {
      const response = await request(app)
        .put(`/api/notes/${testNote._id}`)
        .send({ title: 'Updated Title' })
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should not update note from another user', async () => {
      const otherUser = await testFactory.createUser({
        email: 'other@example.com',
        username: 'otheruser'
      });
      const otherNote = await testFactory.createNote(otherUser.user._id);

      const response = await request(app)
        .put(`/api/notes/${otherNote._id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ title: 'Updated Title' })
        .expect(403);

      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('DELETE /api/notes/:id', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await testFactory.createNote(testUser.user._id);
    });

    it('should delete note with valid token', async () => {
      const response = await request(app)
        .delete(`/api/notes/${testNote._id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.message).toBe('Note deleted successfully');

      // Verify note is deleted
      const deletedNote = await Note.findById(testNote._id);
      expect(deletedNote).toBeNull();
    });

    it('should not delete note without token', async () => {
      const response = await request(app)
        .delete(`/api/notes/${testNote._id}`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should not delete note from another user', async () => {
      const otherUser = await testFactory.createUser({
        email: 'other@example.com',
        username: 'otheruser'
      });
      const otherNote = await testFactory.createNote(otherUser.user._id);

      const response = await request(app)
        .delete(`/api/notes/${otherNote._id}`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(403);

      expect(response.body.message).toBe('Access denied');
    });
  });

  describe('POST /api/notes/:id/share', () => {
    let testNote;
    let otherUser;

    beforeEach(async () => {
      testNote = await testFactory.createNote(testUser.user._id);
      otherUser = await testFactory.createUser({
        email: 'other@example.com',
        username: 'otheruser'
      });
    });

    it('should share note with valid data', async () => {
      const shareData = {
        userId: otherUser.user._id,
        permission: 'read'
      };

      const response = await request(app)
        .post(`/api/notes/${testNote._id}/share`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(shareData)
        .expect(200);

      expect(response.body.message).toBe('Note shared successfully');
      expect(response.body.note.sharedWith).toHaveLength(1);
      expect(response.body.note.sharedWith[0].user._id).toBe(otherUser.user._id);
      expect(response.body.note.sharedWith[0].permission).toBe('read');
    });

    it('should not share note without token', async () => {
      const shareData = {
        userId: otherUser.user._id,
        permission: 'read'
      };

      const response = await request(app)
        .post(`/api/notes/${testNote._id}/share`)
        .send(shareData)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should not share note with invalid permission', async () => {
      const shareData = {
        userId: otherUser.user._id,
        permission: 'invalid'
      };

      const response = await request(app)
        .post(`/api/notes/${testNote._id}/share`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(shareData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should not share note with non-existent user', async () => {
      const shareData = {
        userId: '507f1f77bcf86cd799439011',
        permission: 'read'
      };

      const response = await request(app)
        .post(`/api/notes/${testNote._id}/share`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(shareData)
        .expect(404);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('PATCH /api/notes/:id/archive', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await testFactory.createNote(testUser.user._id);
    });

    it('should archive note', async () => {
      const response = await request(app)
        .patch(`/api/notes/${testNote._id}/archive`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.message).toBe('Note archived successfully');
      expect(response.body.note.isArchived).toBe(true);
    });

    it('should not archive note without token', async () => {
      const response = await request(app)
        .patch(`/api/notes/${testNote._id}/archive`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('PATCH /api/notes/:id/unarchive', () => {
    let testNote;

    beforeEach(async () => {
      testNote = await testFactory.createNote(testUser.user._id, { isArchived: true });
    });

    it('should unarchive note', async () => {
      const response = await request(app)
        .patch(`/api/notes/${testNote._id}/unarchive`)
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.message).toBe('Note unarchived successfully');
      expect(response.body.note.isArchived).toBe(false);
    });

    it('should not unarchive note without token', async () => {
      const response = await request(app)
        .patch(`/api/notes/${testNote._id}/unarchive`)
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });
  });
});
