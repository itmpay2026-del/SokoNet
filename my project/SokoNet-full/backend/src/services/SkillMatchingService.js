/**
 * Skill-to-Income Matching Service
 * Matches user skills with available income opportunities
 * Features: Smart opportunity suggestions, earning potential calculation
 */

const User = require('../models/User');
const Job = require('../models/Job');
const Skill = require('../models/Skill');

class SkillMatchingService {
  /**
   * Get income opportunities for a user based on their skills
   * @param {string} userId - User ID
   * @param {string} location - User location
   * @returns {Array} List of matched job opportunities
   */
  async getIncomeOpportunities(userId, location) {
    try {
      const user = await User.findById(userId);
      
      if (!user || !user.skills || user.skills.length === 0) {
        return [];
      }

      // Find nearby jobs matching user skills
      const opportunities = await Job.find({
        status: 'posted',
        acceptedWorkerId: null,
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: location.coordinates
            },
            $maxDistance: 50000 // 50km radius
          }
        },
        requiredSkills: {
          $in: user.skills
        }
      })
      .sort({ urgency: -1, createdAt: -1 })
      .limit(20);

      // Calculate earning potential for each opportunity
      const enrichedOpportunities = opportunities.map(job => ({
        ...job.toObject(),
        earningPotential: this.calculateEarningPotential(job, user),
        matchPercentage: this.calculateMatchPercentage(job.requiredSkills, user.skills)
      }));

      return enrichedOpportunities;
    } catch (error) {
      throw new Error(`Skill matching failed: ${error.message}`);
    }
  }

  /**
   * Get skill-based earning potential
   */
  calculateEarningPotential(job, user) {
    const baseEarning = job.budget?.max || 5000;
    
    // Boost for higher-rated workers
    const ratingBoost = 1 + (user.averageRating / 5) * 0.2;
    
    // Boost for urgency
    const urgencyBoost = {
      low: 1,
      medium: 1.1,
      high: 1.2,
      urgent: 1.4
    }[job.urgency] || 1;

    return Math.round(baseEarning * ratingBoost * urgencyBoost);
  }

  /**
   * Calculate skill match percentage
   */
  calculateMatchPercentage(requiredSkills, userSkills) {
    if (requiredSkills.length === 0) return 100;
    
    const matches = requiredSkills.filter(skill =>
      userSkills.some(s => s.toLowerCase() === skill.toLowerCase())
    ).length;

    return Math.round((matches / requiredSkills.length) * 100);
  }

  /**
   * Suggest new skills based on job demand
   */
  async suggestSkillsToLearn(userId, location) {
    try {
      const user = await User.findById(userId);
      const userSkills = user.skills || [];

      // Get high-demand jobs in the area
      const demandingJobs = await Job.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: location.coordinates
            },
            distanceField: 'distance',
            maxDistance: 50000
          }
        },
        {
          $match: {
            status: 'posted',
            requiredSkills: {
              $nin: userSkills
            }
          }
        },
        {
          $unwind: '$requiredSkills'
        },
        {
          $group: {
            _id: '$requiredSkills',
            demand: { $sum: 1 }
          }
        },
        {
          $sort: { demand: -1 }
        },
        {
          $limit: 5
        }
      ]);

      return demandingJobs.map(job => ({
        skill: job._id,
        demand: job.demand,
        potentialEarnings: demandingJobs.length > 0 ? 
          Math.round(5000 * (job.demand / demandingJobs[0].demand)) : 0
      }));
    } catch (error) {
      console.error('Skill suggestion error:', error);
      return [];
    }
  }
}

module.exports = new SkillMatchingService();
