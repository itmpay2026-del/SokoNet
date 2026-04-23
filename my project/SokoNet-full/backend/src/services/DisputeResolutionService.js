/**
 * Dispute Resolution Service
 * Handles community-based dispute resolution and voting
 * Features: Dispute mediation, community voting, fair resolution
 */

const mongoose = require('mongoose');

const disputeSchema = new mongoose.Schema({
  escrowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Escrow',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  complainantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  respondentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Dispute Details
  title: String,
  description: String,
  evidence: [String], // File URLs
  reportedAt: {
    type: Date,
    default: Date.now
  },

  // Resolution Type
  resolutionType: {
    type: String,
    enum: ['full-refund', 'partial-refund', 'no-refund', 'split-payment'],
    default: null
  },

  // Community Voting
  votes: [{
    voterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['complainant', 'respondent', 'neutral']
    },
    reasoning: String,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Status
  status: {
    type: String,
    enum: ['open', 'under-review', 'voting', 'resolved', 'closed'],
    default: 'open'
  },

  // Resolution
  resolutionAmount: Number,
  resolvedAt: Date,
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolutionNotes: String
});

const Dispute = mongoose.model('Dispute', disputeSchema);

class DisputeResolutionService {
  /**
   * Open a dispute
   */
  async openDispute(disputeData) {
    try {
      const {
        escrowId,
        jobId,
        complainantId,
        respondentId,
        title,
        description,
        evidence
      } = disputeData;

      const dispute = new Dispute({
        escrowId,
        jobId,
        complainantId,
        respondentId,
        title,
        description,
        evidence,
        status: 'open'
      });

      await dispute.save();

      return dispute;
    } catch (error) {
      throw new Error(`Dispute opening failed: ${error.message}`);
    }
  }

  /**
   * Submit community vote
   */
  async submitVote(disputeId, voterId, vote, reasoning) {
    try {
      const dispute = await Dispute.findById(disputeId);

      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Check if user already voted
      const existingVote = dispute.votes.find(v => v.voterId.toString() === voterId);

      if (existingVote) {
        throw new Error('You have already voted on this dispute');
      }

      dispute.votes.push({
        voterId,
        vote,
        reasoning,
        votedAt: new Date()
      });

      // Auto-resolve after 20 votes or 7 days
      if (dispute.votes.length >= 20) {
        await this.resolveDisputeByVoting(disputeId);
      }

      await dispute.save();

      return dispute;
    } catch (error) {
      throw new Error(`Vote submission failed: ${error.message}`);
    }
  }

  /**
   * Resolve dispute based on community voting
   */
  async resolveDisputeByVoting(disputeId) {
    try {
      const dispute = await Dispute.findById(disputeId);

      if (!dispute) {
        throw new Error('Dispute not found');
      }

      // Count votes
      const complainantVotes = dispute.votes.filter(v => v.vote === 'complainant').length;
      const respondentVotes = dispute.votes.filter(v => v.vote === 'respondent').length;
      const neutralVotes = dispute.votes.filter(v => v.vote === 'neutral').length;

      const totalVotes = dispute.votes.length;

      let resolutionType;
      let resolutionAmount = 0;

      // Determine resolution based on votes
      if (complainantVotes > respondentVotes + neutralVotes) {
        resolutionType = 'full-refund';
        resolutionAmount = 0; // Refund to customer
      } else if (respondentVotes > complainantVotes + neutralVotes) {
        resolutionType = 'no-refund';
        resolutionAmount = null;
      } else {
        resolutionType = 'split-payment';
        resolutionAmount = null; // 50-50 split
      }

      dispute.resolutionType = resolutionType;
      dispute.resolutionAmount = resolutionAmount;
      dispute.status = 'resolved';
      dispute.resolvedAt = new Date();

      await dispute.save();

      return dispute;
    } catch (error) {
      throw new Error(`Dispute resolution failed: ${error.message}`);
    }
  }

  /**
   * Get pending disputes for voting
   */
  async getPendingDisputesForVoting(userId) {
    try {
      const disputes = await Dispute.find({
        status: 'voting',
        votes: {
          $not: {
            $elemMatch: { voterId: new mongoose.Types.ObjectId(userId) }
          }
        }
      })
      .populate('complainantId respondentId', 'firstName lastName avatar')
      .sort({ reportedAt: -1 })
      .limit(10);

      return disputes;
    } catch (error) {
      throw new Error(`Failed to fetch pending disputes: ${error.message}`);
    }
  }

  /**
   * Admin manual resolution
   */
  async adminResolveDispute(disputeId, resolutionType, resolutionAmount, resolvedBy, notes) {
    try {
      const dispute = await Dispute.findByIdAndUpdate(disputeId, {
        resolutionType,
        resolutionAmount,
        status: 'resolved',
        resolvedAt: new Date(),
        resolvedBy,
        resolutionNotes: notes
      }, { new: true });

      return dispute;
    } catch (error) {
      throw new Error(`Admin resolution failed: ${error.message}`);
    }
  }
}

module.exports = {
  Dispute,
  service: new DisputeResolutionService()
};
