import React from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiTarget, FiEdit3, FiCalendar, FiStar, FiHeart } = FiIcons;

const ProgressTracker = () => {
  const { user, userProgress } = useUser();

  const confidenceHistory = [
    { date: '2024-01-01', score: 3 },
    { date: '2024-01-05', score: 5 },
    { date: '2024-01-10', score: 6 },
    { date: '2024-01-15', score: 7 },
    { date: '2024-01-20', score: 8 },
  ];

  const achievements = [
    {
      title: 'First Email',
      description: 'You wrote your first authentic email!',
      icon: FiEdit3,
      unlocked: userProgress.emailsWritten >= 1,
      color: 'from-blue-500 to-purple-600'
    },
    {
      title: 'Confidence Builder',
      description: 'Your confidence increased by 3+ points',
      icon: FiTrendingUp,
      unlocked: userProgress.confidenceScore >= 6,
      color: 'from-green-400 to-blue-500'
    },
    {
      title: 'Consistent Writer',
      description: 'You wrote emails for 3 days in a row',
      icon: FiCalendar,
      unlocked: userProgress.streakDays >= 3,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Voice Finder',
      description: 'You completed 5 writing sessions',
      icon: FiHeart,
      unlocked: userProgress.emailsWritten >= 5,
      color: 'from-red-400 to-pink-500'
    },
    {
      title: 'Confidence Master',
      description: 'You reached 90% confidence',
      icon: FiStar,
      unlocked: userProgress.confidenceScore >= 90,
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your Writing Journey
        </h1>
        <p className="text-gray-600">
          Track your progress and celebrate how your confidence is growing
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiEdit3} className="w-6 h-6 text-blue-500" />
            <span className="text-sm font-medium text-gray-500">Emails Written</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userProgress.emailsWritten}</p>
          <p className="text-sm text-green-600 mt-1">+1 this week</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiTarget} className="w-6 h-6 text-green-500" />
            <span className="text-sm font-medium text-gray-500">Confidence</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userProgress.confidenceScore}%</p>
          <p className="text-sm text-green-600 mt-1">+15% from start</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiCalendar} className="w-6 h-6 text-purple-500" />
            <span className="text-sm font-medium text-gray-500">Streak</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{userProgress.streakDays} days</p>
          <p className="text-sm text-blue-600 mt-1">Keep it up!</p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiStar} className="w-6 h-6 text-yellow-500" />
            <span className="text-sm font-medium text-gray-500">Achievements</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {achievements.filter(a => a.unlocked).length}
          </p>
          <p className="text-sm text-gray-500 mt-1">of {achievements.length}</p>
        </div>
      </motion.div>

      {/* Confidence Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-8 shadow-lg mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Confidence Growth Over Time
        </h2>
        <div className="h-64 flex items-end justify-between space-x-2">
          {confidenceHistory.map((point, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-gradient-to-t from-blue-500 to-purple-600 rounded-t-lg transition-all duration-1000"
                style={{ height: `${(point.score / 10) * 100}%` }}
              />
              <p className="text-xs text-gray-500 mt-2">
                {new Date(point.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-8 shadow-lg"
      >
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Achievements
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className={`p-6 rounded-2xl border-2 transition-all ${
                achievement.unlocked
                  ? 'border-transparent bg-gradient-to-br ' + achievement.color + ' text-white shadow-lg'
                  : 'border-gray-200 bg-gray-50 text-gray-400'
              }`}
            >
              <SafeIcon 
                icon={achievement.icon} 
                className={`w-8 h-8 mb-4 ${
                  achievement.unlocked ? 'text-white' : 'text-gray-400'
                }`} 
              />
              <h3 className={`font-semibold mb-2 ${
                achievement.unlocked ? 'text-white' : 'text-gray-600'
              }`}>
                {achievement.title}
              </h3>
              <p className={`text-sm ${
                achievement.unlocked ? 'text-white/80' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
              {achievement.unlocked && (
                <div className="mt-3 flex items-center space-x-1">
                  <SafeIcon icon={FiStar} className="w-4 h-4 text-yellow-300" />
                  <span className="text-xs text-white/80">Unlocked!</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Willy's Reflection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-8 bg-blue-50 rounded-2xl p-6"
      >
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">W</span>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-2">Willy's reflection</h3>
            <p className="text-blue-700 leading-relaxed">
              Look at this progress, {user?.name}! You're not just writing more emails - 
              you're building trust in your authentic voice. Each email you ship is proof 
              that you don't need to be perfect to connect with your best-fit clients. 
              Keep going - your voice matters more than you know.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProgressTracker;