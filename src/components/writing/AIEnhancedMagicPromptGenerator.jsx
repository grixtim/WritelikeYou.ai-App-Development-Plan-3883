import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import { willyAPI } from '../../utils/willyAPI';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSpark, FiRefreshCw, FiArrowRight, FiLoader } = FiIcons;

const AIEnhancedMagicPromptGenerator = ({ 
  user, 
  emailType, 
  beliefToShift, 
  additionalContext, 
  confidenceLevel,
  onPromptGenerated 
}) => {
  const { trackMagicPromptMoment } = useAnalytics();
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePrompt = async () => {
    setIsGenerating(true);
    
    try {
      const response = await willyAPI.generateMagicPrompt(
        emailType, 
        user.enhancedOffer || user, 
        confidenceLevel, 
        additionalContext
      );
      
      setCurrentPrompt(response);
      
      trackMagicPromptMoment({
        type: response.type,
        emailType: emailType,
        confidenceBefore: confidenceLevel,
        inspirationLevel: response.inspirationLevel
      });
    } catch (error) {
      console.error('Error generating prompt:', error);
      // Fallback to a basic prompt
      setCurrentPrompt(getFallbackPrompt());
    } finally {
      setIsGenerating(false);
    }
  };

  const getFallbackPrompt = () => {
    const offerName = user?.enhancedOffer?.offerName || user?.offer?.title || 'your offer';
    return {
      type: 'fallback_authentic',
      title: 'Write from your authentic perspective',
      content: `Think about what you most want your best-fit clients to know about ${offerName} right now. What's the one thing that, if they really understood it, would help them make the right decision for themselves? Start your email with that thought and let your genuine care for their success guide your words.`,
      inspirationLevel: 7
    };
  };

  const handleUsePrompt = () => {
    onPromptGenerated(currentPrompt, confidenceLevel, emailType, beliefToShift, additionalContext);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiSpark} className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Let's create your magic prompt
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Based on everything you've shared about your {user?.enhancedOffer?.offerName || 'offer'} and 
          that you're writing a {emailType.replace('_', ' ')} email, I'll generate a personalized 
          writing prompt that sparks authentic ideas.
        </p>
      </div>

      {/* Current Confidence Level Display */}
      <div className="mb-8 bg-blue-50 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-blue-700 mb-1">
              Your confidence coconuts going in:
            </p>
            <div className="flex items-center space-x-2">
              <span className="text-lg">
                {Array.from({ length: confidenceLevel }, (_, i) => '🥥').join('')}
              </span>
              <span className="text-blue-600 font-medium">({confidenceLevel}/10)</span>
            </div>
          </div>
          {additionalContext && (
            <div className="text-right max-w-xs">
              <p className="text-xs text-blue-600 mb-1">Your intention:</p>
              <p className="text-sm text-blue-800 italic">"{additionalContext}"</p>
            </div>
          )}
        </div>
      </div>

      {/* Generate Prompt Button */}
      {!currentPrompt && (
        <div className="text-center">
          <motion.button
            onClick={generatePrompt}
            disabled={isGenerating}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
                <span>Willy's creating your magic prompt...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <SafeIcon icon={FiSpark} className="w-5 h-5" />
                <span>Generate my magic prompt</span>
              </div>
            )}
          </motion.button>
        </div>
      )}

      {/* Generated Prompt */}
      {currentPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-start space-x-4 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">W</span>
              </div>
              <div className="text-left">
                <h3 className="text-xl font-bold text-purple-900 mb-2">
                  ✨ {currentPrompt.title}
                </h3>
              </div>
            </div>
            <p className="text-purple-800 leading-relaxed text-lg pl-14">
              {currentPrompt.content}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={generatePrompt}
              className="px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all flex items-center space-x-2"
            >
              <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
              <span>Try another prompt</span>
            </button>

            <motion.button
              onClick={handleUsePrompt}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-1 px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
            >
              <span>Yes! Let's write with this</span>
              <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> The best prompts feel a little scary and exciting at the same time. 
          If this prompt makes you think "I could write about that," you're on the right track!
        </p>
      </div>
    </div>
  );
};

export default AIEnhancedMagicPromptGenerator;