/**
 * User Model
 * Represents both customers and service providers/workers
 * Features: Phone auth, profile, location, ratings, escrow balance
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Identity
  phone: {
    type: String,
    required: true,
    unique: true,
    sparse: true
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    sparse: true,
    unique: true
  },
  
  // Authentication
  otpCode: String,
  otpExpiry: Date,
  password: String,
  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  // Profile
  avatar: String,
  bio: String,
  userType: {
    type: String,
    enum: ['customer', 'worker', 'business'],
    required: true
  },

  // Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      index: '2dsphere'
    }
  },
  address: String,
  city: String,
  region: String,

  // Worker-specific fields
  skills: [String],
  skillVerifications: [{
    skill: String,
    proofUrl: String,
    endorsements: Number,
    verified: Boolean,
    verifiedAt: Date
  }],
  availableHours: {
    startTime: String,
    endTime: String,
    daysAvailable: [String]
  },
  bankAccount: {
    accountName: String,
    accountNumber: String,
    bankName: String
  },

  // Business-specific fields
  businessName: String,
  businessCategory: String,
  businessRegistration: String,

  // Financial
  escrowBalance: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  totalSpent: {
    type: Number,
    default: 0
  },
  serviceCredits: {
    type: Number,
    default: 0
  },
  creditLimit: {
    type: Number,
    default: 5000
  },

  // Ratings & Trust
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  trustScore: {
    type: Number,
    default: 50
  },

  // Preferences
  preferences: {
    notifications: {
      email: Boolean,
      sms: Boolean,
      push: Boolean
    },
    language: {
      type: String,
      default: 'en'
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },

  // Account Status
  isActive: {
    type: Boolean,
    default: true
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  suspensionReason: String,
  suspensionUntil: Date,

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for location queries
userSchema.index({ location: '2dsphere' });
userSchema.index({ phone: 1 });
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });

module.exports = mongoose.model('User', userSchema);
