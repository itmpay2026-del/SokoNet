/**
 * Payment & Escrow Service
 * Handles secure payment processing with escrow logic
 * Features: M-Pesa simulation, milestone releases, dispute handling
 */

const Escrow = require('../models/Escrow');
const ServiceCredit = require('../models/ServiceCredit');
const User = require('../models/User');
const Job = require('../models/Job');

class PaymentService {
  /**
   * Create escrow transaction with milestones
   * @param {Object} paymentData - Payment details
   * @returns {Object} Created escrow record
   */
  async createEscrow(paymentData) {
    try {
      const {
        jobId,
        customerId,
        workerId,
        totalAmount,
        paymentMethod,
        milestones = []
      } = paymentData;

      // Calculate platform fee (3%)
      const platformFee = Math.round(totalAmount * 0.03);
      const netAmount = totalAmount - platformFee;

      // Create milestone structure
      const escrowMilestones = milestones.length > 0 ? milestones : [
        {
          title: 'Job Started',
          percentage: 30,
          condition: 'job_started'
        },
        {
          title: 'Halfway Complete',
          percentage: 30,
          condition: 'halfway_complete'
        },
        {
          title: 'Job Completed',
          percentage: 40,
          condition: 'job_completed'
        }
      ];

      // Calculate amount per milestone
      const milestonesWithAmounts = escrowMilestones.map(m => ({
        ...m,
        amount: Math.round(netAmount * (m.percentage / 100))
      }));

      const escrow = new Escrow({
        jobId,
        customerId,
        workerId,
        totalAmount,
        platformFee,
        netAmount,
        paymentMethod,
        milestones: milestonesWithAmounts,
        status: 'created'
      });

      await escrow.save();

      return escrow;
    } catch (error) {
      throw new Error(`Escrow creation failed: ${error.message}`);
    }
  }

  /**
   * Process M-Pesa payment (simulated)
   */
  async processM-PesaPayment(paymentData) {
    try {
      const {
        phone,
        amount,
        description,
        escrowId
      } = paymentData;

      // Simulate M-Pesa API call
      const transactionId = `M${Date.now()}`;
      const mpesaReference = `${process.env.MPESA_TILL_NUMBER}-${transactionId}`;

      // Update escrow
      const escrow = await Escrow.findByIdAndUpdate(escrowId, {
        paymentMethod: 'mpesa',
        transactionId,
        mpesaReference,
        status: 'funded',
        fundedAt: new Date()
      }, { new: true });

      return {
        success: true,
        transactionId,
        mpesaReference,
        amount,
        escrowId
      };
    } catch (error) {
      throw new Error(`M-Pesa payment failed: ${error.message}`);
    }
  }

  /**
   * Release escrow payment based on milestone completion
   */
  async releaseMilestonePayment(escrowId, milestoneIndex, jobId) {
    try {
      const escrow = await Escrow.findById(escrowId);

      if (!escrow) {
        throw new Error('Escrow not found');
      }

      const milestone = escrow.milestones[milestoneIndex];

      if (milestone.status === 'released') {
        throw new Error('Milestone already released');
      }

      // Update milestone
      milestone.status = 'released';
      milestone.releaseDate = new Date();

      // Update worker balance
      await User.findByIdAndUpdate(escrow.workerId, {
        $inc: { escrowBalance: milestone.amount }
      });

      // Check if all milestones released
      const allReleased = escrow.milestones.every(m => m.status === 'released');

      if (allReleased) {
        escrow.status = 'completed';
      } else {
        escrow.status = 'partially-released';
      }

      await escrow.save();

      return escrow;
    } catch (error) {
      throw new Error(`Milestone release failed: ${error.message}`);
    }
  }

  /**
   * Handle service credit (Work Now, Pay Later)
   */
  async issueServiceCredit(creditData) {
    try {
      const {
        userId,
        jobId,
        creditAmount,
        daysToPayback = 30
      } = creditData;

      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      // Check credit limit
      const usedCredit = await ServiceCredit.aggregate([
        {
          $match: {
            userId,
            status: { $nin: ['paid', 'written-off'] }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$remainingAmount' }
          }
        }
      ]);

      const totalUsedCredit = usedCredit[0]?.total || 0;

      if (totalUsedCredit + creditAmount > user.creditLimit) {
        throw new Error('Credit limit exceeded');
      }

      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + daysToPayback);

      const serviceCredit = new ServiceCredit({
        userId,
        jobId,
        creditAmount,
        remainingAmount: creditAmount,
        dueDate,
        status: 'issued',
        interestRate: 0.05
      });

      // Create payment schedule (monthly)
      const monthlyPayment = Math.round(creditAmount / Math.ceil(daysToPayback / 30));
      let currentDate = new Date();

      for (let i = 0; i < Math.ceil(daysToPayback / 30); i++) {
        currentDate.setMonth(currentDate.getMonth() + 1);
        serviceCredit.paymentSchedule.push({
          installmentNumber: i + 1,
          dueDate: new Date(currentDate),
          amount: monthlyPayment,
          status: 'pending'
        });
      }

      await serviceCredit.save();

      return serviceCredit;
    } catch (error) {
      throw new Error(`Service credit issuance failed: ${error.message}`);
    }
  }

  /**
   * Record payment for service credit installment
   */
  async recordCreditPayment(serviceCreditId, amount) {
    try {
      const serviceCredit = await ServiceCredit.findById(serviceCreditId);

      if (!serviceCredit) {
        throw new Error('Service credit not found');
      }

      serviceCredit.paidAmount += amount;
      serviceCredit.remainingAmount = serviceCredit.creditAmount - serviceCredit.paidAmount;

      // Find next pending installment
      const pendingInstallment = serviceCredit.paymentSchedule.find(
        p => p.status === 'pending'
      );

      if (pendingInstallment) {
        pendingInstallment.status = 'paid';
        pendingInstallment.paidDate = new Date();
      }

      if (serviceCredit.remainingAmount <= 0) {
        serviceCredit.status = 'paid';
        serviceCredit.paidAt = new Date();
      } else {
        serviceCredit.status = 'partial';
      }

      await serviceCredit.save();

      return serviceCredit;
    } catch (error) {
      throw new Error(`Credit payment recording failed: ${error.message}`);
    }
  }

  /**
   * Dispute payment (hold release)
   */
  async disputePayment(escrowId, disputeReason, initiatedBy) {
    try {
      const escrow = await Escrow.findByIdAndUpdate(escrowId, {
        isDisputed: true,
        disputeReason,
        disputeInitiatedBy: initiatedBy,
        disputeInitiatedAt: new Date(),
        status: 'disputed'
      }, { new: true });

      return escrow;
    } catch (error) {
      throw new Error(`Payment dispute failed: ${error.message}`);
    }
  }

  /**
   * Withdraw earnings to bank account
   */
  async withdrawEarnings(userId, amount, bankAccount) {
    try {
      const user = await User.findById(userId);

      if (!user) {
        throw new Error('User not found');
      }

      if (user.escrowBalance < amount) {
        throw new Error('Insufficient balance');
      }

      // Deduct from escrow balance
      user.escrowBalance -= amount;
      await user.save();

      // In real scenario, would integrate with actual bank transfer API
      return {
        success: true,
        amount,
        balance: user.escrowBalance,
        transactionId: `W${Date.now()}`
      };
    } catch (error) {
      throw new Error(`Withdrawal failed: ${error.message}`);
    }
  }
}

module.exports = new PaymentService();
