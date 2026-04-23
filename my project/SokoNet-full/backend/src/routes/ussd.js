/**
 * USSD Routes
 */

const express = require('express');
const router = express.Router();
const ussdController = require('../controllers/ussdController');
const authMiddleware = require('../middleware/auth');

// Public USSD endpoints (for USSD gateways)
router.post('/request', ussdController.handleUSSDRequest);
router.post('/register', ussdController.registerViaUSSD);

// Protected routes
router.post('/send-alert/:jobId', authMiddleware, ussdController.sendJobAlert);

module.exports = router;
