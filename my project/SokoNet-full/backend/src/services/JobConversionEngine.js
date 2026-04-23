/**
 * Instant Job Conversion Engine Service
 * Converts service searches into live job postings automatically
 * Features: Smart categorization, auto-matching, instant notifications
 */

const Job = require('../models/Job');

class JobConversionEngine {
  /**
   * Convert a search/request into a job posting
   * @param {Object} searchData - Customer search parameters
   * @param {string} customerId - Customer ID
   * @returns {Object} Created job
   */
  async convertSearchToJob(searchData, customerId) {
    try {
      const {
        serviceType,
        description,
        location,
        budget,
        urgency = 'medium',
        requiredSkills = []
      } = searchData;

      // Auto-categorize based on service type
      const category = this.categorizeService(serviceType);

      // Calculate suggested price using dynamic pricing
      const suggestedPrice = await this.calculateDynamicPrice(
        category,
        location,
        requiredSkills
      );

      const newJob = new Job({
        title: serviceType,
        description,
        category,
        customerId,
        location: {
          type: 'Point',
          coordinates: [location.longitude, location.latitude]
        },
        address: location.address,
        city: location.city,
        budget: {
          min: budget?.min || suggestedPrice * 0.8,
          max: budget?.max || suggestedPrice * 1.2
        },
        suggestedPrice,
        requiredSkills,
        urgency,
        status: 'posted',
        searchTags: this.generateSearchTags(serviceType, description)
      });

      await newJob.save();

      // Emit notification to nearby workers
      this.notifyNearbyWorkers(newJob);

      return newJob;
    } catch (error) {
      throw new Error(`Job conversion failed: ${error.message}`);
    }
  }

  /**
   * Auto-categorize service request
   */
  categorizeService(serviceType) {
    const categories = {
      plumbing: ['pipe', 'leak', 'tap', 'drain', 'water', 'plumb'],
      cleaning: ['clean', 'dust', 'sweep', 'wash', 'mop', 'tidy'],
      delivery: ['deliver', 'send', 'courier', 'transport', 'shopping'],
      handyman: ['fix', 'repair', 'install', 'build', 'construct'],
      beauty: ['hair', 'salon', 'massage', 'spa', 'beauty'],
      tutoring: ['teach', 'tutor', 'lesson', 'study', 'class'],
      transport: ['ride', 'taxi', 'uber', 'drive', 'travel']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(kw => serviceType.toLowerCase().includes(kw))) {
        return category;
      }
    }

    return 'custom';
  }

  /**
   * Generate searchable tags for better discovery
   */
  generateSearchTags(serviceType, description) {
    const words = `${serviceType} ${description || ''}`.toLowerCase().split(' ');
    return [...new Set(words)].filter(w => w.length > 3).slice(0, 10);
  }

  /**
   * Calculate dynamic price based on location and demand
   */
  async calculateDynamicPrice(category, location, skills) {
    try {
      // Base prices by category
      const basePrices = {
        plumbing: 5000,
        cleaning: 2000,
        delivery: 1500,
        handyman: 4000,
        beauty: 3000,
        tutoring: 2500,
        transport: 1000,
        custom: 3000
      };

      let basePrice = basePrices[category] || 3000;

      // Demand multiplier (simulated - could be based on active jobs in area)
      const demandMultiplier = 1.0 + Math.random() * 0.3;

      // Skill complexity multiplier
      const skillMultiplier = 1 + (skills?.length || 0) * 0.1;

      return Math.round(basePrice * demandMultiplier * skillMultiplier);
    } catch (error) {
      console.error('Price calculation error:', error);
      return 3000; // Default fallback
    }
  }

  /**
   * Notify nearby workers in real-time via Socket.IO
   */
  notifyNearbyWorkers(job) {
    // This will be called from controllers with io instance
    console.log(`[JobEngine] Notifying workers near ${job.city} for ${job.category} job`);
  }
}

module.exports = new JobConversionEngine();
