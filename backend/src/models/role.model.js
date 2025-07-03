const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['admin', 'user']
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'delete', 'manage_users', 'view_analytics']
  }],
  description: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);