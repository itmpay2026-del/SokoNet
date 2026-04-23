/**
 * TrustCircle Model
 * Manages user-created trusted groups and priority matching
 * Features: Group creation, member management, priority job matching
 */

const mongoose = require('mongoose');

const trustCircleSchema = new mongoose.Schema({
  // Circle Details
  name: {
    type: String,
    required: true
  },
  description: String,

  // Creator
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Members
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    trustLevel: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    }
  }],

  // Visibility
  isPublic: {
    type: Boolean,
    default: false
  },

  // Settings
  preferredCategories: [String],
  priorityLevel: {
    type: Number,
    default: 1,
    min: 1,
    max: 5
  },

  // Statistics
  totalJobsCompleted: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
trustCircleSchema.index({ creatorId: 1 });
trustCircleSchema.index({ 'members.userId': 1 });

module.exports = mongoose.model('TrustCircle', trustCircleSchema);
