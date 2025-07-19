import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const writingSessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    default: uuidv4,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  emailType: {
    type: String,
    enum: ['cart_open', 'belief_shifting', 'social_proof', 'cart_close'],
    required: true
  },
  setupData: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
    validate: {
      validator: function(v) {
        return typeof v === 'object' && v !== null;
      },
      message: 'Setup data must be a valid object'
    }
  },
  miniLessonContent: {
    type: String,
    default: ''
  },
  magicPromptGenerated: {
    type: mongoose.Schema.Types.Mixed,
    default: null,
    validate: {
      validator: function(v) {
        if (v === null) return true;
        return typeof v === 'object' && v.title && v.content;
      },
      message: 'Magic prompt must have title and content fields'
    }
  },
  userDraftContent: {
    type: String,
    default: '',
    maxlength: 50000 // Reasonable limit for email content
  },
  confidenceBefore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  confidenceAfter: {
    type: Number,
    min: 1,
    max: 10,
    default: null
  },
  flowTimeSeconds: {
    type: Number,
    min: 0,
    default: 0
  },
  completionStatus: {
    type: String,
    enum: ['draft', 'completed', 'abandoned'],
    default: 'draft'
  },
  // Auto-save tracking
  lastAutoSave: {
    type: Date,
    default: null
  },
  autoSaveCount: {
    type: Number,
    default: 0
  },
  // Additional metadata
  totalTimeSpent: {
    type: Number,
    min: 0,
    default: 0
  },
  wordCount: {
    type: Number,
    min: 0,
    default: 0
  },
  // Session progress tracking
  currentStep: {
    type: String,
    enum: ['type-selection', 'mini-lesson', 'prompt', 'writing', 'feedback', 'completed'],
    default: 'type-selection'
  },
  // Feedback and analytics
  userFeedback: {
    soundsLikeMe: {
      type: Boolean,
      default: null
    },
    feelingAfterWriting: {
      type: String,
      enum: ['inspired', 'energized', 'confident', 'relieved', null],
      default: null
    },
    additionalNotes: {
      type: String,
      default: ''
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
writingSessionSchema.index({ userId: 1, createdAt: -1 });
writingSessionSchema.index({ sessionId: 1 });
writingSessionSchema.index({ completionStatus: 1 });
writingSessionSchema.index({ emailType: 1 });
writingSessionSchema.index({ userId: 1, completionStatus: 1 });

// Pre-save middleware to update word count
writingSessionSchema.pre('save', function(next) {
  if (this.isModified('userDraftContent')) {
    this.wordCount = this.userDraftContent
      .split(/\s+/)
      .filter(word => word.length > 0).length;
    
    // Update last auto-save if content changed
    if (this.userDraftContent && this.userDraftContent.length > 0) {
      this.lastAutoSave = new Date();
      this.autoSaveCount += 1;
    }
  }
  next();
});

// Instance methods
writingSessionSchema.methods.updateDraft = function(content) {
  this.userDraftContent = content;
  this.lastAutoSave = new Date();
  return this.save();
};

writingSessionSchema.methods.completeSession = function(finalContent, confidenceAfter, feedback = {}) {
  this.userDraftContent = finalContent;
  this.confidenceAfter = confidenceAfter;
  this.completionStatus = 'completed';
  this.currentStep = 'completed';
  this.userFeedback = { ...this.userFeedback, ...feedback };
  return this.save();
};

writingSessionSchema.methods.abandonSession = function() {
  this.completionStatus = 'abandoned';
  return this.save();
};

writingSessionSchema.methods.updateFlowTime = function(additionalSeconds) {
  this.flowTimeSeconds += additionalSeconds;
  return this.save();
};

// Static methods
writingSessionSchema.statics.findActiveSession = function(userId) {
  return this.findOne({
    userId,
    completionStatus: 'draft'
  }).sort({ updatedAt: -1 });
};

writingSessionSchema.statics.getUserSessions = function(userId, limit = 20) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
};

writingSessionSchema.statics.getSessionAnalytics = function(userId, dateRange = {}) {
  const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (dateRange.from || dateRange.to) {
    matchStage.createdAt = {};
    if (dateRange.from) matchStage.createdAt.$gte = new Date(dateRange.from);
    if (dateRange.to) matchStage.createdAt.$lte = new Date(dateRange.to);
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        completedSessions: {
          $sum: { $cond: [{ $eq: ['$completionStatus', 'completed'] }, 1, 0] }
        },
        averageConfidenceGain: {
          $avg: {
            $cond: [
              { $and: ['$confidenceBefore', '$confidenceAfter'] },
              { $subtract: ['$confidenceAfter', '$confidenceBefore'] },
              null
            ]
          }
        },
        totalFlowTime: { $sum: '$flowTimeSeconds' },
        totalWordCount: { $sum: '$wordCount' },
        emailTypeBreakdown: {
          $push: '$emailType'
        }
      }
    }
  ]);
};

export default mongoose.model('WritingSession', writingSessionSchema);