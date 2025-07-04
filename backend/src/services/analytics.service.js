const Note = require('../models/notes.model');
const User = require('../models/user.model');
const mongoose = require('mongoose');

const analyticsService = {
  async getMostActiveUsers(limit = 10) {
    const activeUsers = await Note.aggregate([
      {
        $group: {
          _id: '$owner',
          notesCount: { $sum: 1 },
          lastActivity: { $max: '$updatedAt' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          notesCount: 1,
          lastActivity: 1,
          username: '$user.username',
          email: '$user.email',
          firstName: '$user.firstName',
          lastName: '$user.lastName'
        }
      },
      {
        $sort: { notesCount: -1 }
      },
      {
        $limit: parseInt(limit)
      }
    ]);

    return activeUsers;
  },

  async getMostUsedTags(limit = 10) {
    const tagStats = await Note.aggregate([
      {
        $unwind: '$tags'
      },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: parseInt(limit)
      },
      {
        $project: {
          tag: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    return tagStats;
  },

  async getNotesPerDay(days = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const notesPerDay = await Note.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Fill in missing dates with 0 count
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      
      const dayData = notesPerDay.find(item => item.date === dateString);
      result.push({
        date: dateString,
        count: dayData ? dayData.count : 0
      });
    }

    return result;
  },

  async getDashboardStats(userId, userRole) {
    const stats = {};

    // Convert userId to ObjectId if it's a string
    const userObjectId = typeof userId === 'string' ? new mongoose.Types.ObjectId(userId) : userId;

    if (userRole === 'admin') {
      // Admin stats - ensure all promises resolve properly
      const [totalUsers, totalNotes, activeUsers, archivedNotes, totalSharedNotes] = await Promise.all([
        User.countDocuments(),
        Note.countDocuments(),
        User.countDocuments({ isActive: true }),
        Note.countDocuments({ isArchived: true }),
        Note.countDocuments({ 'sharedWith.0': { $exists: true } })
      ]);

      stats.totalUsers = totalUsers;
      stats.totalNotes = totalNotes;
      stats.activeUsers = activeUsers;
      stats.archivedNotes = archivedNotes;
      stats.totalSharedNotes = totalSharedNotes;
      
    } else {
      // User stats - ensure all promises resolve properly
      const [myNotes, sharedWithMe, archivedNotes] = await Promise.all([
        Note.countDocuments({ 
          owner: userObjectId, 
          isArchived: false 
        }),
        Note.countDocuments({ 
          'sharedWith.user': userObjectId,
          owner: { $ne: userObjectId },
          isArchived: false
        }),
        Note.countDocuments({ 
          owner: userObjectId, 
          isArchived: true 
        })
      ]);

      stats.myNotes = myNotes;
      stats.sharedWithMe = sharedWithMe;
      stats.archivedNotes = archivedNotes;
    }

    return stats;
  }
};

module.exports = analyticsService;