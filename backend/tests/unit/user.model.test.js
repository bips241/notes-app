const User = require('../../src/models/user.model');
const bcrypt = require('bcryptjs');

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a new user with valid data', async () => {
      const userData = testHelpers.createTestUser();
      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.username).toBe(userData.username);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.firstName).toBe(userData.firstName);
      expect(savedUser.lastName).toBe(userData.lastName);
      expect(savedUser.role).toBe(userData.role);
      expect(savedUser.isActive).toBe(true);
      expect(savedUser.createdAt).toBeDefined();
      expect(savedUser.updatedAt).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const userData = testHelpers.createTestUser();
      const user = new User(userData);
      await user.save();

      expect(user.password).not.toBe(userData.password);
      expect(user.password.length).toBeGreaterThan(20);
    });

    it('should not save user without required fields', async () => {
      const user = new User({});
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not save user with invalid email', async () => {
      const userData = testHelpers.createTestUser({ email: 'invalid-email' });
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should not save user with duplicate email', async () => {
      const userData = testHelpers.createTestUser();
      const user1 = new User(userData);
      await user1.save();

      const user2 = new User(userData);
      await expect(user2.save()).rejects.toThrow();
    });

    it('should not save user with duplicate username', async () => {
      const userData1 = testHelpers.createTestUser();
      const userData2 = testHelpers.createTestUser({ 
        email: 'different@example.com',
        username: userData1.username 
      });
      
      const user1 = new User(userData1);
      await user1.save();

      const user2 = new User(userData2);
      await expect(user2.save()).rejects.toThrow();
    });
  });

  describe('User Validation', () => {
    it('should validate username length', async () => {
      const userData = testHelpers.createTestUser({ username: 'ab' });
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate password length', async () => {
      const userData = testHelpers.createTestUser({ password: '123' });
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });

    it('should validate role enum', async () => {
      const userData = testHelpers.createTestUser({ role: 'invalid' });
      const user = new User(userData);
      
      await expect(user.save()).rejects.toThrow();
    });
  });

  describe('User Methods', () => {
    it('should compare password correctly', async () => {
      const userData = testHelpers.createTestUser();
      const user = new User(userData);
      await user.save();

      const isMatch = await user.comparePassword(userData.password);
      expect(isMatch).toBe(true);

      const isNotMatch = await user.comparePassword('wrongpassword');
      expect(isNotMatch).toBe(false);
    });

    it('should not include password in JSON output', async () => {
      const userData = testHelpers.createTestUser();
      const user = new User(userData);
      await user.save();

      const userJSON = user.toJSON();
      expect(userJSON.password).toBeUndefined();
    });
  });

  describe('Sharing Restrictions', () => {
    it('should initialize with empty sharing restrictions', async () => {
      const userData = testHelpers.createTestUser();
      const user = new User(userData);
      await user.save();

      expect(user.sharingRestrictedUsers).toEqual([]);
    });

    it('should allow adding sharing restrictions', async () => {
      const user1 = new User(testHelpers.createTestUser());
      await user1.save();

      const user2 = new User(testHelpers.createTestUser({
        username: 'user2',
        email: 'user2@example.com'
      }));
      await user2.save();

      user1.sharingRestrictedUsers.push(user2._id);
      await user1.save();

      expect(user1.sharingRestrictedUsers).toHaveLength(1);
      expect(user1.sharingRestrictedUsers[0].toString()).toBe(user2._id.toString());
    });
  });
});
