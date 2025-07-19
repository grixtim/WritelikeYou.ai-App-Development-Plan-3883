import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiZap, FiEdit3, FiHome, FiHeart, FiClock } = FiIcons;

const EnhancedWritingFeedback = ({ emailContent, sessionData, emailType, onStartNew }) => {
  const wordCount = emailContent.split(' ').filter(word => word.length > 0).length;
  const activeMinutes = Math.round(sessionData.activeWritingTime / 60);
  const totalMinutes = Math.round(sessionData.totalTime / 60);
  const confidenceGain = sessionData.confidenceAfter - (sessionData.confidenceBefore || 5);

  const getEmailTypeDisplayName = (type) => {
    const names = {
      cart_open: 'cart open announcement',
      belief_shifting: 'belief shifting email',
      social_proof: 'social proof email',
      cart_close: 'cart close email'
    };
    return names[type] || type;
  };

  const willyEncouragements = [
    `Alrighty, here's what you're already doing brilliantly - you wrote something that sounds like YOU. That's copywriting gold right there.`,
    `You did it! You wrote something real and authentic, and that's exactly what your best-fit clients want to hear.`,
    `Look at you trusting your voice! Every word you write builds that confidence muscle stronger.`,
    `This email has your personality all over it, and that's what makes it special. Your people will feel that.`,
    `You're learning to trust your authentic perspective, and honestly? That's the hardest and most important part.`
  ];

  const selectedEncouragement = willyEncouragements[Math.floor(Math.random() * willyEncouragements.length)];

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500 }}
        className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <SafeIcon icon={FiCheckCircle} className="w-10 h-10 text-white" />
      </motion.div>

      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        🎉 You shipped it!
      </h1>

      {/* Willy's Personalized Encouragement */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">W</span>
          </div>
          <div className="text-left">
            <p className="text-blue-800 leading-relaxed text-lg">
              {selectedEncouragement}
            </p>
          </div>
        </div>
      </div>

      {/* Enhanced Session Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-blue-50 rounded-2xl p-6">
          <SafeIcon icon={FiEdit3} className="w-8 h-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{wordCount}</p>
          <p className="text-sm text-gray-600">words written</p>
        </div>
        
        <div className="bg-green-50 rounded-2xl p-6">
          <SafeIcon icon={FiZap} className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">
            {confidenceGain > 0 ? '+' : ''}{confidenceGain}
          </p>
          <p className="text-sm text-gray-600">confidence boost</p>
        </div>
        
        <div className="bg-purple-50 rounded-2xl p-6">
          <SafeIcon icon={FiHeart} className="w-8 h-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatTime(sessionData.activeWritingTime)}</p>
          <p className="text-sm text-gray-600">in flow</p>
        </div>
        
        <div className="bg-orange-50 rounded-2xl p-6">
          <SafeIcon icon={FiClock} className="w-8 h-8 text-orange-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{formatTime(sessionData.totalTime)}</p>
          <p className="text-sm text-gray-600">total time</p>
        </div>
      </div>

      {/* Flow Analysis */}
      {sessionData.activeWritingTime > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-purple-900 mb-3">
            ✨ Your Flow Analysis
          </h3>
          <div className="text-purple-800">
            <p className="mb-2">
              You spent <strong>{formatTime(sessionData.activeWritingTime)}</strong> actively writing out of <strong>{formatTime(sessionData.totalTime)}</strong> total time.
            </p>
            <p className="text-sm">
              That's {Math.round((sessionData.activeWritingTime / sessionData.totalTime) * 100)}% flow time - 
              {sessionData.activeWritingTime / sessionData.totalTime > 0.7 ? ' amazing focus!' : 
               sessionData.activeWritingTime / sessionData.totalTime > 0.5 ? ' solid writing session!' : 
               ' room to get even more in flow next time!'}
            </p>
          </div>
        </div>
      )}

      {/* Email Type Badge */}
      <div className="mb-6">
        <span className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {getEmailTypeDisplayName(emailType)} ✓
        </span>
      </div>

      {/* Email Preview */}
      <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left">
        <h3 className="font-semibold text-gray-900 mb-4">Your email:</h3>
        <div className="bg-white rounded-xl p-4 border max-h-64 overflow-y-auto">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans">
            {emailContent}
          </pre>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
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
      </div>

      {/* Final Willy Message */}
      <div className="mt-8 bg-blue-50 rounded-2xl p-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">W</span>
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-blue-900 mb-2">One more thing...</h3>
            <p className="text-blue-700 leading-relaxed">
              Notice how it feels to write something that sounds like you? That's the feeling we're chasing. 
              Your best-fit clients will connect with this authenticity way more than any "perfect" template. 
              You're building something real here - keep trusting that voice of yours.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedWritingFeedback;