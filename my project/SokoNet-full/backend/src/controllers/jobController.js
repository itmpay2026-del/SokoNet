/**
 * Job Controller
 * Manages job creation, search, and management
 */

const Job = require('../models/Job');
const JobConversionEngine = require('../services/JobConversionEngine');
const SkillMatchingService = require('../services/SkillMatchingService');
const LocationService = require('../services/LocationService');

class JobController {
  /**
   * Create job (from service request)
   */
  async createJob(req, res) {
    try {
      const { title, description, category, location, budget, requiredSkills, urgency } = req.body;

      const job = await JobConversionEngine.convertSearchToJob({
        serviceType: title,
        description,
        location,
        budget,
        urgency,
        requiredSkills
      }, req.user.userId);

      res.status(201).json({ success: true, job });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get nearby jobs
   */
  async getNearbyJobs(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      const jobs = await LocationService.getNearbyJobs(
        [parseFloat(longitude), parseFloat(latitude)],
        parseFloat(radius)
      );

      res.json({ success: true, jobs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get job details
   */
  async getJobDetails(req, res) {
    try {
      const { jobId } = req.params;

      const job = await Job.findById(jobId)
        .populate('customerId', 'firstName lastName avatar averageRating')
        .populate('acceptedWorkerId', 'firstName lastName avatar averageRating');

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      res.json({ success: true, job });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get my posted jobs
   */
  async getMyJobs(req, res) {
    try {
      const jobs = await Job.find({
        customerId: req.user.userId
      })
      .sort({ createdAt: -1 });

      res.json({ success: true, jobs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update job status
   */
  async updateJobStatus(req, res) {
    try {
      const { jobId } = req.params;
      const { status, progressPercentage, notes } = req.body;

      const job = await Job.findById(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      if (job.customerId.toString() !== req.user.userId && job.acceptedWorkerId?.toString() !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      // Update status history
      job.statusHistory.push({
        status,
        notes
      });

      if (status === 'in-progress' && !job.startedAt) {
        job.startedAt = new Date();
      }

      if (status === 'completed') {
        job.completedAt = new Date();
        job.progressPercentage = 100;
      } else if (progressPercentage !== undefined) {
        job.progressPercentage = progressPercentage;
      }

      job.status = status;
      await job.save();

      // Broadcast update via Socket.IO
      const io = require('../index').io;
      io.to(`job:${jobId}`).emit('job:status-updated', {
        jobId,
        status,
        progressPercentage: job.progressPercentage
      });

      res.json({ success: true, job });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Search jobs
   */
  async searchJobs(req, res) {
    try {
      const { query, category, maxBudget, minBudget } = req.query;

      const searchFilter = {};

      if (query) {
        searchFilter.$or = [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { searchTags: query.toLowerCase() }
        ];
      }

      if (category) {
        searchFilter.category = category;
      }

      if (minBudget || maxBudget) {
        searchFilter['budget.max'] = {};
        if (minBudget) searchFilter['budget.max'].$gte = parseInt(minBudget);
        if (maxBudget) searchFilter['budget.max'].$lte = parseInt(maxBudget);
      }

      const jobs = await Job.find(searchFilter)
        .sort({ createdAt: -1 })
        .limit(50);

      res.json({ success: true, jobs });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get income opportunities based on skills
   */
  async getIncomeOpportunities(req, res) {
    try {
      const { latitude, longitude } = req.query;

      const opportunities = await SkillMatchingService.getIncomeOpportunities(
        req.user.userId,
        {
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        }
      );

      res.json({ success: true, opportunities });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get skill suggestions
   */
  async getSkillSuggestions(req, res) {
    try {
      const { latitude, longitude } = req.query;

      const suggestions = await SkillMatchingService.suggestSkillsToLearn(
        req.user.userId,
        {
          coordinates: [parseFloat(longitude), parseFloat(latitude)]
        }
      );

      res.json({ success: true, suggestions });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Cancel job
   */
  async cancelJob(req, res) {
    try {
      const { jobId } = req.params;

      const job = await Job.findById(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      if (job.customerId.toString() !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      job.status = 'cancelled';
      await job.save();

      res.json({ success: true, message: 'Job cancelled' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new JobController();
