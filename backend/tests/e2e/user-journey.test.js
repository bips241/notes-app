const request = require('supertest');
const app = require('../../src/app');
const TestFactory = require('../helpers/factory');

describe('E2E: Complete User Journey', () => {
  let testFactory;

  beforeEach(() => {
    testFactory = new TestFactory(app);
  });

  describe('User Registration and Login Flow', () => {
    it('should complete full user registration and login journey', async () => {
      const userData = testHelpers.createTestUser();

      // 1. Register user
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(registerResponse.body.message).toBe('User created successfully');
      expect(registerResponse.body.token).toBeDefined();
      
      const userId = registerResponse.body.user._id;
      const token = registerResponse.body.token;

      // 2. Get user profile
      const profileResponse = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(profileResponse.body.user.email).toBe(userData.email);

      // 3. Update profile
      const updateData = { firstName: 'Updated', lastName: 'Name' };
      const updateResponse = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.user.firstName).toBe('Updated');

      // 4. Login with credentials
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: userData.email,
          password: userData.password
        })
        .expect(200);

      expect(loginResponse.body.message).toBe('Login successful');
      expect(loginResponse.body.token).toBeDefined();
    });
  });

  describe('Notes Management Flow', () => {
    let user;

    beforeEach(async () => {
      user = await testFactory.createUser();
    });

    it('should complete full notes management journey', async () => {
      // 1. Create multiple notes
      const note1Data = {
        title: 'Work Notes',
        content: 'Important meeting notes',
        tags: ['work', 'meeting']
      };

      const note2Data = {
        title: 'Personal Notes',
        content: 'Personal todo list',
        tags: ['personal', 'todo']
      };

      const createResponse1 = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user.token}`)
        .send(note1Data)
        .expect(201);

      const createResponse2 = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user.token}`)
        .send(note2Data)
        .expect(201);

      const noteId1 = createResponse1.body.note._id;
      const noteId2 = createResponse2.body.note._id;

      // 2. Get all notes
      const notesResponse = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(notesResponse.body.notes).toHaveLength(2);

      // 3. Search notes
      const searchResponse = await request(app)
        .get('/api/notes?search=work')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(searchResponse.body.notes).toHaveLength(1);
      expect(searchResponse.body.notes[0].title).toBe('Work Notes');

      // 4. Filter by tags
      const tagResponse = await request(app)
        .get('/api/notes?tags=personal')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(tagResponse.body.notes).toHaveLength(1);
      expect(tagResponse.body.notes[0].title).toBe('Personal Notes');

      // 5. Update note
      const updateData = {
        title: 'Updated Work Notes',
        content: 'Updated meeting notes',
        tags: ['work', 'meeting', 'updated']
      };

      const updateResponse = await request(app)
        .put(`/api/notes/${noteId1}`)
        .set('Authorization', `Bearer ${user.token}`)
        .send(updateData)
        .expect(200);

      expect(updateResponse.body.note.title).toBe('Updated Work Notes');

      // 6. Archive note
      const archiveResponse = await request(app)
        .patch(`/api/notes/${noteId2}/archive`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(archiveResponse.body.note.isArchived).toBe(true);

      // 7. Get notes (should not include archived)
      const notesAfterArchive = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(notesAfterArchive.body.notes).toHaveLength(1);

      // 8. Get archived notes
      const archivedNotesResponse = await request(app)
        .get('/api/notes/archived')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(archivedNotesResponse.body.notes).toHaveLength(1);
      expect(archivedNotesResponse.body.notes[0].isArchived).toBe(true);

      // 9. Unarchive note
      const unarchiveResponse = await request(app)
        .patch(`/api/notes/${noteId2}/unarchive`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(unarchiveResponse.body.note.isArchived).toBe(false);

      // 10. Delete note
      await request(app)
        .delete(`/api/notes/${noteId2}`)
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      // 11. Verify deletion
      const finalNotesResponse = await request(app)
        .get('/api/notes')
        .set('Authorization', `Bearer ${user.token}`)
        .expect(200);

      expect(finalNotesResponse.body.notes).toHaveLength(1);
    });
  });

  describe('Note Sharing Flow', () => {
    let user1, user2;

    beforeEach(async () => {
      user1 = await testFactory.createUser();
      user2 = await testFactory.createUser({
        email: 'user2@example.com',
        username: 'user2'
      });
    });

    it('should complete full note sharing journey', async () => {
      // 1. User1 creates a note
      const noteData = {
        title: 'Shared Note',
        content: 'This note will be shared',
        tags: ['shared']
      };

      const createResponse = await request(app)
        .post('/api/notes')
        .set('Authorization', `Bearer ${user1.token}`)
        .send(noteData)
        .expect(201);

      const noteId = createResponse.body.note._id;

      // 2. User1 shares note with User2 (read permission)
      const shareData = {
        userId: user2.user._id,
        permission: 'read'
      };

      const shareResponse = await request(app)
        .post(`/api/notes/${noteId}/share`)
        .set('Authorization', `Bearer ${user1.token}`)
        .send(shareData)
        .expect(200);

      expect(shareResponse.body.note.sharedWith).toHaveLength(1);
      expect(shareResponse.body.note.sharedWith[0].permission).toBe('read');

      // 3. User2 gets shared notes
      const sharedNotesResponse = await request(app)
        .get('/api/notes/shared')
        .set('Authorization', `Bearer ${user2.token}`)
        .expect(200);

      expect(sharedNotesResponse.body.notes).toHaveLength(1);
      expect(sharedNotesResponse.body.notes[0].title).toBe('Shared Note');

      // 4. User2 can read the shared note
      const readNoteResponse = await request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .expect(200);

      expect(readNoteResponse.body.note.title).toBe('Shared Note');

      // 5. User2 cannot edit the note (read-only permission)
      const editAttempt = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .send({ title: 'Edited Title' })
        .expect(403);

      expect(editAttempt.body.message).toBe('Access denied');

      // 6. User1 updates sharing permissions to write
      const updateShareData = {
        userId: user2.user._id,
        permission: 'write'
      };

      await request(app)
        .post(`/api/notes/${noteId}/share`)
        .set('Authorization', `Bearer ${user1.token}`)
        .send(updateShareData)
        .expect(200);

      // 7. User2 can now edit the note
      const editResponse = await request(app)
        .put(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .send({ title: 'Edited by User2' })
        .expect(200);

      expect(editResponse.body.note.title).toBe('Edited by User2');

      // 8. User1 removes sharing
      await request(app)
        .delete(`/api/notes/${noteId}/share/${user2.user._id}`)
        .set('Authorization', `Bearer ${user1.token}`)
        .expect(200);

      // 9. User2 can no longer access the note
      await request(app)
        .get(`/api/notes/${noteId}`)
        .set('Authorization', `Bearer ${user2.token}`)
        .expect(403);

      // 10. User2 no longer sees the note in shared notes
      const finalSharedResponse = await request(app)
        .get('/api/notes/shared')
        .set('Authorization', `Bearer ${user2.token}`)
        .expect(200);

      expect(finalSharedResponse.body.notes).toHaveLength(0);
    });
  });

  describe('Admin User Management Flow', () => {
    let admin, user1, user2;

    beforeEach(async () => {
      admin = await testFactory.createAdmin();
      user1 = await testFactory.createUser();
      user2 = await testFactory.createUser({
        email: 'user2@example.com',
        username: 'user2'
      });
    });

    it('should complete admin user management journey', async () => {
      // 1. Admin gets all users
      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(usersResponse.body.users.length).toBeGreaterThanOrEqual(3);

      // 2. Admin gets specific user
      const userResponse = await request(app)
        .get(`/api/users/${user1.user._id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(userResponse.body.user.email).toBe(user1.user.email);

      // 3. Admin deactivates user
      const deactivateResponse = await request(app)
        .patch(`/api/users/${user1.user._id}/deactivate`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(deactivateResponse.body.message).toBe('User deactivated successfully');

      // 4. Deactivated user cannot login
      const loginAttempt = await request(app)
        .post('/api/auth/login')
        .send({
          email: user1.user.email,
          password: 'password123'
        })
        .expect(401);

      expect(loginAttempt.body.message).toBe('Account is deactivated');

      // 5. Admin reactivates user
      await request(app)
        .patch(`/api/users/${user1.user._id}/activate`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      // 6. Reactivated user can login again
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: user1.user.email,
          password: 'password123'
        })
        .expect(200);

      expect(loginResponse.body.message).toBe('Login successful');

      // 7. Admin adds sharing restriction
      const restrictionData = {
        restrictedUserId: user2.user._id
      };

      await request(app)
        .post(`/api/users/${user1.user._id}/sharing-restrictions`)
        .set('Authorization', `Bearer ${admin.token}`)
        .send(restrictionData)
        .expect(200);

      // 8. Admin gets sharing restrictions
      const restrictionsResponse = await request(app)
        .get(`/api/users/${user1.user._id}/sharing-restrictions`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(restrictionsResponse.body.restrictedUsers).toHaveLength(1);
      expect(restrictionsResponse.body.restrictedUsers[0]._id.toString()).toBe(user2.user._id.toString());

      // 9. Admin removes sharing restriction
      await request(app)
        .delete(`/api/users/${user1.user._id}/sharing-restrictions/${user2.user._id}`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      // 10. Verify restriction is removed
      const finalRestrictionsResponse = await request(app)
        .get(`/api/users/${user1.user._id}/sharing-restrictions`)
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(finalRestrictionsResponse.body.restrictedUsers).toHaveLength(0);
    });
  });

  describe('Analytics Flow', () => {
    let admin, users;

    beforeEach(async () => {
      admin = await testFactory.createAdmin();
      users = await testFactory.createMultipleUsers(3);
      
      // Create notes for analytics data
      for (const user of users) {
        await testFactory.createMultipleNotes(user.user._id, 2);
      }
    });

    it('should complete analytics data retrieval journey', async () => {
      // 1. Get dashboard stats
      const statsResponse = await request(app)
        .get('/api/analytics/dashboard-stats')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(statsResponse.body.stats.totalUsers).toBeGreaterThan(0);
      expect(statsResponse.body.stats.totalNotes).toBeGreaterThan(0);

      // 2. Get most active users
      const activeUsersResponse = await request(app)
        .get('/api/analytics/most-active-users')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(activeUsersResponse.body.users).toBeDefined();
      expect(activeUsersResponse.body.users.length).toBeGreaterThan(0);

      // 3. Get most used tags
      const tagsResponse = await request(app)
        .get('/api/analytics/most-used-tags')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(tagsResponse.body.tags).toBeDefined();

      // 4. Get notes per day
      const notesPerDayResponse = await request(app)
        .get('/api/analytics/notes-per-day')
        .set('Authorization', `Bearer ${admin.token}`)
        .expect(200);

      expect(notesPerDayResponse.body.data).toBeDefined();
      expect(Array.isArray(notesPerDayResponse.body.data)).toBe(true);
    });

    it('should deny analytics access to non-admin users', async () => {
      const regularUser = users[0];

      const statsResponse = await request(app)
        .get('/api/analytics/dashboard-stats')
        .set('Authorization', `Bearer ${regularUser.token}`)
        .expect(403);

      expect(statsResponse.body.message).toBe('Admin access required');
    });
  });
});
