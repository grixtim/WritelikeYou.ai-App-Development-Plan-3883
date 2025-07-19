import mongoose from 'mongoose';

/**
 * Schema for tracking analytics events
 */
const analyticsEventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  eventName: {
    type: String,
    required: true,
    enum: [
      'user_registered',
      'setup_completed',
      'email_type_selected',
      'mini_lesson_viewed',
      'magic_prompt_delivered',
      'writing_started',
      'draft_completed',
      'session_completed',
      // Additional event types can be added here
      'subscription_created',
      'subscription_updated',
      'subscription_canceled',
      'payment_succeeded',
      'payment_failed'
    ],
    index: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true,
    index: true
  },
  cohortWeek: {
    type: String,
    required: true,
    index: true
  },
  daysSinceRegistration: {
    type: Number,
    required: true,
    index: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
});

// Create compound indexes for efficient querying
analyticsEventSchema.index({ userId: 1, eventName: 1 });
analyticsEventSchema.index({ cohortWeek: 1, eventName: 1 });
analyticsEventSchema.index({ eventName: 1, timestamp: 1 });

// Static method to track an event
analyticsEventSchema.statics.trackEvent = async function(userId, eventName, metadata = {}, userCreatedAt = null) {
  if (!userId || !eventName) {
    throw new Error('userId and eventName are required to track an event');
  }

  // Get user registration date if not provided
  if (!userCreatedAt) {
    const User = mongoose.model('User');
    const user = await User.findById(userId).select('createdAt cohortWeek');
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    userCreatedAt = user.createdAt;
  }

  // Calculate days since registration
  const daysSinceRegistration = calculateDaysSinceRegistration(userCreatedAt);
  
  // Get cohort week
  const cohortWeek = getCohortWeek(userCreatedAt);

  return this.create({
    userId,
    eventName,
    timestamp: new Date(),
    cohortWeek,
    daysSinceRegistration,
    metadata
  });
};

// Static method to get events by cohort
analyticsEventSchema.statics.getEventsByCohort = function(cohortWeek, eventName = null) {
  const query = { cohortWeek };
  if (eventName) {
    query.eventName = eventName;
  }
  return this.find(query).sort({ timestamp: 1 });
};

// Static method to get user journey
analyticsEventSchema.statics.getUserJourney = function(userId) {
  return this.find({ userId }).sort({ timestamp: 1 });
};

// Static method to get event counts by date range
analyticsEventSchema.statics.getEventCountsByDateRange = function(eventName, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        eventName,
        timestamp: { $gte: startDate, $lte: endDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$timestamp' },
          month: { $month: '$timestamp' },
          day: { $dayOfMonth: '$timestamp' }
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: {
        '_id.year': 1,
        '_id.month': 1,
        '_id.day': 1
      }
    },
    {
      $project: {
        date: {
          $dateFromParts: {
            year: '$_id.year',
            month: '$_id.month',
            day: '$_id.day'
          }
        },
        count: 1,
        _id: 0
      }
    }
  ]);
};

// Static method to get conversion rates
analyticsEventSchema.statics.getConversionRate = async function(startEventName, endEventName, cohortWeek = null) {
  const match = cohortWeek ? { cohortWeek } : {};
  
  const startEvents = await this.distinct('userId', { ...match, eventName: startEventName });
  const endEvents = await this.distinct('userId', { ...match, eventName: endEventName });
  
  const startCount = startEvents.length;
  const endCount = endEvents.filter(userId => startEvents.includes(userId)).length;
  
  return {
    startCount,
    endCount,
    conversionRate: startCount > 0 ? (endCount / startCount) * 100 : 0
  };
};

// Static method to run retention analysis
analyticsEventSchema.statics.getRetentionAnalysis = async function(eventName, daysBack = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - daysBack);
  
  const newUsers = await this.distinct('userId', {
    eventName: 'user_registered',
    timestamp: { $gte: startDate }
  });
  
  const retainedUsers = await this.distinct('userId', {
    eventName,
    userId: { $in: newUsers },
    timestamp: { $gte: startDate }
  });
  
  return {
    newUsers: newUsers.length,
    retainedUsers: retainedUsers.length,
    retentionRate: newUsers.length > 0 ? (retainedUsers.length / newUsers.length) * 100 : 0
  };
};

/**
 * Helper function to calculate days since registration
 * @param {Date} registrationDate - User registration date
 * @returns {Number} - Days since registration
 */
const calculateDaysSinceRegistration = (registrationDate) => {
  if (!registrationDate) return 0;
  
  const now = new Date();
  const regDate = new Date(registrationDate);
  
  // Calculate difference in milliseconds
  const diffTime = Math.abs(now - regDate);
  
  // Convert to days and return integer
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Helper function to get cohort week from a date
 * Format: YYYY-WW (e.g., 2024-01 for first week of 2024)
 * @param {Date} date - Date to get cohort week from
 * @returns {String} - Cohort week in YYYY-WW format
 */
const getCohortWeek = (date) => {
  const d = new Date(date);
  const onejan = new Date(d.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((d.getTime() - onejan.getTime()) / 86400000) + onejan.getDay() + 1) / 7);
  return `${d.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
};

// Export helper functions for use elsewhere
export { calculateDaysSinceRegistration, getCohortWeek };

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
export default AnalyticsEvent;