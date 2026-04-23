/**
 * USSD Controller
 * Handles offline USSD interactions
 */

const USSDService = require('../services/USSDService');

class USSDController {
  /**
   * Handle USSD request
   */
  async handleUSSDRequest(req, res) {
    try {
      const { phone, sessionId, userInput, isFirstRequest } = req.body;

      const response = await USSDService.handleUSSDRequest({
        phone,
        sessionId,
        userInput,
        isFirstRequest
      });

      res.json({ success: true, response });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * USSD Registration
   */
  async registerViaUSSD(req, res) {
    try {
      const { phone } = req.body;

      const result = await USSDService.registerViaUSSD(phone);

      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Send SMS job alert
   */
  async sendJobAlert(req, res) {
    try {
      const { jobId } = req.params;
      const Job = require('../models/Job');

      const job = await Job.findById(jobId);

      const nearbyUsers = []; // Get nearby users from location service

      await USSDService.sendJobAlertSMS(req.user.userId, nearbyUsers);

      res.json({ success: true, message: 'Job alert sent' });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new USSDController();
