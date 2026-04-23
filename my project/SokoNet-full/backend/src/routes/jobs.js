/**
 * Job Routes
 */

const express = require('express');
const router = express.Router();
const jobController = require('../controllers/jobController');
const authMiddleware = require('../middleware/auth');

// Get nearby jobs
router.get('/nearby', jobController.getNearbyJobs);

// Search jobs
router.get('/search', jobController.searchJobs);

// Protected routes
router.post('/', authMiddleware, jobController.createJob);
router.get('/details/:jobId', authMiddleware, jobController.getJobDetails);
router.get('/my-jobs', authMiddleware, jobController.getMyJobs);
router.get('/opportunities', authMiddleware, jobController.getIncomeOpportunities);
router.get('/skills-to-learn', authMiddleware, jobController.getSkillSuggestions);
router.put('/:jobId/status', authMiddleware, jobController.updateJobStatus);
router.delete('/:jobId', authMiddleware, jobController.cancelJob);

module.exports = router;
