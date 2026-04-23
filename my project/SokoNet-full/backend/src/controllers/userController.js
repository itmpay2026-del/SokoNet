/**
 * User Controller
 * Handles authentication, profile management, user operations
 */

const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class UserController {
  /**
   * Send OTP for phone verification
   */
  async sendOTP(req, res) {
    try {
      const { phone } = req.body;

      if (!phone) {
        return res.status(400).json({ success: false, message: 'Phone required' });
      }

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60000); // 10 minutes

      let user = await User.findOne({ phone });

      if (user) {
        user.otpCode = otp;
        user.otpExpiry = otpExpiry;
      } else {
        user = new User({
          phone,
          otpCode: otp,
          otpExpiry,
          userType: 'customer'
        });
      }

      await user.save();

      // In production, send via Twilio SMS
      console.log(`[OTP] ${phone}: ${otp}`);

      res.json({
        success: true,
        message: 'OTP sent to phone',
        // For testing only - remove in production
        otp: process.env.NODE_ENV === 'development' ? otp : undefined
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Verify OTP and create session
   */
  async verifyOTP(req, res) {
    try {
      const { phone, otp } = req.body;

      const user = await User.findOne({ phone });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      if (user.otpCode !== otp || user.otpExpiry < new Date()) {
        return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      }

      // Mark phone as verified
      user.isPhoneVerified = true;
      user.otpCode = null;
      user.otpExpiry = null;
      await user.save();

      // Generate JWT token
      const token = jwt.sign(
        { userId: user._id, phone: user.phone },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.json({
        success: true,
        token,
        user: {
          _id: user._id,
          phone: user.phone,
          firstName: user.firstName,
          userType: user.userType,
          avatar: user.avatar
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user profile
   */
  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.userId)
        .select('-otpCode -otpExpiry -password');

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update profile
   */
  async updateProfile(req, res) {
    try {
      const { firstName, lastName, bio, avatar, userType, skills } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        {
          firstName,
          lastName,
          bio,
          avatar,
          userType,
          ...(skills && { skills }),
          updatedAt: new Date()
        },
        { new: true, runValidators: true }
      );

      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Update location
   */
  async updateLocation(req, res) {
    try {
      const { latitude, longitude, address, city } = req.body;

      const user = await User.findByIdAndUpdate(
        req.user.userId,
        {
          location: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          address,
          city,
          updatedAt: new Date()
        },
        { new: true }
      );

      res.json({ success: true, user });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get nearby workers
   */
  async getNearbyWorkers(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      const workers = await User.find({
        userType: { $in: ['worker', 'business'] },
        isActive: true,
        isBlocked: false,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: parseFloat(radius) * 1000
          }
        }
      })
      .select('firstName lastName avatar averageRating skills location')
      .limit(30);

      res.json({ success: true, workers });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get worker stats (earnings, completion rate, etc.)
   */
  async getWorkerStats(req, res) {
    try {
      const Job = require('../models/Job');

      const completedJobs = await Job.countDocuments({
        acceptedWorkerId: req.user.userId,
        status: 'completed'
      });

      const totalJobs = await Job.countDocuments({
        acceptedWorkerId: req.user.userId
      });

      const user = await User.findById(req.user.userId);

      res.json({
        success: true,
        stats: {
          completedJobs,
          totalJobs,
          completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0,
          averageRating: user.averageRating,
          totalEarnings: user.totalEarnings,
          escrowBalance: user.escrowBalance,
          trustScore: user.trustScore
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Withdraw earnings
   */
  async withdrawEarnings(req, res) {
    try {
      const PaymentService = require('../services/PaymentService');
      const { amount } = req.body;

      const user = await User.findById(req.user.userId);

      if (user.escrowBalance < amount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance'
        });
      }

      const result = await PaymentService.withdrawEarnings(
        req.user.userId,
        amount,
        user.bankAccount
      );

      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();
