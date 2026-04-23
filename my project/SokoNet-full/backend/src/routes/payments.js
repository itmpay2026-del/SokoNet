/**
 * Payment & Escrow Routes
 */

const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/auth');

// Protected routes
router.post('/escrow', authMiddleware, paymentController.createEscrow);
router.get('/escrow/:escrowId', authMiddleware, paymentController.getEscrow);
router.post('/mpesa', authMiddleware, paymentController.processM-PesaPayment);
router.post('/escrow/:jobId/milestone-release', authMiddleware, paymentController.releaseMilestonePayment);
router.post('/service-credit', authMiddleware, paymentController.issueServiceCredit);
router.get('/service-credits', authMiddleware, paymentController.getServiceCredits);
router.post('/service-credit/:serviceCreditId/payment', authMiddleware, paymentController.recordCreditPayment);
router.post('/escrow/:escrowId/dispute', authMiddleware, paymentController.disputePayment);
router.post('/withdraw', authMiddleware, paymentController.withdrawEarnings);

module.exports = router;
