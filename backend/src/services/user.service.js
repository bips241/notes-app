const User = require('../models/user.model');

const userService = {
  async getAllUsers(options = {}) {
    const { page = 1, limit = 10, search } = options;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query = {
        $or: [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    };
  },

  async getUserById(userId) {
    const user = await User.findById(userId).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async updateUser(userId, updateData) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow password updates through this method
    delete updateData.password;

    Object.assign(user, updateData);
    await user.save();

    return user;
  },

  async deactivateUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = false;
    await user.save();

    return { message: 'User deactivated successfully' };
  },

  async activateUser(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.isActive = true;
    await user.save();

    return { message: 'User activated successfully' };
  },

  async getUserByEmail(email) {
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  },

  async addSharingRestriction(userId, restrictedUserId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const restrictedUser = await User.findById(restrictedUserId);
    if (!restrictedUser) {
      throw new Error('Restricted user not found');
    }

    // Check if restriction already exists
    if (user.sharingRestrictedUsers.includes(restrictedUserId)) {
      throw new Error('Sharing restriction already exists');
    }

    user.sharingRestrictedUsers.push(restrictedUserId);
    await user.save();

    return { message: 'Sharing restriction added successfully' };
  },

  async removeSharingRestriction(userId, restrictedUserId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.sharingRestrictedUsers = user.sharingRestrictedUsers.filter(
      id => id.toString() !== restrictedUserId
    );
    await user.save();

    return { message: 'Sharing restriction removed successfully' };
  },

  async getSharingRestrictions(userId) {
    const user = await User.findById(userId)
      .populate('sharingRestrictedUsers', '-password')
      .select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return {
      user: user,
      restrictedUsers: user.sharingRestrictedUsers || []
    };
  },

  async searchUsers(searchTerm, limit = 10) {
    if (!searchTerm || searchTerm.length < 1) {
      return [];
    }

    // Use text search for better performance with indexes
    const textSearchQuery = {
      isActive: true,
      $text: { $search: searchTerm }
    };

    // Fallback to regex search if text search doesn't find results
    const regexSearchQuery = {
      isActive: true,
      $or: [
        { email: { $regex: `^${searchTerm}`, $options: 'i' } }, // Prefix match is faster
        { firstName: { $regex: `^${searchTerm}`, $options: 'i' } },
        { lastName: { $regex: `^${searchTerm}`, $options: 'i' } },
        { username: { $regex: `^${searchTerm}`, $options: 'i' } }
      ]
    };

    try {
      // Try text search first (uses indexes)
      let users = await User.find(textSearchQuery)
        .select('_id username email firstName lastName')
        .limit(parseInt(limit))
        .sort({ score: { $meta: 'textScore' } });

      // If text search doesn't find enough results, try regex search
      if (users.length < limit) {
        const remainingLimit = limit - users.length;
        const existingIds = users.map(u => u._id);
        
        const regexUsers = await User.find({
          ...regexSearchQuery,
          _id: { $nin: existingIds }
        })
          .select('_id username email firstName lastName')
          .limit(remainingLimit)
          .sort({ firstName: 1, lastName: 1 });

        users = users.concat(regexUsers);
      }

      return users;
    } catch (error) {
      // If text search fails, fall back to regex search
      console.warn('Text search failed, falling back to regex search:', error.message);
      
      const users = await User.find(regexSearchQuery)
        .select('_id username email firstName lastName')
        .limit(parseInt(limit))
        .sort({ firstName: 1, lastName: 1 });

      return users;
    }
  }
};

module.exports = userService;