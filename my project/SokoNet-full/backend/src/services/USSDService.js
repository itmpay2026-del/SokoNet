/**
 * USSD Simulation Service
 * Simulates offline USSD (Unstructured Supplementary Service Data) interactions
 * Allows feature access via mobile phone menu for users without data
 * Features: Menu navigation, balance checking, job alerts via SMS
 */

const User = require('../models/User');
const Job = require('../models/Job');

class USSDService {
  constructor() {
    this.menus = {
      MAIN: {
        title: 'SokoNet',
        options: [
          { key: '1', label: 'Find Jobs' },
          { key: '2', label: 'My Jobs' },
          { key: '3', label: 'My Balance' },
          { key: '4', label: 'Help' }
        ]
      },
      FIND_JOBS: {
        title: 'Find Jobs Near You',
        options: [
          { key: '1', label: 'Delivery Jobs' },
          { key: '2', label: 'Cleaning Jobs' },
          { key: '3', label: 'Handyman Jobs' },
          { key: '0', label: 'Back' }
        ]
      },
      MY_JOBS: {
        title: 'My Jobs',
        options: [
          { key: '1', label: 'Active Jobs' },
          { key: '2', label: 'Completed Jobs' },
          { key: '3', label: 'Earnings' },
          { key: '0', label: 'Back' }
        ]
      }
    };
  }

  /**
   * Handle incoming USSD request
   * @param {Object} ussdData - Phone, sessionId, userInput, etc.
   */
  async handleUSSDRequest(ussdData) {
    try {
      const { phone, sessionId, userInput = '', isFirstRequest = false } = ussdData;

      // Find or create user
      let user = await User.findOne({ phone });

      if (!user) {
        return this.sendUSSDResponse(
          'Welcome to SokoNet! Press 1 to Register',
          sessionId,
          false
        );
      }

      // Parse user input and determine menu level
      const currentMenu = isFirstRequest ? 'MAIN' : this.parseMenuSelection(userInput);

      // Generate response based on menu
      const response = await this.generateMenuResponse(currentMenu, user, userInput);

      return this.sendUSSDResponse(response, sessionId, true);
    } catch (error) {
      console.error('USSD error:', error);
      return this.sendUSSDResponse('Service temporarily unavailable. Try again later.', sessionId, false);
    }
  }

  /**
   * Parse user menu selection
   */
  parseMenuSelection(input) {
    const mapping = {
      '1': 'FIND_JOBS',
      '2': 'MY_JOBS',
      '3': 'BALANCE',
      '4': 'HELP',
      '0': 'MAIN'
    };

    return mapping[input] || 'MAIN';
  }

  /**
   * Generate USSD menu response
   */
  async generateMenuResponse(menu, user, userInput) {
    switch (menu) {
      case 'FIND_JOBS':
        return await this.getJobsMenu(user);

      case 'MY_JOBS':
        return await this.getMyJobsMenu(user);

      case 'BALANCE':
        return `Your Balance:\nEarnings: KES ${Math.round(user.escrowBalance)}\nPress 1 to Withdraw`;

      case 'HELP':
        return 'SokoNet Help\n1. Find jobs in your area\n2. Get paid via M-Pesa\n3. Build trust score';

      default:
        const mainMenu = this.menus.MAIN;
        return `${mainMenu.title}\n${mainMenu.options.map(o => `${o.key}. ${o.label}`).join('\n')}`;
    }
  }

  /**
   * Get nearby jobs via USSD
   */
  async getJobsMenu(user) {
    try {
      // Get nearby jobs
      const jobs = await Job.find({
        status: 'posted',
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: user.location.coordinates
            },
            $maxDistance: 50000
          }
        }
      })
      .sort({ urgency: -1 })
      .limit(3);

      if (jobs.length === 0) {
        return 'No jobs available near you. Try again later.';
      }

      let response = 'Available Jobs:\n';
      jobs.forEach((job, idx) => {
        response += `${idx + 1}. ${job.title} - KES ${job.budget.max}\n`;
      });
      response += '0. Back';

      return response;
    } catch (error) {
      return 'Unable to fetch jobs. Try again.';
    }
  }

  /**
   * Get user's active jobs via USSD
   */
  async getMyJobsMenu(user) {
    try {
      const activeJobs = await Job.find({
        acceptedWorkerId: user._id,
        status: { $in: ['accepted', 'in-progress'] }
      }).limit(3);

      const completedJobs = await Job.countDocuments({
        acceptedWorkerId: user._id,
        status: 'completed'
      });

      let response = `My Jobs:\n`;
      response += `Active: ${activeJobs.length}\n`;
      response += `Completed: ${completedJobs}\n`;

      if (activeJobs.length > 0) {
        response += `\n${activeJobs[0].title} (${activeJobs[0].progressPercentage}%)\n`;
      }

      response += '0. Back';

      return response;
    } catch (error) {
      return 'Unable to fetch jobs. Try again.';
    }
  }

  /**
   * Send USSD response
   */
  sendUSSDResponse(message, sessionId, continueSession = true) {
    return {
      sessionId,
      message,
      continueSession
    };
  }

  /**
   * Send SMS job alert (for USSD users)
   */
  async sendJobAlertSMS(userId, jobs) {
    try {
      const user = await User.findById(userId);

      if (!user || !user.phone) {
        return;
      }

      // In production, would use Twilio SMS API
      const message = `SokoNet: ${jobs.length} new jobs near you! USSD: *384*90#`;

      console.log(`[SMS] To: ${user.phone} - ${message}`);

      return true;
    } catch (error) {
      console.error('SMS sending failed:', error);
      return false;
    }
  }

  /**
   * USSD Registration Flow
   */
  async registerViaUSSD(phone) {
    try {
      // Check if user exists
      const existingUser = await User.findOne({ phone });

      if (existingUser) {
        return {
          success: false,
          message: 'Phone number already registered'
        };
      }

      // Create user
      const newUser = new User({
        phone,
        userType: 'worker',
        isPhoneVerified: true,
        isActive: true
      });

      await newUser.save();

      return {
        success: true,
        message: 'Registration successful! Welcome to SokoNet.',
        userId: newUser._id
      };
    } catch (error) {
      console.error('USSD registration error:', error);
      return {
        success: false,
        message: 'Registration failed. Please try again.'
      };
    }
  }
}

module.exports = new USSDService();
