/**
 * Job Model
 * Represents service requests converted into live jobs
 * Features: Job status tracking, location-based matching, skill requirements
 */

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  // Job Details
  title: {
    type: String,
    required: true
  },
  description: String,
  category: {
    type: String,
    enum: ['plumbing', 'cleaning', 'delivery', 'handyman', 'beauty', 'tutoring', 'transport', 'custom'],
    required: true
  },
  subcategory: String,

  // Job Creator (Customer)
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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

  // Budget & Pricing
  budget: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'KES'
    }
  },
  suggestedPrice: Number, // From dynamic pricing engine
  finalPrice: Number, // Negotiated price after bid acceptance

  // Requirements
  requiredSkills: [String],
  estimatedDuration: String, // e.g., "2 hours", "1 day"
  deadline: Date,
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Status
  status: {
    type: String,
    enum: ['posted', 'accepted', 'in-progress', 'completed', 'cancelled', 'disputed'],
    default: 'posted'
  },
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],

  // Acceptance
  acceptedWorkerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  acceptedAt: Date,

  // Progress Tracking
  progressPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  milestones: [{
    title: String,
    percentage: Number,
    completed: Boolean,
    completedAt: Date
  }],
  startedAt: Date,
  completedAt: Date,

  // Images & Proofs
  images: [String],
  completionProof: [String],

  // Rating & Feedback
  customerRating: {
    rating: Number,
    review: String,
    ratedAt: Date
  },
  workerRating: {
    rating: Number,
    review: String,
    ratedAt: Date
  },

  // Payment
  paymentStatus: {
    type: String,
    enum: ['pending', 'escrowed', 'partially-released', 'completed', 'disputed'],
    default: 'pending'
  },

  // Search optimization
  searchTags: [String],

  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Index for location-based queries
jobSchema.index({ location: '2dsphere' });
jobSchema.index({ customerId: 1 });
jobSchema.index({ acceptedWorkerId: 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ category: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
