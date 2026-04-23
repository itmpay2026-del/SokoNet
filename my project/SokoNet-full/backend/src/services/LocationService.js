/**
 * Location Service
 * Handles geolocation queries, nearby job/worker matching
 * Features: Distance calculation, location-based queries
 */

const User = require('../models/User');
const Job = require('../models/Job');

class LocationService {
  /**
   * Find nearby jobs for a worker
   * @param {number[]} coordinates - [longitude, latitude]
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Array} Nearby jobs
   */
  async getNearbyJobs(coordinates, radiusKm = 10) {
    try {
      const radiusMeters = radiusKm * 1000;

      const jobs = await Job.find({
        status: 'posted',
        acceptedWorkerId: null,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radiusMeters
          }
        }
      })
      .sort({ urgency: -1, createdAt: -1 })
      .limit(50);

      return jobs;
    } catch (error) {
      throw new Error(`Failed to find nearby jobs: ${error.message}`);
    }
  }

  /**
   * Find nearby workers for a job
   * @param {number[]} coordinates - [longitude, latitude]
   * @param {string[]} requiredSkills - Required skills
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Array} Nearby workers
   */
  async getNearbyWorkers(coordinates, requiredSkills = [], radiusKm = 10) {
    try {
      const radiusMeters = radiusKm * 1000;

      const workers = await User.find({
        userType: { $in: ['worker', 'business'] },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radiusMeters
          }
        },
        isActive: true,
        isBlocked: false,
        ...(requiredSkills.length > 0 && {
          skills: { $in: requiredSkills }
        })
      })
      .select('firstName lastName avatar averageRating skills location')
      .sort({ averageRating: -1 })
      .limit(30);

      return workers;
    } catch (error) {
      throw new Error(`Failed to find nearby workers: ${error.message}`);
    }
  }

  /**
   * Calculate demand hotspots
   * Returns areas with high job density
   */
  async getDemandHotspots(radiusKm = 50) {
    try {
      const hotspots = await Job.aggregate([
        {
          $match: {
            status: 'posted'
          }
        },
        {
          $group: {
            _id: '$city',
            jobCount: { $sum: 1 },
            avgBudget: { $avg: '$budget.max' },
            categories: { $push: '$category' }
          }
        },
        {
          $sort: { jobCount: -1 }
        },
        {
          $limit: 20
        }
      ]);

      return hotspots;
    } catch (error) {
      throw new Error(`Failed to calculate hotspots: ${error.message}`);
    }
  }

  /**
   * Suggest nearby suppliers for job materials
   * @param {number[]} coordinates - [longitude, latitude]
   * @param {string[]} materials - Required materials
   * @returns {Array} Nearby suppliers
   */
  async getNearbySuppliers(coordinates, materials = []) {
    try {
      const radiusMeters = 10000; // 10km

      const suppliers = await User.find({
        userType: 'business',
        businessCategory: { $in: ['supplier', 'store', 'warehouse'] },
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radiusMeters
          }
        },
        isActive: true,
        isBlocked: false
      })
      .select('businessName avatar location address averageRating')
      .sort({ averageRating: -1 })
      .limit(15);

      return suppliers;
    } catch (error) {
      console.error('Supplier lookup error:', error);
      return [];
    }
  }

  /**
   * Calculate distance between two coordinates
   */
  calculateDistance(coord1, coord2) {
    const [lon1, lat1] = coord1;
    const [lon2, lat2] = coord2;

    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

module.exports = new LocationService();
