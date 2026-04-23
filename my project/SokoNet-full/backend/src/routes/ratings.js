/**
 * Rating Routes
 */

const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');
const authMiddleware = require('../middleware/auth');

// Get user ratings
router.get('/:userId', ratingController.getUserRatings);

// Protected routes
router.post('/', authMiddleware, ratingController.submitRating);
router.get('/', authMiddleware, ratingController.getMyRatings);
router.put('/:ratingId/flag', authMiddleware, ratingController.flagRating);

module.exports = router;
