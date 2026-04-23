/**
 * Location Routes
 */

const express = require('express');
const router = express.Router();
const LocationService = require('../services/LocationService');
const authMiddleware = require('../middleware/auth');

// Get nearby jobs
router.get('/jobs', async (req, res) => {
  try {
    const { latitude, longitude, radius } = req.query;
    const jobs = await LocationService.getNearbyJobs(
      [parseFloat(longitude), parseFloat(latitude)],
      parseFloat(radius) || 10
    );
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get nearby workers
router.get('/workers', async (req, res) => {
  try {
    const { latitude, longitude, radius, skills } = req.query;
    const workers = await LocationService.getNearbyWorkers(
      [parseFloat(longitude), parseFloat(latitude)],
      skills ? skills.split(',') : [],
      parseFloat(radius) || 10
    );
    res.json({ success: true, workers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get demand hotspots
router.get('/hotspots', async (req, res) => {
  try {
    const hotspots = await LocationService.getDemandHotspots();
    res.json({ success: true, hotspots });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get nearby suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const { latitude, longitude, materials } = req.query;
    const suppliers = await LocationService.getNearbySuppliers(
      [parseFloat(longitude), parseFloat(latitude)],
      materials ? materials.split(',') : []
    );
    res.json({ success: true, suppliers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
