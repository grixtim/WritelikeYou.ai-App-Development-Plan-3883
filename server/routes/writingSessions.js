import express from 'express';
import { body, validationResult } from 'express-validator';
import WritingSession from '../models/WritingSession.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create new writing session
router.post('/create', [
  body('emailType').isIn(['cart_open', 'belief_shifting', 'social_proof', 'cart_close']),
  body('setupData').optional().isObject(),
  body('confidenceBefore').optional().isInt({ min: 1, max: 10 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { emailType, setupData = {}, confidenceBefore = 5 } = req.body;

    // Check if user has an active session
    const activeSession = await WritingSession.findActiveSession(req.user._id);
    if (activeSession) {
      return res.status(409).json({
        error: 'Active session exists',
        activeSession: {
          sessionId: activeSession.sessionId,
          emailType: activeSession.emailType,
          currentStep: activeSession.currentStep,
          createdAt: activeSession.createdAt
        }
      });
    }

    const session = new WritingSession({
      userId: req.user._id,
      emailType,
      setupData,
      confidenceBefore
    });

    await session.save();

    res.status(201).json({
      message: 'Writing session created',
      session: {
        sessionId: session.sessionId,
        emailType: session.emailType,
        currentStep: session.currentStep,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Server error creating session' });
  }
});

// Get active session
router.get('/active', async (req, res) => {
  try {
    const session = await WritingSession.findActiveSession(req.user._id);
    
    if (!session) {
      return res.status(404).json({ error: 'No active session found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({ error: 'Server error fetching active session' });
  }
});

// Get session by ID
router.get('/:sessionId', async (req, res) => {
  try {
    const session = await WritingSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Server error fetching session' });
  }
});

// Auto-save draft content
router.put('/:sessionId/auto-save', [
  body('userDraftContent').isString().isLength({ max: 50000 }),
  body('flowTimeSeconds').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userDraftContent, flowTimeSeconds } = req.body;

    const session = await WritingSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
      completionStatus: 'draft'
    });

    if (!session) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    // Update content and flow time
    session.userDraftContent = userDraftContent;
    if (flowTimeSeconds !== undefined) {
      session.flowTimeSeconds = flowTimeSeconds;
    }

    await session.save();

    res.json({
      message: 'Draft auto-saved',
      autoSaveCount: session.autoSaveCount,
      lastAutoSave: session.lastAutoSave,
      wordCount: session.wordCount
    });
  } catch (error) {
    console.error('Auto-save error:', error);
    res.status(500).json({ error: 'Server error during auto-save' });
  }
});

// Update session progress
router.put('/:sessionId/progress', [
  body('currentStep').isIn(['type-selection', 'mini-lesson', 'prompt', 'writing', 'feedback', 'completed']),
  body('miniLessonContent').optional().isString(),
  body('magicPromptGenerated').optional().isObject(),
  body('totalTimeSpent').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = {};
    const allowedFields = ['currentStep', 'miniLessonContent', 'magicPromptGenerated', 'totalTimeSpent'];
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const session = await WritingSession.findOneAndUpdate(
      {
        sessionId: req.params.sessionId,
        userId: req.user._id
      },
      updates,
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ 
      message: 'Session progress updated',
      session: {
        sessionId: session.sessionId,
        currentStep: session.currentStep,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({ error: 'Server error updating progress' });
  }
});

// Complete session
router.put('/:sessionId/complete', [
  body('userDraftContent').isString(),
  body('confidenceAfter').isInt({ min: 1, max: 10 }),
  body('userFeedback').optional().isObject(),
  body('totalTimeSpent').optional().isInt({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { userDraftContent, confidenceAfter, userFeedback = {}, totalTimeSpent } = req.body;

    const session = await WritingSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Complete the session
    await session.completeSession(userDraftContent, confidenceAfter, userFeedback);
    
    if (totalTimeSpent !== undefined) {
      session.totalTimeSpent = totalTimeSpent;
      await session.save();
    }

    res.json({
      message: 'Session completed successfully',
      session: {
        sessionId: session.sessionId,
        completionStatus: session.completionStatus,
        confidenceGain: confidenceAfter - session.confidenceBefore,
        wordCount: session.wordCount,
        completedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('Complete session error:', error);
    res.status(500).json({ error: 'Server error completing session' });
  }
});

// Abandon session
router.put('/:sessionId/abandon', async (req, res) => {
  try {
    const session = await WritingSession.findOne({
      sessionId: req.params.sessionId,
      userId: req.user._id,
      completionStatus: 'draft'
    });

    if (!session) {
      return res.status(404).json({ error: 'Active session not found' });
    }

    await session.abandonSession();

    res.json({
      message: 'Session abandoned',
      sessionId: session.sessionId
    });
  } catch (error) {
    console.error('Abandon session error:', error);
    res.status(500).json({ error: 'Server error abandoning session' });
  }
});

// Get user's session history
router.get('/history/list', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const sessions = await WritingSession.getUserSessions(req.user._id, limit);

    const sessionHistory = sessions.map(session => ({
      sessionId: session.sessionId,
      emailType: session.emailType,
      completionStatus: session.completionStatus,
      confidenceBefore: session.confidenceBefore,
      confidenceAfter: session.confidenceAfter,
      wordCount: session.wordCount,
      flowTimeSeconds: session.flowTimeSeconds,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt
    }));

    res.json({ sessions: sessionHistory });
  } catch (error) {
    console.error('Get session history error:', error);
    res.status(500).json({ error: 'Server error fetching session history' });
  }
});

// Get user analytics
router.get('/analytics/summary', async (req, res) => {
  try {
    const dateRange = {};
    if (req.query.from) dateRange.from = req.query.from;
    if (req.query.to) dateRange.to = req.query.to;

    const analytics = await WritingSession.getSessionAnalytics(req.user._id, dateRange);
    
    if (!analytics.length) {
      return res.json({
        totalSessions: 0,
        completedSessions: 0,
        completionRate: 0,
        averageConfidenceGain: 0,
        totalFlowTime: 0,
        totalWordCount: 0,
        emailTypeBreakdown: {}
      });
    }

    const data = analytics[0];
    const emailTypeBreakdown = {};
    
    data.emailTypeBreakdown.forEach(type => {
      emailTypeBreakdown[type] = (emailTypeBreakdown[type] || 0) + 1;
    });

    res.json({
      totalSessions: data.totalSessions,
      completedSessions: data.completedSessions,
      completionRate: data.totalSessions > 0 ? (data.completedSessions / data.totalSessions) * 100 : 0,
      averageConfidenceGain: Math.round((data.averageConfidenceGain || 0) * 100) / 100,
      totalFlowTime: data.totalFlowTime,
      totalWordCount: data.totalWordCount,
      emailTypeBreakdown
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Server error fetching analytics' });
  }
});

export default router;