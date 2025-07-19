import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit3, FiTrendingUp, FiHeart, FiTarget, FiCalendar, FiStar, FiZap } = FiIcons;

const Dashboard = () => {
  const { user, userProgress } = useUser();
  const { trackReturnUsage } = useAnalytics();

  useEffect(() => {
    // Track return usage if they have a previous session
    if (userProgress.lastWritingSession) {
      const lastSession = new Date(userProgress.lastWritingSession);
      const daysSince = Math.floor((new Date() - lastSession) / (1000 * 60 * 60 * 24));
      if (daysSince > 0) {
        trackReturnUsage(daysSince);
      }
    }
  }, []);

  const quickActions = [
    {
      title: 'Write a new email',
      description: 'Get a magic prompt and write with confidence',
      icon: FiEdit3,
      link: '/write',
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'View your progress',
      description: 'See how your confidence is growing',
      icon: FiTrendingUp,
      link: '/progress',
      color: 'from-green-400 to-blue-500'
    }
  ];

  const recentAchievements = userProgress.achievements.slice(-3);

  const getStreakMessage = () => {
    if (userProgress.emailsWritten === 0) {
      return "Ready to write your first email?";
    }
    if (userProgress.emailsWritten === 1) {
      return "Great start! One email down.";
    }
    if (userProgress.emailsWritten < 5) {
      return `Building momentum - ${userProgress.emailsWritten} emails completed!`;
    }
    return `You're on fire - ${userProgress.emailsWritten} emails and counting!`;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <SafeIcon icon={FiHeart} className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name || 'there'}! 👋
            </h1>
            <p className="text-gray-600">
              {getStreakMessage()}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Enhanced Progress Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiEdit3} className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-500">Emails Written</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userProgress.emailsWritten}</p>
          <p className="text-sm text-green-600 mt-1">
            {userProgress.totalWordsWritten > 0 && `${userProgress.totalWordsWritten} words total`}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiTarget} className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-500">Confidence Score</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userProgress.confidenceScore}%</p>
          <p className="text-sm text-green-600 mt-1">
            {userProgress.confidenceScore > 50 ? 'Growing strong!' : 'Building up!'}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiHeart} className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-500">Sounds Like Me</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {userProgress.successMetrics?.soundsLikeMeCount || 0}
          </p>
          <p className="text-sm text-purple-600 mt-1">authentic emails</p>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiZap} className="w-5 h-5 text-orange-500" />
            <span className="text-sm font-medium text-gray-500">Inspired Sessions</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {(userProgress.successMetrics?.inspiredCount || 0) + (userProgress.successMetrics?.energizedCount || 0)}
          </p>
          <p className="text-sm text-orange-600 mt-1">feeling great!</p>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What would you like to do?</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {quickActions.map((action, index) => (
            <Link key={index} to={action.link}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br ${action.color} rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all`}
              >
                <SafeIcon icon={action.icon} className="w-8 h-8 mb-4" />
                <h3 className="text-xl font-semibold mb-2">{action.title}</h3>
                <p className="text-white/80">{action.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Recent Achievements */}
      {recentAchievements.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent achievements</h2>
          <div className="bg-white rounded-2xl p-6 shadow-lg">
            <div className="space-y-4">
              {recentAchievements.map((achievement, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                    <SafeIcon icon={FiStar} className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{achievement.title}</p>
                    <p className="text-sm text-gray-600">{achievement.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Willy's Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-blue-50 rounded-2xl p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">W</span>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Message from Willy</h3>
            <p className="text-blue-700 leading-relaxed">
              {userProgress.emailsWritten === 0 
                ? `Hey ${user?.name}! Ready to write your first email that sounds authentically you? I've got some great prompts waiting that'll help you trust your voice.`
                : `Hey ${user?.name}! I love seeing your confidence grow with each email. You've written ${userProgress.emailsWritten} authentic ${userProgress.emailsWritten === 1 ? 'email' : 'emails'} - that's real progress in trusting your voice!`
              }
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;