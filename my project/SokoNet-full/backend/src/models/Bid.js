/**
 * Bid Model
 * Represents worker bids/offers on job postings
 * Features: Real-time bidding, offer management, bid acceptance
 */

const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
  // Bid Details
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Offer
  bidAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  proposedDuration: String, // e.g., "2 hours"
  message: String,

  // Bid Status
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'withdrawn'],
    default: 'pending'
  },

  // Timeline
  biddedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,

  // Worker Rating (snapshot)
  workerRating: Number,
  workerCompletionRate: Number,

  createdAt: {
    type: Date,
    default: Date.now,
    expire: 604800 // Auto-delete bids after 7 days
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
bidSchema.index({ jobId: 1 });
bidSchema.index({ workerId: 1 });
bidSchema.index({ status: 1 });
bidSchema.index({ biddedAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);
