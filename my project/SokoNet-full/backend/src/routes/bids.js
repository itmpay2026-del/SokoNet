/**
 * Bid Routes
 */

const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bidController');
const authMiddleware = require('../middleware/auth');

// Get bids for job
router.get('/:jobId', bidController.getJobBids);

// Protected routes
router.post('/', authMiddleware, bidController.placeBid);
router.get('/my-bids', authMiddleware, bidController.getMyBids);
router.put('/:bidId/accept', authMiddleware, bidController.acceptBid);
router.put('/:bidId/reject', authMiddleware, bidController.rejectBid);
router.put('/:bidId/withdraw', authMiddleware, bidController.withdrawBid);

module.exports = router;
