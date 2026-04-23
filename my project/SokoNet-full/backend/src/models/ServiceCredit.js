/**
 * ServiceCredit Model
 * Manages deferred payment system (Work Now, Pay Later)
 * Features: Credit tracking, payment scheduling, dispute resolution
 */

const mongoose = require('mongoose');

const serviceCreditSchema = new mongoose.Schema({
  // Credit Details
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },

  // Amount
  creditAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  remainingAmount: Number,
  currency: {
    type: String,
    default: 'KES'
  },

  // Dates
  issuedAt: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  paidAt: Date,

  // Status
  status: {
    type: String,
    enum: ['issued', 'partial', 'paid', 'overdue', 'written-off'],
    default: 'issued'
  },

  // Payment Schedule
  paymentSchedule: [{
    installmentNumber: Number,
    dueDate: Date,
    amount: Number,
    paidDate: Date,
    status: {
      type: String,
      enum: ['pending', 'paid', 'overdue'],
      default: 'pending'
    }
  }],

  // Interest
  interestRate: {
    type: Number,
    default: 0.05 // 5% default
  },
  totalInterest: {
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

// Index
serviceCreditSchema.index({ userId: 1 });
serviceCreditSchema.index({ jobId: 1 });
serviceCreditSchema.index({ status: 1 });

module.exports = mongoose.model('ServiceCredit', serviceCreditSchema);
