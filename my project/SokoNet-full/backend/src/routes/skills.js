/**
 * Skills Routes
 */

const express = require('express');
const router = express.Router();
const Skill = require('../models/Skill');
const authMiddleware = require('../middleware/auth');

// Add skill
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { skillName, skillCategory, proficiencyLevel, proofDocuments } = req.body;

    const skill = new Skill({
      workerId: req.user.userId,
      skillName,
      skillCategory,
      proficiencyLevel,
      proofDocuments
    });

    await skill.save();
    res.status(201).json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get worker skills
router.get('/:workerId', async (req, res) => {
  try {
    const skills = await Skill.find({ workerId: req.params.workerId });
    res.json({ success: true, skills });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Endorse skill
router.post('/:skillId/endorse', authMiddleware, async (req, res) => {
  try {
    const { skillId } = req.params;
    const { message, rating } = req.body;

    const skill = await Skill.findByIdAndUpdate(
      skillId,
      {
        $push: {
          endorsements: {
            endorsedBy: req.user.userId,
            message,
            rating
          }
        },
        $inc: { endorsementCount: 1 }
      },
      { new: true }
    );

    res.json({ success: true, skill });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
