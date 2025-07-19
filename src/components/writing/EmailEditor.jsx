import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit3, FiClock, FiCheck, FiRefreshCw } = FiIcons;

const EmailEditor = ({ magicPrompt, emailType, onComplete }) => {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [timeSpent, setTimeSpent] = useState(0);
  const [confidenceAfter, setConfidenceAfter] = useState(5);
  const [showConfidenceCheck, setShowConfidenceCheck] = useState(false);

  // Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishWriting = () => {
    setShowConfidenceCheck(true);
  };

  const handleComplete = () => {
    onComplete(`Subject: ${subject}\n\n${content}`, confidenceAfter);
  };

  const wordCount = content.split(' ').filter(word => word.length > 0).length;

  const getEmailTypeDisplayName = (type) => {
    const names = {
      cart_open: 'cart open announcement',
      objection_addressing: 'objection addressing email',
      social_proof: 'social proof email',
      cart_close: 'cart close email'
    };
    return names[type] || type;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
      {!showConfidenceCheck ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Time to write!
              </h2>
              <p className="text-gray-600">
                Use your magic prompt as inspiration, but write in your authentic voice
              </p>
              <p className="text-sm text-blue-600 mt-1">
                Writing: {getEmailTypeDisplayName(emailType)}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center space-x-2 text-gray-500 text-sm">
                <SafeIcon icon={FiClock} className="w-4 h-4" />
                <span>{formatTime(timeSpent)}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{wordCount} words</p>
            </div>
          </div>

          {/* Magic Prompt Reminder */}
          <div className="bg-purple-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-purple-900 mb-2">
              ✨ Your magic prompt: {magicPrompt.title}
            </h3>
            <p className="text-purple-700 text-sm">
              {magicPrompt.content}
            </p>
          </div>

          {/* Email Editor */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What's this email really about?"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Start writing... remember, this doesn't have to be perfect. Just be you."
                rows={12}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none text-lg leading-relaxed"
              />
            </div>

            <div className="flex justify-between items-center pt-6">
              <div className="text-sm text-gray-500">
                <p>💡 Remember: Your best-fit clients want to hear from you, not a perfect copywriter</p>
              </div>
              <motion.button
                onClick={handleFinishWriting}
                disabled={!subject || !content || wordCount < 50}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                  subject && content && wordCount >= 50
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                <SafeIcon icon={FiCheck} className="w-5 h-5" />
                <span>I'm done writing!</span>
              </motion.button>
            </div>
          </div>
        </>
      ) : (
        /* Confidence Check */
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiCheck} className="w-8 h-8 text-white" />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Nice work! How are you feeling?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            You just wrote {wordCount} words in {formatTime(timeSpent)}. How confident do you feel about this {getEmailTypeDisplayName(emailType)}?
          </p>

          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Confidence level after writing
            </label>
            <div className="flex items-center justify-center space-x-4">
              <span className="text-sm text-gray-500">Less confident</span>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfidenceAfter(level)}
                    className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                      confidenceAfter >= level
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
              <span className="text-sm text-gray-500">More confident</span>
            </div>
          </div>

          <motion.button
            onClick={handleComplete}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
          >
            Complete this writing session
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default EmailEditor;