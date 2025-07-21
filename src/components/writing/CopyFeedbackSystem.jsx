import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import { willyAPI } from '../../utils/willyAPI';
import * as FiIcons from 'react-icons/fi';

const { FiMessageSquare, FiThumbsUp, FiStar, FiCheck, FiLoader } = FiIcons;

const CopyFeedbackSystem = ({ emailContent, emailType, onComplete }) => {
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showingDetails, setShowingDetails] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    generateFeedback();
  }, [emailContent, emailType]);

  const generateFeedback = async () => {
    setIsLoading(true);
    try {
      const response = await willyAPI.generateCopyFeedback(emailContent, emailType);
      setFeedback(response);
    } catch (error) {
      console.error('Error generating feedback:', error);
      // Fallback to basic feedback
      setFeedback(getFallbackFeedback());
    } finally {
      setIsLoading(false);
      setIsReady(true);
    }
  };

  const getFallbackFeedback = () => {
    return {
      strengths: [
        {
          example: "Your opening line is direct and engaging",
          reasoning: "It immediately establishes what this email is about, which helps your reader quickly decide if it's relevant to them"
        },
        {
          example: "You've included personal details",
          reasoning: "Sharing your own experience makes you relatable and builds trust with your audience"
        }
      ],
      suggestions: [
        {
          suggestion: "Consider adding a clear call-to-action at the end",
          reasoning: "This gives your readers a specific next step, making it more likely they'll take action"
        },
        {
          suggestion: "You might want to break up longer paragraphs",
          reasoning: "Shorter paragraphs are easier to scan, especially on mobile devices"
        }
      ],
      overallImpression: "Your authentic voice really shines through in this draft. You've created something that feels genuine and connects with your audience."
    };
  };

  const handleComplete = () => {
    onComplete();
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiLoader} className="w-8 h-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            I'm reading your draft...
          </h2>
          <p className="text-lg text-gray-600">
            Looking for what's working well and where you might strengthen it
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiThumbsUp} className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          You've got something good here!
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          Here's what's already working well, plus a couple focused suggestions to make it even stronger
        </p>
      </div>

      {/* Overall Impression */}
      <div className="bg-blue-50 rounded-2xl p-6 mb-8">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">W</span>
          </div>
          <div className="text-left">
            <p className="text-blue-800 leading-relaxed text-lg">
              {feedback.overallImpression}
            </p>
          </div>
        </div>
      </div>

      {/* Strengths Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <SafeIcon icon={FiStar} className="w-5 h-5 text-yellow-500 mr-2" />
          Here's what you're already doing brilliantly:
        </h3>
        <div className="space-y-4">
          {feedback.strengths.map((strength, index) => (
            <div key={index} className="bg-green-50 rounded-xl p-5">
              <p className="text-green-800 font-medium mb-2">
                {strength.example}
              </p>
              <p className="text-green-700 text-sm">
                <span className="font-medium">Why this works:</span> {strength.reasoning}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions Section */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {feedback.suggestions.length > 0 ? "To make it even stronger:" : "This is already strong as is!"}
        </h3>
        {feedback.suggestions.length > 0 && (
          <div className="space-y-4">
            {feedback.suggestions.map((suggestion, index) => (
              <div key={index} className="bg-purple-50 rounded-xl p-5">
                <p className="text-purple-800 font-medium mb-2">
                  {suggestion.suggestion}
                </p>
                <p className="text-purple-700 text-sm">
                  <span className="font-medium">Why:</span> {suggestion.reasoning}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center pt-4">
        <motion.button
          onClick={handleComplete}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2"
        >
          <SafeIcon icon={FiCheck} className="w-5 h-5" />
          <span>Got it, thanks!</span>
        </motion.button>
      </div>

      {/* My final encouragement */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>My tip:</strong> Remember, your authentic voice is what makes your emails special. These suggestions are just options - trust your instincts about what feels right for you and your audience!
        </p>
      </div>
    </motion.div>
  );
};

export default CopyFeedbackSystem;