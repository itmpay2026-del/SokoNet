/**
 * Bid Controller
 * Manages real-time bidding on jobs
 */

const Bid = require('../models/Bid');
const Job = require('../models/Job');
const User = require('../models/User');

class BidController {
  /**
   * Place bid on job
   */
  async placeBid(req, res) {
    try {
      const { jobId, bidAmount, proposedDuration, message } = req.body;

      const job = await Job.findById(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      if (job.status !== 'posted') {
        return res.status(400).json({ success: false, message: 'Job not accepting bids' });
      }

      const worker = await User.findById(req.user.userId);

      // Create bid
      const bid = new Bid({
        jobId,
        workerId: req.user.userId,
        bidAmount,
        proposedDuration,
        message,
        workerRating: worker.averageRating,
        workerCompletionRate: 75 // Calculate from actual data
      });

      await bid.save();

      // Emit to job room via Socket.IO
      const io = require('../index').io;
      io.to(`job:${jobId}`).emit('bid:placed', {
        bidId: bid._id,
        workerId: req.user.userId,
        workerName: `${worker.firstName} ${worker.lastName}`,
        bidAmount,
        rating: worker.averageRating,
        timestamp: new Date()
      });

      res.status(201).json({ success: true, bid });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get bids for a job
   */
  async getJobBids(req, res) {
    try {
      const { jobId } = req.params;

      const bids = await Bid.find({ jobId, status: 'pending' })
        .populate('workerId', 'firstName lastName avatar averageRating')
        .sort({ bidAmount: 1, biddedAt: -1 });

      res.json({ success: true, bids });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Accept bid
   */
  async acceptBid(req, res) {
    try {
      const { bidId } = req.params;

      const bid = await Bid.findById(bidId);

      if (!bid) {
        return res.status(404).json({ success: false, message: 'Bid not found' });
      }

      const job = await Job.findById(bid.jobId);

      if (job.customerId.toString() !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Update bid status
      bid.status = 'accepted';
      bid.acceptedAt = new Date();
      await bid.save();

      // Update job
      job.acceptedWorkerId = bid.workerId;
      job.finalPrice = bid.bidAmount;
      job.status = 'accepted';
      await job.save();

      // Reject other bids
      await Bid.updateMany(
        { jobId: bid.jobId, _id: { $ne: bidId }, status: 'pending' },
        { status: 'rejected', rejectionReason: 'Other bid accepted' }
      );

      // Notify worker
      const io = require('../index').io;
      io.to(`worker:${bid.workerId}`).emit('bid:accepted', {
        jobId: bid.jobId,
        bidId,
        jobTitle: job.title,
        amount: bid.bidAmount
      });

      res.json({ success: true, message: 'Bid accepted', bid });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Reject bid
   */
  async rejectBid(req, res) {
    try {
      const { bidId } = req.params;
      const { reason } = req.body;

      const bid = await Bid.findByIdAndUpdate(bidId, {
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date()
      }, { new: true });

      res.json({ success: true, bid });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Withdraw bid
   */
  async withdrawBid(req, res) {
    try {
      const { bidId } = req.params;

      const bid = await Bid.findById(bidId);

      if (bid.workerId.toString() !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      bid.status = 'withdrawn';
      await bid.save();

      res.json({ success: true, message: 'Bid withdrawn' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get my bids
   */
  async getMyBids(req, res) {
    try {
      const bids = await Bid.find({ workerId: req.user.userId })
        .populate('jobId', 'title category budget')
        .sort({ biddedAt: -1 });

      res.json({ success: true, bids });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BidController();
