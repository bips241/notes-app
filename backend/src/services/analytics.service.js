const Note = require('../models/notes.model');
const User = require('../models/user.model');

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

    if (userRole === 'admin') {
      // Admin stats
      stats.totalUsers = await User.countDocuments();
      stats.totalNotes = await Note.countDocuments();
      stats.activeUsers = await User.countDocuments({ isActive: true });
      stats.archivedNotes = await Note.countDocuments({ isArchived: true });
    } else {
      // User stats
      stats.myNotes = await Note.countDocuments({ owner: userId });
      stats.sharedWithMe = await Note.countDocuments({ 'sharedWith.user': userId });
      stats.archivedNotes = await Note.countDocuments({ 
        owner: userId, 
        isArchived: true 
      });
    }

    return stats;
  }
};

module.exports = analyticsService;