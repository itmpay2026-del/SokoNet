/**
 * Trust Circles Routes
 */

const express = require('express');
const router = express.Router();
const TrustCircle = require('../models/TrustCircle');
const authMiddleware = require('../middleware/auth');

// Create trust circle
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, preferredCategories } = req.body;

    const circle = new TrustCircle({
      name,
      description,
      creatorId: req.user.userId,
      preferredCategories,
      members: [{ userId: req.user.userId, role: 'admin' }]
    });

    await circle.save();
    res.status(201).json({ success: true, circle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get my trust circles
router.get('/', authMiddleware, async (req, res) => {
  try {
    const circles = await TrustCircle.find({
      $or: [
        { creatorId: req.user.userId },
        { 'members.userId': req.user.userId }
      ]
    }).populate('members.userId', 'firstName lastName avatar');

    res.json({ success: true, circles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add member to circle
router.post('/:circleId/members', authMiddleware, async (req, res) => {
  try {
    const { circleId } = req.params;
    const { userId } = req.body;

    const circle = await TrustCircle.findByIdAndUpdate(
      circleId,
      {
        $push: { members: { userId, role: 'member' } }
      },
      { new: true }
    );

    res.json({ success: true, circle });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
