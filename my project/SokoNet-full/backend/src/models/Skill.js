/**
 * Skill Model
 * Manages verified skills and endorsements
 * Features: Skill verification, proof uploads, community endorsements
 */

const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  // Skill Details
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  skillName: {
    type: String,
    required: true
  },
  skillCategory: String,
  proficiencyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    default: 'beginner'
  },

  // Proof & Verification
  proofDocuments: [{
    type: {
      type: String,
      enum: ['certificate', 'image', 'video', 'portfolio']
    },
    url: String,
    uploadedAt: Date
  }],

  // Community Endorsements
  endorsements: [{
    endorsedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    endorsedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Verification Status
  verificationStatus: {
    type: String,
    enum: ['unverified', 'pending', 'verified', 'flagged'],
    default: 'unverified'
  },
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Statistics
  endorsementCount: {
    type: Number,
    default: 0
  },
  averageEndorsementRating: {
    type: Number,
    default: 0
  },
  jobsCompletedWithSkill: {
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
skillSchema.index({ workerId: 1 });
skillSchema.index({ skillName: 1 });
skillSchema.index({ verificationStatus: 1 });

module.exports = mongoose.model('Skill', skillSchema);
