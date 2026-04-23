/**
 * User Routes
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/send-otp', userController.sendOTP);
router.post('/verify-otp', userController.verifyOTP);

// Protected routes
router.get('/profile', authMiddleware, userController.getProfile);
router.put('/profile', authMiddleware, userController.updateProfile);
router.put('/location', authMiddleware, userController.updateLocation);
router.get('/stats', authMiddleware, userController.getWorkerStats);
router.post('/withdraw', authMiddleware, userController.withdrawEarnings);
router.get('/nearby-workers', authMiddleware, userController.getNearbyWorkers);

module.exports = router;
