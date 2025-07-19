import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit3, FiCheck, FiMessageCircle, FiX, FiMinimize2, FiMaximize2, FiThumbsUp } = FiIcons;

const FlowTrackingEmailEditor = ({ magicPrompt, emailType, onComplete, onRequestFeedback }) => {
  const [content, setContent] = useState('');
  const [activeWritingTime, setActiveWritingTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [isWriting, setIsWriting] = useState(false);
  const [lastKeystroke, setLastKeystroke] = useState(null);
  const [confidenceAfter, setConfidenceAfter] = useState(5);
  const [showConfidenceCheck, setShowConfidenceCheck] = useState(false);
  const [showWillySidebar, setShowWillySidebar] = useState(false);
  const [willyMessage, setWillyMessage] = useState('');
  const [willyConversation, setWillyConversation] = useState([
    {
      type: 'willy',
      content: "Hey! I'm right here if you need me. How's the writing feeling so far?",
      timestamp: new Date()
    }
  ]);

  const keystrokeTimeoutRef = useRef(null);
  const totalTimeIntervalRef = useRef(null);
  const activeTimeIntervalRef = useRef(null);

  // Start total time tracking
  useEffect(() => {
    totalTimeIntervalRef.current = setInterval(() => {
      setTotalTime(prev => prev + 1);
    }, 1000);

    return () => {
      if (totalTimeIntervalRef.current) {
        clearInterval(totalTimeIntervalRef.current);
      }
      if (activeTimeIntervalRef.current) {
        clearInterval(activeTimeIntervalRef.current);
      }
      if (keystrokeTimeoutRef.current) {
        clearTimeout(keystrokeTimeoutRef.current);
      }
    };
  }, []);

  // Handle active writing detection
  const handleContentChange = (e) => {
    setContent(e.target.value);
    setLastKeystroke(new Date());

    // Start active writing session if not already writing
    if (!isWriting) {
      setIsWriting(true);
      activeTimeIntervalRef.current = setInterval(() => {
        setActiveWritingTime(prev => prev + 1);
      }, 1000);
    }

    // Reset the keystroke timeout
    if (keystrokeTimeoutRef.current) {
      clearTimeout(keystrokeTimeoutRef.current);
    }

    // Stop counting active time after 3 seconds of no typing
    keystrokeTimeoutRef.current = setTimeout(() => {
      setIsWriting(false);
      if (activeTimeIntervalRef.current) {
        clearInterval(activeTimeIntervalRef.current);
        activeTimeIntervalRef.current = null;
      }
    }, 3000);
  };

  const handleFinishWriting = () => {
    setShowConfidenceCheck(true);
    // Stop all timers
    if (totalTimeIntervalRef.current) {
      clearInterval(totalTimeIntervalRef.current);
    }
    if (activeTimeIntervalRef.current) {
      clearInterval(activeTimeIntervalRef.current);
    }
  };

  const handleComplete = () => {
    const sessionData = {
      activeWritingTime,
      totalTime,
      wordCount: content.split(' ').filter(word => word.length > 0).length,
      confidenceAfter
    };
    onComplete(content, sessionData);
  };

  const handleRequestFeedback = () => {
    // Stop timers temporarily
    if (activeTimeIntervalRef.current) {
      clearInterval(activeTimeIntervalRef.current);
      activeTimeIntervalRef.current = null;
    }
    
    const sessionData = {
      activeWritingTime,
      totalTime,
      wordCount: content.split(' ').filter(word => word.length > 0).length
    };
    
    onRequestFeedback(content, sessionData);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sendWillyMessage = () => {
    if (!willyMessage.trim()) return;

    const userMessage = {
      type: 'user',
      content: willyMessage,
      timestamp: new Date()
    };

    const willyResponses = [
      "That's totally normal! Remember, your best-fit clients want to hear your authentic voice, not perfect copy.",
      "You're doing great! Trust the process - sometimes the best emails come from just letting yourself be real.",
      "I can feel you overthinking from here! What would you say if you were just talking to a friend?",
      "Here's the thing - the emails that feel most 'you' are the ones that connect best with your people.",
      "Take a breath. Your story and perspective matter more than getting every word perfect."
    ];

    const willyResponse = {
      type: 'willy',
      content: willyResponses[Math.floor(Math.random() * willyResponses.length)],
      timestamp: new Date()
    };

    setWillyConversation(prev => [...prev, userMessage, willyResponse]);
    setWillyMessage('');
  };

  const wordCount = content.split(' ').filter(word => word.length > 0).length;

  const getEmailTypeDisplayName = (type) => {
    const names = {
      cart_open: 'cart open announcement',
      belief_shifting: 'belief shifting email',
      social_proof: 'social proof email',
      cart_close: 'cart close email'
    };
    return names[type] || type;
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 relative">
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
              <p className="text-sm text-gray-500 mt-1">{wordCount} words</p>
              {isWriting && (
                <div className="flex items-center space-x-1 text-green-600 text-sm">
                  <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></div>
                  <span>In flow</span>
                </div>
              )}
            </div>
          </div>

          {/* Magic Prompt */}
          <div className="bg-purple-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-purple-900 mb-2">
              ✨ Your magic prompt: {magicPrompt.title}
            </h3>
            <p className="text-purple-700 text-sm leading-relaxed">
              {magicPrompt.content}
            </p>
          </div>

          {/* Writing Area */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your email:
              </label>
              <textarea
                value={content}
                onChange={handleContentChange}
                placeholder="Start writing... remember, this doesn't have to be perfect. Just be you."
                rows={16}
                className="w-full px-6 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none text-lg leading-relaxed"
              />
            </div>
            <div className="flex justify-between items-center pt-6">
              <div className="text-sm text-gray-500">
                <p>💡 Your best-fit clients want to hear from you, not a perfect copywriter</p>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowWillySidebar(true)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all flex items-center space-x-2"
                >
                  <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
                  <span>Chat with Willy</span>
                </button>
                
                {/* New Feedback Button */}
                <button
                  onClick={handleRequestFeedback}
                  disabled={!content || wordCount < 20}
                  className={`px-5 py-2 rounded-xl font-medium text-sm transition-all flex items-center space-x-2 ${
                    content && wordCount >= 20
                      ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white shadow-md hover:shadow-lg'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <SafeIcon icon={FiThumbsUp} className="w-4 h-4" />
                  <span>Get Willy's feedback</span>
                </button>
                
                <motion.button
                  onClick={handleFinishWriting}
                  disabled={!content || wordCount < 20}
                  whileHover={content && wordCount >= 20 ? { scale: 1.05 } : {}}
                  whileTap={content && wordCount >= 20 ? { scale: 0.95 } : {}}
                  className={`px-8 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${
                    content && wordCount >= 20
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <SafeIcon icon={FiCheck} className="w-5 h-5" />
                  <span>I'm done writing!</span>
                </motion.button>
              </div>
            </div>
          </div>

          {/* Willy Sidebar */}
          <AnimatePresence>
            {showWillySidebar && (
              <motion.div
                initial={{ opacity: 0, x: 300 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 300 }}
                className="fixed top-0 right-0 w-80 h-full bg-white shadow-2xl z-50 flex flex-col border-l border-gray-200"
              >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">W</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Willy</h3>
                      <p className="text-xs text-gray-500">Here to help</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowWillySidebar(false)}
                    className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <SafeIcon icon={FiX} className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {willyConversation.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                          msg.type === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={willyMessage}
                      onChange={(e) => setWillyMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendWillyMessage()}
                      placeholder="Ask Willy anything..."
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={sendWillyMessage}
                      className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors"
                    >
                      <SafeIcon icon={FiCheck} className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      ) : (
        /* Updated Confidence Check with Coconuts */
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
            You just wrote {wordCount} words and spent {formatTime(activeWritingTime)} in flow. Let's check your confidence coconuts after writing this {getEmailTypeDisplayName(emailType)}!
          </p>
          <div className="mb-12">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Confidence-ometer: How many coconuts you feeling now?
            </label>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Not many 🥥</span>
              <div className="flex-1">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={confidenceAfter}
                  onChange={(e) => setConfidenceAfter(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>
              <span className="text-sm text-gray-500">All the coconuts 🥥</span>
            </div>
            <div className="text-center mt-4">
              <span className="text-lg font-medium text-blue-600">
                {Array.from({ length: confidenceAfter }, (_, i) => '🥥').join('')} ({confidenceAfter}/10)
              </span>
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
          <style jsx>{`
            .slider::-webkit-slider-thumb {
              appearance: none;
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
            }
            .slider::-moz-range-thumb {
              height: 20px;
              width: 20px;
              border-radius: 50%;
              background: #3b82f6;
              cursor: pointer;
              border: none;
            }
          `}</style>
        </motion.div>
      )}
    </div>
  );
};

export default FlowTrackingEmailEditor;