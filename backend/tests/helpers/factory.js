const request = require('supertest');
const User = require('../../src/models/user.model');
const Note = require('../../src/models/notes.model');

class TestFactory {
  constructor(app) {
    this.app = app;
  }

  // Create a test user and return user object with token
  async createUser(userData = {}) {
    const user = new User(testHelpers.createTestUser(userData));
    await user.save();
    
    const token = testHelpers.generateToken(user._id, user.role);
    
    return {
      user: user.toObject(),
      token,
      authHeader: { Authorization: `Bearer ${token}` }
    };
  }

  // Create a test admin and return user object with token
  async createAdmin(userData = {}) {
    const admin = new User(testHelpers.createTestAdmin(userData));
    await admin.save();
    
    const token = testHelpers.generateToken(admin._id, admin.role);
    
    return {
      user: admin.toObject(),
      token,
      authHeader: { Authorization: `Bearer ${token}` }
    };
  }

  // Create a test note
  async createNote(userId, noteData = {}) {
    const note = new Note(testHelpers.createTestNote(userId, noteData));
    await note.save();
    return note.toObject();
  }

  // Create multiple test users
  async createMultipleUsers(count = 3) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await this.createUser({
        username: `user${i}`,
        email: `user${i}@example.com`,
        firstName: `User${i}`,
        lastName: `Test${i}`
      });
      users.push(user);
    }
    return users;
  }

  // Create multiple test notes
  async createMultipleNotes(userId, count = 3) {
    const notes = [];
    for (let i = 0; i < count; i++) {
      const note = await this.createNote(userId, {
        title: `Test Note ${i}`,
        content: `This is test note content ${i}`,
        tags: [`tag${i}`, 'test']
      });
      notes.push(note);
    }
    return notes;
  }

  // Make authenticated request
  async makeAuthenticatedRequest(method, url, token, data = null) {
    const req = request(this.app)[method](url)
      .set('Authorization', `Bearer ${token}`);
    
    if (data) {
      req.send(data);
    }
    
    return req;
  }

  // Login user and return token
  async loginUser(email, password) {
    const response = await request(this.app)
      .post('/api/auth/login')
      .send({ email, password });
    
    return response.body;
  }

  // Register user and return token
  async registerUser(userData) {
    const response = await request(this.app)
      .post('/api/auth/register')
      .send(userData);
    
    return response.body;
  }
}

module.exports = TestFactory;
