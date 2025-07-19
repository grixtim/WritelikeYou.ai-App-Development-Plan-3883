import AnalyticsEvent, { calculateDaysSinceRegistration, getCohortWeek } from '../models/AnalyticsEvent.js';
import User from '../models/User.js';

/**
 * Service for tracking and analyzing user events
 */
class AnalyticsService {
  /**
   * Track a user event
   * @param {String} userId - User ID
   * @param {String} eventName - Event name
   * @param {Object} metadata - Additional event metadata
   * @returns {Promise} - The created event
   */
  static async trackEvent(userId, eventName, metadata = {}) {
    try {
      return await AnalyticsEvent.trackEvent(userId, eventName, metadata);
    } catch (error) {
      console.error(`Error tracking event ${eventName} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Track user registration event
   * @param {Object} user - User object
   * @returns {Promise} - The created event
   */
  static async trackRegistration(user) {
    if (!user || !user._id) {
      throw new Error('User object is required to track registration');
    }

    try {
      // No need to calculate daysSinceRegistration for registration event
      return await AnalyticsEvent.create({
        userId: user._id,
        eventName: 'user_registered',
        timestamp: user.createdAt || new Date(),
        cohortWeek: user.cohortWeek,
        daysSinceRegistration: 0,
        metadata: {
          email: user.email,
          registrationSource: user.registrationSource,
          betaAccess: !!user.betaAccessCode,
          cohortMonth: user.cohortMonth
        }
      });
    } catch (error) {
      console.error(`Error tracking registration for user ${user._id}:`, error);
      throw error;
    }
  }

  /**
   * Track email writing session events
   * @param {String} userId - User ID
   * @param {String} eventName - Event name (email_type_selected, writing_started, etc.)
   * @param {Object} sessionData - Writing session data
   * @returns {Promise} - The created event
   */
  static async trackWritingEvent(userId, eventName, sessionData = {}) {
    if (!userId || !eventName) {
      throw new Error('userId and eventName are required to track a writing event');
    }

    try {
      const user = await User.findById(userId).select('createdAt cohortWeek');
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const metadata = {
        sessionId: sessionData.sessionId,
        emailType: sessionData.emailType,
        ...sessionData
      };

      return await AnalyticsEvent.trackEvent(userId, eventName, metadata, user.createdAt);
    } catch (error) {
      console.error(`Error tracking writing event ${eventName} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Track subscription events
   * @param {String} userId - User ID
   * @param {String} eventName - Event name
   * @param {Object} subscriptionData - Subscription data
   * @returns {Promise} - The created event
   */
  static async trackSubscriptionEvent(userId, eventName, subscriptionData = {}) {
    if (!userId || !eventName) {
      throw new Error('userId and eventName are required to track a subscription event');
    }

    try {
      const user = await User.findById(userId).select('createdAt cohortWeek');
      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      const metadata = {
        subscriptionId: subscriptionData.subscriptionId,
        planType: subscriptionData.planType,
        status: subscriptionData.status,
        ...subscriptionData
      };

      return await AnalyticsEvent.trackEvent(userId, eventName, metadata, user.createdAt);
    } catch (error) {
      console.error(`Error tracking subscription event ${eventName} for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Get user funnel analytics
   * @param {String} cohortWeek - Optional cohort week to filter by
   * @returns {Promise} - Funnel analytics data
   */
  static async getFunnelAnalytics(cohortWeek = null) {
    try {
      const funnelSteps = [
        'user_registered',
        'setup_completed',
        'email_type_selected',
        'writing_started',
        'session_completed'
      ];

      const results = await Promise.all(
        funnelSteps.map(async (step, index) => {
          if (index === 0) {
            // Base step (registration)
            const match = cohortWeek ? { cohortWeek, eventName: step } : { eventName: step };
            const count = await AnalyticsEvent.countDocuments(match);
            return { step, count, dropoff: 0, conversionRate: 100 };
          } else {
            // Calculate conversion from previous step
            const previousStep = funnelSteps[index - 1];
            const conversion = await AnalyticsEvent.getConversionRate(previousStep, step, cohortWeek);
            
            return {
              step,
              count: conversion.endCount,
              dropoff: conversion.startCount - conversion.endCount,
              conversionRate: conversion.conversionRate
            };
          }
        })
      );

      return results;
    } catch (error) {
      console.error('Error getting funnel analytics:', error);
      throw error;
    }
  }

  /**
   * Get retention analytics
   * @param {Number} days - Number of days to analyze
   * @returns {Promise} - Retention analytics data
   */
  static async getRetentionAnalytics(days = 30) {
    try {
      const eventTypes = [
        'email_type_selected',
        'session_completed'
      ];

      const results = await Promise.all(
        eventTypes.map(async (eventType) => {
          const retention = await AnalyticsEvent.getRetentionAnalysis(eventType, days);
          return {
            eventType,
            ...retention
          };
        })
      );

      return results;
    } catch (error) {
      console.error('Error getting retention analytics:', error);
      throw error;
    }
  }

  /**
   * Get cohort analysis
   * @param {Number} weeks - Number of weeks to analyze
   * @returns {Promise} - Cohort analysis data
   */
  static async getCohortAnalysis(weeks = 10) {
    try {
      // Get the last N weeks
      const cohorts = [];
      const now = new Date();
      
      for (let i = 0; i < weeks; i++) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        cohorts.push(getCohortWeek(date));
      }

      // Reverse to show oldest first
      cohorts.reverse();

      const results = await Promise.all(
        cohorts.map(async (cohort) => {
          // Get number of users registered in this cohort
          const registrations = await AnalyticsEvent.countDocuments({
            cohortWeek: cohort,
            eventName: 'user_registered'
          });

          // Calculate week-by-week retention
          const weeklyRetention = [];
          
          for (let week = 0; week < 8; week++) {
            if (week === 0) {
              weeklyRetention.push(100); // Week 0 is always 100%
            } else {
              // For each subsequent week, find users who had any activity
              const activeUserIds = await AnalyticsEvent.distinct('userId', {
                cohortWeek: cohort,
                eventName: 'user_registered'
              });
              
              if (activeUserIds.length === 0) {
                weeklyRetention.push(0);
                continue;
              }

              // Find active users N weeks later
              const weekDate = new Date(now);
              weekDate.setDate(weekDate.getDate() - ((i - week) * 7));
              
              const laterActiveUsers = await AnalyticsEvent.countDocuments({
                userId: { $in: activeUserIds },
                timestamp: {
                  $gte: new Date(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate()),
                  $lt: new Date(weekDate.getFullYear(), weekDate.getMonth(), weekDate.getDate() + 7)
                }
              });
              
              const retentionRate = registrations > 0 
                ? (laterActiveUsers / registrations) * 100 
                : 0;
              
              weeklyRetention.push(Math.round(retentionRate));
            }
          }

          return {
            cohort,
            registrations,
            retention: weeklyRetention
          };
        })
      );

      return results;
    } catch (error) {
      console.error('Error getting cohort analysis:', error);
      throw error;
    }
  }

  /**
   * Get event counts by date range
   * @param {String} eventName - Event name to count
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise} - Event counts by date
   */
  static async getEventCountsByDate(eventName, startDate, endDate) {
    try {
      return await AnalyticsEvent.getEventCountsByDateRange(eventName, startDate, endDate);
    } catch (error) {
      console.error(`Error getting event counts for ${eventName}:`, error);
      throw error;
    }
  }

  /**
   * Get user journey
   * @param {String} userId - User ID
   * @returns {Promise} - User journey events
   */
  static async getUserJourney(userId) {
    try {
      return await AnalyticsEvent.getUserJourney(userId);
    } catch (error) {
      console.error(`Error getting journey for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Helper function to calculate cohort week
   * @param {Date} date - Date to calculate cohort week for
   * @returns {String} - Cohort week
   */
  static getCohortWeek(date) {
    return getCohortWeek(date);
  }

  /**
   * Helper function to calculate days since registration
   * @param {Date} registrationDate - Registration date
   * @returns {Number} - Days since registration
   */
  static calculateDaysSinceRegistration(registrationDate) {
    return calculateDaysSinceRegistration(registrationDate);
  }
}

export default AnalyticsService;