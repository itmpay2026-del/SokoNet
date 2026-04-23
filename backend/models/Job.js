const mongoose = require('mongoose');

/**
 * Job Schema
 * Represents service requests or product orders converted into jobs
 * Jobs can be bid on by workers or accepted directly
 */
const jobSchema = new mongoose.Schema({
  // Job Basic Information
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['cleaning', 'plumbing', 'delivery', 'tutoring', 'handyman', 'gardening', 'other'],
    required: true
  },
  
  // Job Type
  jobType: {
    type: String,
    enum: ['service', 'product_delivery', 'micro_franchise'],
    default: 'service'
  },
  
  // Customer Information
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Job Location
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    },
    address: String
  },
  
  // Pricing
  pricing: {
    basePrice: Number,
    dynamicPrice: Number,
    currency: {
      type: String,
      default: 'KES'
    },
    priceType: {
      type: String,
      enum: ['fixed', 'hourly', 'negotiable'],
      default: 'fixed'
    }
  },
  
  // Timeline
  scheduledDate: Date,
  estimatedDuration: Number,
  
  // Status
  status: {
    type: String,
    enum: ['open', 'bidding', 'assigned', 'in_progress', 'completed', 'cancelled', 'disputed'],
    default: 'open'
  },
  
  // Worker Assignment
  assignedWorkerId: mongoose.Schema.Types.ObjectId,
  acceptedBids: [{
    workerId: mongoose.Schema.Types.ObjectId,
    proposedPrice: Number,
    message: String,
    submittedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending'
    }
  }],
  
  // Escrow Information
  escrow: {
    status: {
      type: String,
      enum: ['pending', 'held', 'released', 'refunded'],
      default: 'pending'
    },
    totalAmount: Number,
    milestones: [{
      stage: {
        type: String,
        enum: ['start', 'mid', 'completion'],
        default: 'start'
      },
      amount: Number,
      released: {
        type: Boolean,
        default: false
      },
      releasedAt: Date
    }]
  },
  
  // Work Progress
  progress: {
    stage: {
      type: String,
      enum: ['not_started', 'started', 'halfway', 'completed'],
      default: 'not_started'
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    updates: [{
      message: String,
      timestamp: Date,
      proofOfWork: String
    }]
  },
  
  // Required Skills
  requiredSkills: [String],
  
  // Trust Circle Preference
  preferredTrustCircle: mongoose.Schema.Types.ObjectId,
  
  // Rating & Review
  rating: {
    workersRating: Number,
    customersRating: Number,
    customerReview: String,
    workerReview: String
  },
  
  // Additional Features
  requiresVerification: {
    type: Boolean,
    default: false
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  allowServiceCredit: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true,
  collection: 'jobs'
});

jobSchema.index({ 'location.coordinates': '2dsphere' });
jobSchema.index({ customerId: 1, createdAt: -1 });
jobSchema.index({ assignedWorkerId: 1, status: 1 });

module.exports = mongoose.model('Job', jobSchema);