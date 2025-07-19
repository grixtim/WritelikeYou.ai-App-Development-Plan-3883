import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import AnalyticsService from '../services/analyticsService.js';
import AnalyticsEvent from '../models/AnalyticsEvent.js';

const router = express.Router();

// Middleware to check for admin access
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Track an event - this can be called from the frontend
router.post('/track', authenticateToken, async (req, res) => {
  try {
    const { eventName, metadata = {} } = req.body;
    
    if (!eventName) {
      return res.status(400).json({ error: 'eventName is required' });
    }
    
    const event = await AnalyticsService.trackEvent(req.user._id, eventName, metadata);
    
    res.status(201).json({
      message: 'Event tracked successfully',
      event: {
        id: event._id,
        eventName: event.eventName,
        timestamp: event.timestamp
      }
    });
  } catch (error) {
    console.error('Error tracking event:', error);
    res.status(500).json({ error: 'Server error tracking event' });
  }
});

// Get personal analytics for the authenticated user
router.get('/personal', authenticateToken, async (req, res) => {
  try {
    // Get user's events count by type
    const eventCounts = await AnalyticsEvent.aggregate([
      {
        $match: { userId: req.user._id }
      },
      {
        $group: {
          _id: '$eventName',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          eventName: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);
    
    // Get user's first and most recent events
    const firstEvent = await AnalyticsEvent.findOne({ userId: req.user._id })
      .sort({ timestamp: 1 })
      .select('eventName timestamp');
      
    const mostRecentEvent = await AnalyticsEvent.findOne({ userId: req.user._id })
      .sort({ timestamp: -1 })
      .select('eventName timestamp');
      
    // Get writing session stats
    const writingSessions = await AnalyticsEvent.countDocuments({
      userId: req.user._id,
      eventName: 'session_completed'
    });
    
    const completedEmails = await AnalyticsEvent.countDocuments({
      userId: req.user._id,
      eventName: 'draft_completed'
    });
    
    const completionRate = writingSessions > 0 
      ? (completedEmails / writingSessions) * 100 
      : 0;
    
    res.json({
      eventCounts,
      firstEvent,
      mostRecentEvent,
      writingStats: {
        sessionsStarted: writingSessions,
        emailsCompleted: completedEmails,
        completionRate: Math.round(completionRate)
      },
      daysSinceRegistration: AnalyticsService.calculateDaysSinceRegistration(req.user.createdAt)
    });
  } catch (error) {
    console.error('Error fetching personal analytics:', error);
    res.status(500).json({ error: 'Server error fetching personal analytics' });
  }
});

// Admin routes - require admin access
// Get funnel analytics
router.get('/admin/funnel', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { cohortWeek } = req.query;
    const funnelData = await AnalyticsService.getFunnelAnalytics(cohortWeek);
    res.json(funnelData);
  } catch (error) {
    console.error('Error fetching funnel analytics:', error);
    res.status(500).json({ error: 'Server error fetching funnel analytics' });
  }
});

// Get retention analytics
router.get('/admin/retention', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const retentionData = await AnalyticsService.getRetentionAnalytics(days);
    res.json(retentionData);
  } catch (error) {
    console.error('Error fetching retention analytics:', error);
    res.status(500).json({ error: 'Server error fetching retention analytics' });
  }
});

// Get cohort analysis
router.get('/admin/cohorts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const weeks = parseInt(req.query.weeks) || 10;
    const cohortData = await AnalyticsService.getCohortAnalysis(weeks);
    res.json(cohortData);
  } catch (error) {
    console.error('Error fetching cohort analysis:', error);
    res.status(500).json({ error: 'Server error fetching cohort analysis' });
  }
});

// Get event counts by date
router.get('/admin/events', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { eventName, startDate, endDate } = req.query;
    
    if (!eventName) {
      return res.status(400).json({ error: 'eventName is required' });
    }
    
    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : new Date();
    
    const eventCounts = await AnalyticsService.getEventCountsByDate(eventName, start, end);
    res.json(eventCounts);
  } catch (error) {
    console.error('Error fetching event counts:', error);
    res.status(500).json({ error: 'Server error fetching event counts' });
  }
});

// Get user journey
router.get('/admin/user/:userId/journey', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const journey = await AnalyticsService.getUserJourney(userId);
    res.json(journey);
  } catch (error) {
    console.error(`Error fetching user journey for ${req.params.userId}:`, error);
    res.status(500).json({ error: 'Server error fetching user journey' });
  }
});

export default router;