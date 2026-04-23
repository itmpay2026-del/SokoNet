/**
 * Franchises Routes
 */

const express = require('express');
const router = express.Router();
const Franchise = require('../models/Franchise');
const authMiddleware = require('../middleware/auth');

// Get all franchises
router.get('/', async (req, res) => {
  try {
    const franchises = await Franchise.find({ isActive: true }).limit(20);
    res.json({ success: true, franchises });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get franchise details
router.get('/:franchiseId', async (req, res) => {
  try {
    const franchise = await Franchise.findById(req.params.franchiseId);
    res.json({ success: true, franchise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Join franchise
router.post('/:franchiseId/join', authMiddleware, async (req, res) => {
  try {
    const { franchiseId } = req.params;

    const franchise = await Franchise.findByIdAndUpdate(
      franchiseId,
      { $inc: { activeMembers: 1 } },
      { new: true }
    );

    res.json({ success: true, message: 'Joined franchise', franchise });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
