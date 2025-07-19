import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { willyAPI } from '../../utils/willyAPI';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBookOpen, FiArrowRight, FiMessageCircle, FiLoader } = FiIcons;

const AIEnhancedMiniLesson = ({ emailType, setupData, additionalContext, onLessonComplete }) => {
  const [lesson, setLesson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showClarificationInput, setShowClarificationInput] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState('');

  useEffect(() => {
    generateLesson();
  }, [emailType, setupData]);

  const generateLesson = async () => {
    setIsLoading(true);
    try {
      const response = await willyAPI.generateContextualMiniLesson(emailType, setupData, additionalContext);
      setLesson(response);
    } catch (error) {
      console.error('Error generating lesson:', error);
      // Fallback to default lesson
      setLesson(getDefaultLesson(emailType));
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultLesson = (type) => {
    const defaultLessons = {
      cart_open: {
        title: "Excitement and Decision-Making",
        content: "When people are excited about an opportunity, they make decisions based on both desire and justification. Your cart open email needs to honor the excitement while giving logical reasons why now is the right time."
      },
      belief_shifting: {
        title: "Meeting People Where They Are",
        content: "Instead of arguing with limiting beliefs, we meet people where they are and offer a new, more helpful way to see their situation. The most powerful reframes show how their perceived limitation is actually their strength."
      },
      social_proof: {
        title: "The Real Magic of Social Proof",
        content: "The most powerful social proof isn't polished testimonials - it's the messy, human, real moments where someone sounds exactly like your best-fit clients feel right now."
      },
      cart_close: {
        title: "Future Pacing and Decision Pressure",
        content: "Cart close emails help people imagine two futures - one where they take action and one where they don't. The key is emotional connection to their desired future, not pressure tactics."
      }
    };
    return defaultLessons[type] || defaultLessons.cart_open;
  };

  const handleContinue = () => {
    onLessonComplete();
  };

  const handleQuestionSubmit = () => {
    alert(`Great question! Willy would respond to: "${clarificationQuestion}"`);
    setClarificationQuestion('');
    setShowClarificationInput(false);
  };

  const getColorScheme = (type) => {
    const colors = {
      cart_open: 'from-blue-500 to-blue-600',
      belief_shifting: 'from-orange-500 to-red-500',
      social_proof: 'from-green-500 to-green-600',
      cart_close: 'from-purple-500 to-purple-600'
    };
    return colors[type] || colors.cart_open;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <div className="text-center">
          <div className={`w-16 h-16 bg-gradient-to-br ${getColorScheme(emailType)} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
            <SafeIcon icon={FiLoader} className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Willy's preparing your personalized mini-lesson...
          </h2>
          <p className="text-gray-600">
            Connecting the psychology to your specific situation
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 bg-gradient-to-br ${getColorScheme(emailType)} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <SafeIcon icon={FiBookOpen} className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Mini-lesson: {lesson.title}
        </h2>
        <p className="text-lg text-gray-600">
          Understanding the psychology behind this email type
        </p>
      </div>

      {/* Personalized Introduction */}
      {lesson.personalizedIntro && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-50 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">W</span>
            </div>
            <div className="text-left text-yellow-800 leading-relaxed">
              {lesson.personalizedIntro}
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Lesson Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">W</span>
          </div>
          <div className="text-left text-blue-800 leading-relaxed whitespace-pre-line">
            {lesson.content}
          </div>
        </div>
      </motion.div>

      {/* Clarification Question Section */}
      <div className="mb-8">
        {!showClarificationInput ? (
          <div className="text-center">
            <button
              onClick={() => setShowClarificationInput(true)}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all mx-auto"
            >
              <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
              <span>Ask Willy a clarifying question</span>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gray-50 rounded-2xl p-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like me to clarify about this email type?
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={clarificationQuestion}
                onChange={(e) => setClarificationQuestion(e.target.value)}
                placeholder="e.g., How do I normalize without agreeing with their limiting belief?"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleQuestionSubmit}
                disabled={!clarificationQuestion.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-all"
              >
                Ask
              </button>
            </div>
            <button
              onClick={() => setShowClarificationInput(false)}
              className="text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              Never mind
            </button>
          </motion.div>
        )}
      </div>

      {/* Continue Section */}
      <div className="text-center space-y-6">
        <div className="bg-blue-50 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">W</span>
            </div>
            <div className="text-left">
              <p className="text-blue-800 leading-relaxed">
                How does that sound? Make sense? Ready to get your personalized magic prompt for this email?
              </p>
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleContinue}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 mx-auto"
        >
          <span>Yes, let's get my magic prompt!</span>
          <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> Keep this lesson in mind as you write. The psychology behind 
          your email type will guide you toward more authentic and effective messaging.
        </p>
      </div>
    </div>
  );
};

export default AIEnhancedMiniLesson;