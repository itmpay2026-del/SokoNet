/**
 * Escrow Routes
 */

const express = require('express');
const router = express.Router();
const Escrow = require('../models/Escrow');
const authMiddleware = require('../middleware/auth');
const { Dispute, service: DisputeService } = require('../services/DisputeResolutionService');

// Get escrow details
router.get('/:escrowId', authMiddleware, async (req, res) => {
  try {
    const escrow = await Escrow.findById(req.params.escrowId)
      .populate('customerId workerId jobId');

    res.json({ success: true, escrow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Open dispute
router.post('/:escrowId/dispute', authMiddleware, async (req, res) => {
  try {
    const { escrowId } = req.params;
    const { title, description, evidence } = req.body;

    const escrow = await Escrow.findById(escrowId);

    const dispute = await DisputeService.openDispute({
      escrowId,
      jobId: escrow.jobId,
      complainantId: req.user.userId,
      respondentId: escrow.workerId.toString() === req.user.userId ? escrow.customerId : escrow.workerId,
      title,
      description,
      evidence
    });

    res.status(201).json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Vote on dispute
router.post('/dispute/:disputeId/vote', authMiddleware, async (req, res) => {
  try {
    const { disputeId } = req.params;
    const { vote, reasoning } = req.body;

    const dispute = await DisputeService.submitVote(
      disputeId,
      req.user.userId,
      vote,
      reasoning
    );

    res.json({ success: true, dispute });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
