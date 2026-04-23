/**
 * Dashboard Routes
 */

const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Job = require('../models/Job');
const authMiddleware = require('../middleware/auth');

// Get income dashboard
router.get('/income', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    const completedJobs = await Job.countDocuments({
      acceptedWorkerId: req.user.userId,
      status: 'completed'
    });

    const thisMonthEarnings = await Job.aggregate([
      {
        $match: {
          acceptedWorkerId: req.user.userId,
          status: 'completed',
          completedAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      dashboard: {
        totalEarnings: user.totalEarnings,
        thisMonthEarnings: thisMonthEarnings[0]?.total || 0,
        escrowBalance: user.escrowBalance,
        completedJobs,
        averageRating: user.averageRating,
        trustScore: user.trustScore
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get customer dashboard
router.get('/customer', authMiddleware, async (req, res) => {
  try {
    const activeJobs = await Job.countDocuments({
      customerId: req.user.userId,
      status: { $in: ['posted', 'accepted', 'in-progress'] }
    });

    const completedJobs = await Job.countDocuments({
      customerId: req.user.userId,
      status: 'completed'
    });

    const thisMonthSpent = await Job.aggregate([
      {
        $match: {
          customerId: req.user.userId,
          status: 'completed',
          completedAt: {
            $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$finalPrice' }
        }
      }
    ]);

    res.json({
      success: true,
      dashboard: {
        activeJobs,
        completedJobs,
        thisMonthSpent: thisMonthSpent[0]?.total || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
