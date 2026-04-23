/**
 * Payment & Escrow Controller
 * Manages payment processing and escrow logic
 */

const PaymentService = require('../services/PaymentService');
const Escrow = require('../models/Escrow');
const ServiceCredit = require('../models/ServiceCredit');
const Job = require('../models/Job');

class PaymentController {
  /**
   * Create escrow for job
   */
  async createEscrow(req, res) {
    try {
      const { jobId, amount, paymentMethod, milestones } = req.body;

      const job = await Job.findById(jobId);

      if (!job) {
        return res.status(404).json({ success: false, message: 'Job not found' });
      }

      if (job.customerId.toString() !== req.user.userId) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      const escrow = await PaymentService.createEscrow({
        jobId,
        customerId: req.user.userId,
        workerId: job.acceptedWorkerId,
        totalAmount: amount,
        paymentMethod,
        milestones
      });

      res.status(201).json({ success: true, escrow });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Process M-Pesa payment
   */
  async processM-PesaPayment(req, res) {
    try {
      const { phone, amount, escrowId } = req.body;

      const result = await PaymentService.processM-PesaPayment({
        phone,
        amount,
        escrowId
      });

      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Release milestone payment
   */
  async releaseMilestonePayment(req, res) {
    try {
      const { escrowId, milestoneIndex } = req.body;
      const { jobId } = req.params;

      const escrow = await PaymentService.releaseMilestonePayment(
        escrowId,
        milestoneIndex,
        jobId
      );

      res.json({ success: true, escrow });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get escrow details
   */
  async getEscrow(req, res) {
    try {
      const { escrowId } = req.params;

      const escrow = await Escrow.findById(escrowId)
        .populate('customerId', 'firstName lastName')
        .populate('workerId', 'firstName lastName');

      if (!escrow) {
        return res.status(404).json({ success: false, message: 'Escrow not found' });
      }

      res.json({ success: true, escrow });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Issue service credit
   */
  async issueServiceCredit(req, res) {
    try {
      const { jobId, creditAmount, daysToPayback } = req.body;

      const serviceCredit = await PaymentService.issueServiceCredit({
        userId: req.user.userId,
        jobId,
        creditAmount,
        daysToPayback
      });

      res.status(201).json({ success: true, serviceCredit });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Record service credit payment
   */
  async recordCreditPayment(req, res) {
    try {
      const { serviceCreditId } = req.params;
      const { amount } = req.body;

      const serviceCredit = await PaymentService.recordCreditPayment(serviceCreditId, amount);

      res.json({ success: true, serviceCredit });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Get user's service credits
   */
  async getServiceCredits(req, res) {
    try {
      const credits = await ServiceCredit.find({ userId: req.user.userId })
        .sort({ createdAt: -1 });

      res.json({ success: true, credits });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Dispute payment
   */
  async disputePayment(req, res) {
    try {
      const { escrowId } = req.params;
      const { reason } = req.body;

      const escrow = await PaymentService.disputePayment(escrowId, reason, 'customer');

      res.json({ success: true, escrow });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * Withdraw earnings
   */
  async withdrawEarnings(req, res) {
    try {
      const { amount, bankAccount } = req.body;

      const result = await PaymentService.withdrawEarnings(
        req.user.userId,
        amount,
        bankAccount
      );

      res.json({ success: true, result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PaymentController();
