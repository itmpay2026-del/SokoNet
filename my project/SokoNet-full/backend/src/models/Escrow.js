/**
 * Escrow Model
 * Manages secure payment holding and milestone-based release
 * Features: Multi-milestone payment release, dispute handling
 */

const mongoose = require('mongoose');

const escrowSchema = new mongoose.Schema({
  // Transaction Details
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Amount
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'KES'
  },
  platformFee: Number,
  netAmount: Number,

  // Milestones (Staged payments)
  milestones: [{
    title: String,
    percentage: Number,
    amount: Number,
    condition: String, // e.g., "job_started", "50%_complete", "job_completed"
    status: {
      type: String,
      enum: ['pending', 'released', 'held', 'disputed'],
      default: 'pending'
    },
    releaseApprovedAt: Date,
    releaseDate: Date
  }],

  // Payment Method
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank-transfer', 'service-credit'],
    required: true
  },
  mpesaReference: String,
  transactionId: String,

  // Status
  status: {
    type: String,
    enum: ['created', 'funded', 'active', 'partially-released', 'completed', 'disputed', 'refunded'],
    default: 'created'
  },

  // Dispute
  isDisputed: {
    type: Boolean,
    default: false
  },
  disputeReason: String,
  disputeInitiatedBy: {
    type: String,
    enum: ['customer', 'worker', 'admin']
  },
  disputeInitiatedAt: Date,

  // Dates
  createdAt: {
    type: Date,
    default: Date.now
  },
  fundedAt: Date,
  completedAt: Date,
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30 * 24 * 60 * 60 * 1000) // 30 days
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Indexes
escrowSchema.index({ jobId: 1 });
escrowSchema.index({ customerId: 1 });
escrowSchema.index({ workerId: 1 });
escrowSchema.index({ status: 1 });

module.exports = mongoose.model('Escrow', escrowSchema);
