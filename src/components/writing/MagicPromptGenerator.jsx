import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAnalytics } from '../../contexts/AnalyticsContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSpark, FiRefreshCw, FiArrowRight } = FiIcons;

const MagicPromptGenerator = ({ user, emailType, objectionBelief, onPromptGenerated }) => {
  const { trackMagicPromptMoment } = useAnalytics();
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [confidenceLevel, setConfidenceLevel] = useState(5);

  const generatePrompt = () => {
    setIsGenerating(true);
    
    // Simulate prompt generation based on email type and user data
    setTimeout(() => {
      const prompts = getPromptsForEmailType(emailType, user, objectionBelief);
      const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      
      setCurrentPrompt(selectedPrompt);
      setIsGenerating(false);
      
      trackMagicPromptMoment({
        type: selectedPrompt.type,
        emailType: emailType,
        confidenceBefore: confidenceLevel,
        inspirationLevel: Math.floor(Math.random() * 5) + 6 // 6-10 scale
      });
    }, 2000);
  };

  const getPromptsForEmailType = (type, userData, objection) => {
    const offerName = userData?.enhancedOffer?.offerName || userData?.offer?.title || 'your offer';
    
    switch (type) {
      case 'cart_open':
        return [
          {
            type: 'cart_open_excitement',
            title: 'Channel your genuine excitement',
            content: `Think about the moment you decided to create ${offerName}. What were you most excited about offering people? Start your email with: "I've been waiting to share this with you..." and let that genuine enthusiasm guide your words. Remember, they're already on your list because they're interested - now help them feel that same excitement you felt when you decided to create this.`
          },
          {
            type: 'cart_open_timing',
            title: 'Address the "why now" question',
            content: `Your best-fit clients might be thinking "this sounds great, but why should I say yes right now?" Write an email that starts with: "You might be wondering if now is the right time..." Then share 2-3 gentle, logical reasons why someone like them would benefit from starting now rather than waiting. Think about what's true for your ideal clients' current situation.`
          }
        ];
        
      case 'objection_addressing':
        return [
          {
            type: 'objection_normalize_reframe',
            title: 'Normalize, then lovingly reframe',
            content: `Your best-fit clients are thinking: "${objection || 'this might not work for me'}." Start your email with: "I know some of you might be thinking..." and acknowledge this concern with genuine understanding. Then share a story (yours or a client's) that gently shows how this very concern actually makes them PERFECT for ${offerName}. The goal isn't to dismiss their worry - it's to help them see it differently.`
          },
          {
            type: 'objection_story_based',
            title: 'Share a relatable transformation story',
            content: `Think of someone (maybe you, maybe a client) who had this exact concern: "${objection || 'this probably won\'t work for me'}." Tell their story - what they were thinking, how they felt, what changed their mind, and what happened when they took action. Start with: "I want to tell you about [someone] who thought exactly what you might be thinking right now..." Let the story do the reframing work.`
          }
        ];
        
      case 'social_proof':
        return [
          {
            type: 'social_proof_behind_scenes',
            title: 'Share the real, messy human moments',
            content: `Think about a client result or testimonial that shows the very human, real side of transformation with ${offerName}. Don't just share "this program was amazing" - find the quote that shows the actual feelings, doubts, and breakthroughs. Start your email with: "I got a message yesterday that I had to share with you..." and let their authentic voice tell the story.`
          },
          {
            type: 'social_proof_pattern',
            title: 'Show the pattern of transformation',
            content: `You've probably noticed a pattern in how people experience ${offerName}. Write an email that starts with: "I keep seeing the same beautiful pattern with my clients..." and share 2-3 client examples that show different people having similar positive experiences. Focus on the emotions and realizations, not just the tactics or outcomes.`
          }
        ];
        
      case 'cart_close':
        return [
          {
            type: 'cart_close_future_self',
            title: 'Help them connect with their future self',
            content: `It's the final day for ${offerName}. Write an email that helps your best-fit clients imagine how they'll feel in 3-6 months if they say yes now versus if they wait. Start with: "A year from now, you'll be grateful you..." Keep it grounded in reality and focused on what they actually want for themselves. What would their future self want them to decide today?`
          },
          {
            type: 'cart_close_gentle_urgency',
            title: 'Create honest, gentle urgency',
            content: `This is it - the final hours for ${offerName}. Your best-fit clients need to know this opportunity is ending, but in a way that feels honest and caring, not pressured. Start with: "I don't want you to miss this if it's meant for you..." and remind them why this matters and what they'd be missing if they wait. Keep it short, direct, and from the heart.`
          }
        ];
        
      default:
        return [
          {
            type: 'general_authentic',
            title: 'Write from your authentic perspective',
            content: `Think about what you most want your best-fit clients to know about ${offerName} right now. What's the one thing that, if they really understood it, would help them make the right decision for themselves? Start your email with that thought and let your genuine care for their success guide your words.`
          }
        ];
    }
  };

  const handleUsePrompt = () => {
    onPromptGenerated(currentPrompt, confidenceLevel, emailType, objectionBelief);
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
          Based on what you've told me about your {user?.enhancedOffer?.offerName || 'offer'} and 
          that you're writing a {emailType.replace('_', ' ')} email, I'll generate a personalized 
          writing prompt that sparks authentic ideas.
        </p>
      </div>

      {/* Confidence Check */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How confident are you feeling about writing this email right now?
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Not confident</span>
          <div className="flex space-x-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
              <button
                key={level}
                onClick={() => setConfidenceLevel(level)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                  confidenceLevel >= level
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          <span className="text-sm text-gray-500">Very confident</span>
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
                <SafeIcon icon={FiRefreshCw} className="w-5 h-5 animate-spin" />
                <span>Creating your magic prompt...</span>
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
            <h3 className="text-xl font-bold text-purple-900 mb-4">
              ✨ {currentPrompt.title}
            </h3>
            <p className="text-purple-800 leading-relaxed text-lg">
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

export default MagicPromptGenerator;