const request = require('supertest');
const app = require('../../src/app');
const User = require('../../src/models/user.model');
const TestFactory = require('../helpers/factory');

describe('Authentication Routes', () => {
  let testFactory;

  beforeEach(() => {
    testFactory = new TestFactory(app);
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = testHelpers.createTestUser();
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.message).toBe('User created successfully');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.username).toBe(userData.username);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not register user with duplicate email', async () => {
      const userData = testHelpers.createTestUser();
      await testFactory.createUser(userData);
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });

    it('should not register user with invalid email', async () => {
      const userData = testHelpers.createTestUser({ email: 'invalid-email' });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should not register user without required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should not register user with short password', async () => {
      const userData = testHelpers.createTestUser({ password: '123' });
      
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      const userData = testHelpers.createTestUser();
      testUser = await testFactory.createUser(userData);
    });

    it('should login user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.user.email,
          password: 'password123'
        })
        .expect(200);

      expect(response.body.message).toBe('Login successful');
      expect(response.body.user.email).toBe(testUser.user.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not login user with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'invalid@example.com',
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login user with invalid password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.user.email,
          password: 'wrongpassword'
        })
        .expect(401);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login inactive user', async () => {
      // Update user to inactive
      await User.findByIdAndUpdate(testUser.user._id, { isActive: false });

      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.user.email,
          password: 'password123'
        })
        .expect(401);

      expect(response.body.message).toBe('Account is deactivated');
    });

    it('should not login without email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'password123'
        })
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should not login without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.user.email
        })
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });
  });

  describe('GET /api/auth/profile', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await testFactory.createUser();
    });

    it('should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .expect(200);

      expect(response.body.user.email).toBe(testUser.user.email);
      expect(response.body.user.username).toBe(testUser.user.username);
      expect(response.body.user.password).toBeUndefined();
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body.message).toBe('Invalid token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await testFactory.createUser();
    });

    it('should update user profile with valid data', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.user.firstName).toBe(updateData.firstName);
      expect(response.body.user.lastName).toBe(updateData.lastName);
    });

    it('should not update profile without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ firstName: 'Updated' })
        .expect(401);

      expect(response.body.message).toBe('Access token required');
    });

    it('should not update profile with invalid email', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ email: 'invalid-email' })
        .expect(400);

      expect(response.body.message).toBe('Validation failed');
    });

    it('should not update profile with duplicate email', async () => {
      const otherUser = await testFactory.createUser({
        email: 'other@example.com',
        username: 'otheruser'
      });

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${testUser.token}`)
        .send({ email: otherUser.user.email })
        .expect(400);

      expect(response.body.message).toContain('already exists');
    });
  });
});
