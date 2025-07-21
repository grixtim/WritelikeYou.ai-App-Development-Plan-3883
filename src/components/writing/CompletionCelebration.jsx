import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../contexts/UserContext';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiEdit3, FiHome, FiBrain, FiZap, FiStar, FiTrendingUp } = FiIcons;

const CompletionCelebration = ({ emailContent, sessionData, emailType, onStartNew }) => {
  const { user, userProgress, updateProgress } = useUser();
  const { trackEvent } = useAnalytics();
  const [showSuccessMetrics, setShowSuccessMetrics] = useState(false);
  const [userFeedback, setUserFeedback] = useState({
    soundsLikeMe: null,
    feelingAfterWriting: null,
    confidenceGain: sessionData.confidenceAfter - (sessionData.confidenceBefore || 5)
  });

  const wordCount = emailContent.split(' ').filter(word => word.length > 0).length;
  const isFirstEmail = userProgress.emailsWritten === 0;
  const totalEmailsAfterThis = userProgress.emailsWritten + 1;

  useEffect(() => {
    // Update user progress
    updateProgress(prev => ({
      ...prev,
      emailsWritten: prev.emailsWritten + 1,
      confidenceScore: Math.round((prev.confidenceScore + sessionData.confidenceAfter) / 2),
      lastWritingSession: new Date().toISOString(),
      totalWordsWritten: (prev.totalWordsWritten || 0) + wordCount
    }));

    // Track completion
    trackEvent('writing_session_completed', {
      emailType,
      wordCount,
      timeSpent: sessionData.totalTime,
      confidenceGain: userFeedback.confidenceGain,
      isFirstEmail
    });
  }, []);

  const handleSuccessMetricSubmit = (metric, value) => {
    const newFeedback = { ...userFeedback, [metric]: value };
    setUserFeedback(newFeedback);

    // Track success metrics
    trackEvent('success_metric_reported', {
      metric,
      value,
      emailType,
      emailNumber: totalEmailsAfterThis
    });

    // Show celebration after both metrics are collected
    if (newFeedback.soundsLikeMe !== null && newFeedback.feelingAfterWriting !== null) {
      setTimeout(() => setShowSuccessMetrics(true), 500);
    }
  };

  const getEmailTypeDisplayName = (type) => {
    const names = {
      cart_open: 'cart open announcement',
      belief_shifting: 'belief shifting email',
      social_proof: 'social proof email',
      cart_close: 'cart close email'
    };
    return names[type] || type;
  };

  const getMilestoneMessage = (count) => {
    if (count === 1) return "🎉 Your first email is complete!";
    if (count === 5) return "🚀 Five emails strong!";
    if (count === 10) return "⭐ Double digits - you're building real momentum!";
    if (count % 10 === 0) return `🏆 ${count} emails completed - you're on fire!`;
    return `📝 Email #${count} complete`;
  };

  const myEncouragements = [
    "You did it! You leaned into what you naturally know about your clients and it created something that sounds exactly like you. That's the kind of email that actually moves people to action.",
    "Look at this! You trusted your voice and wrote something real. Your best-fit clients are going to feel that authenticity - and that's what helps them decide.",
    "This is exactly what I'm talking about - you wrote something that sounds like YOU, not like everyone else. That's copywriting gold right there.",
    "You just proved something important: you don't need to be perfect to write emails that connect. You need to be you.",
    "Every time you ship something authentic like this, you're building that confidence muscle stronger. Your voice matters more than you know."
  ];

  const selectedEncouragement = myEncouragements[Math.floor(Math.random() * myEncouragements.length)];

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
      {/* Initial Celebration */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
        className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <SafeIcon icon={FiCheckCircle} className="w-10 h-10 text-white" />
      </motion.div>

      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        {getMilestoneMessage(totalEmailsAfterThis)}
      </h1>

      {/* My Main Encouragement */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">W</span>
          </div>
          <div className="text-left">
            <p className="text-blue-800 leading-relaxed text-lg">
              {selectedEncouragement}
            </p>
          </div>
        </div>
      </div>

      {/* Success Metrics Collection */}
      {userFeedback.soundsLikeMe === null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Quick check-in: Does this email sound like you?
          </h3>
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => handleSuccessMetricSubmit('soundsLikeMe', true)}
              className="px-6 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all flex items-center space-x-2"
            >
              <SafeIcon icon={FiCheckCircle} className="w-5 h-5" />
              <span>Yes, totally me!</span>
            </button>
            <button
              onClick={() => handleSuccessMetricSubmit('soundsLikeMe', false)}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-300 transition-all"
            >
              <span>Getting closer</span>
            </button>
          </div>
        </motion.div>
      )}

      {userFeedback.soundsLikeMe !== null && userFeedback.feelingAfterWriting === null && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            How are you feeling after writing this?
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'inspired', label: 'Inspired', icon: FiZap },
              { key: 'energized', label: 'Energized', icon: FiStar },
              { key: 'confident', label: 'Confident', icon: FiTrendingUp },
              { key: 'relieved', label: 'Relieved', icon: FiBrain }
            ].map((feeling) => (
              <button
                key={feeling.key}
                onClick={() => handleSuccessMetricSubmit('feelingAfterWriting', feeling.key)}
                className="p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center space-x-3"
              >
                <SafeIcon icon={feeling.icon} className="w-5 h-5 text-blue-500" />
                <span className="font-medium text-gray-700">{feeling.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Progress Summary */}
      {showSuccessMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid md:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-blue-50 rounded-2xl p-6">
            <SafeIcon icon={FiEdit3} className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{wordCount}</p>
            <p className="text-sm text-gray-600">words written</p>
          </div>

          <div className="bg-green-50 rounded-2xl p-6">
            <SafeIcon icon={FiTrendingUp} className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {userFeedback.confidenceGain > 0 ? '+' : ''}{userFeedback.confidenceGain}
            </p>
            <p className="text-sm text-gray-600">confidence boost</p>
          </div>

          <div className="bg-purple-50 rounded-2xl p-6">
            <SafeIcon icon={FiBrain} className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">{totalEmailsAfterThis}</p>
            <p className="text-sm text-gray-600">emails completed</p>
          </div>

          <div className="bg-orange-50 rounded-2xl p-6">
            <SafeIcon icon={FiZap} className="w-8 h-8 text-orange-500 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {Math.round(sessionData.activeWritingTime / 60)}
            </p>
            <p className="text-sm text-gray-600">minutes in flow</p>
          </div>
        </motion.div>
      )}

      {/* Email Type Badge */}
      <div className="mb-6">
        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {getEmailTypeDisplayName(emailType)} ✓
        </span>
      </div>

      {/* Actions */}
      {showSuccessMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
        >
          <motion.button
            onClick={onStartNew}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
          >
            <SafeIcon icon={FiEdit3} className="w-5 h-5" />
            <span>Write another email</span>
          </motion.button>

          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <SafeIcon icon={FiHome} className="w-5 h-5" />
              <span>Back to dashboard</span>
            </motion.button>
          </Link>
        </motion.div>
      )}

      {/* Final Message */}
      {showSuccessMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">W</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-blue-900 mb-2">Keep building that confidence</h3>
              <p className="text-blue-700 leading-relaxed">
                {userFeedback.soundsLikeMe
                  ? "I love that this email sounds like you! That authentic voice is your superpower."
                  : "You're getting closer to finding your authentic voice - that's exactly how this works."
                } Every email you write is practice in trusting yourself. Your best-fit clients will feel that authenticity way more than any 'perfect' template.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CompletionCelebration;