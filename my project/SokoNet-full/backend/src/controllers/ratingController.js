/**
 * Rating Controller
 * Manages user ratings and reviews
 */

const Rating = require('../models/Rating');
const User = require('../models/User');
const Job = require('../models/Job');

class RatingController {
  /**
   * Submit rating
   */
  async submitRating(req, res) {
    try {
      const { jobId, rateeId, ratingType, overallRating, categoryRatings, review, tags } = req.body;

      const job = await Job.findById(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      const rating = new Rating({
        jobId,
        raterId: req.user.userId,
        rateeId,
        ratingType,
        overallRating,
        categoryRatings,
        review,
        tags
      });

      await rating.save();

      // Update user average rating
      const allRatings = await Rating.find({ rateeId });
      const avgRating = (allRatings.reduce((sum, r) => sum + r.overallRating, 0) / allRatings.length).toFixed(2);

      await User.findByIdAndUpdate(rateeId, {
        averageRating: parseFloat(avgRating),
        totalRatings: allRatings.length
      });

      // Notify rated user via Socket.IO
      const io = require('../index').io;
      io.to(`user:${rateeId}`).emit('rating:received', {
        rating: overallRating,
        raterName: req.body.raterName,
        review,
        jobTitle: job.title
      });

      res.status(201).json({ success: true, rating });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user ratings
   */
  async getUserRatings(req, res) {
    try {
      const { userId } = req.params;

      const ratings = await Rating.find({ rateeId: userId })
        .populate('raterId', 'firstName lastName avatar')
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({ success: true, ratings });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get my ratings
   */
  async getMyRatings(req, res) {
    try {
      const ratings = await Rating.find({ rateeId: req.user.userId })
        .populate('raterId', 'firstName lastName avatar')
        .sort({ createdAt: -1 });

      res.json({ success: true, ratings });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Flag rating
   */
  async flagRating(req, res) {
    try {
      const { ratingId } = req.params;
      const { reason } = req.body;

      const rating = await Rating.findByIdAndUpdate(ratingId, {
        flagged: true,
        flagReason: reason
      }, { new: true });

      res.json({ success: true, rating });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new RatingController();
