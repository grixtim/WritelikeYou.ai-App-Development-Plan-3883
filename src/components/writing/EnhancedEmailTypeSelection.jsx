import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiRefreshCw, FiUsers, FiClock, FiArrowRight } = FiIcons;

const EnhancedEmailTypeSelection = ({ onTypeSelected }) => {
  const [selectedType, setSelectedType] = useState('');
  const [beliefToShift, setBeliefToShift] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(5);

  const emailTypes = [
    {
      id: 'cart_open',
      title: 'Cart open announcement',
      description: 'Let people know your offer is now available',
      icon: FiMail,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'belief_shifting',
      title: 'Belief shifting email',
      description: 'Help shift a limiting belief or assumption',
      icon: FiRefreshCw,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'social_proof',
      title: 'Social proof email',
      description: 'Share stories and testimonials that build trust',
      icon: FiUsers,
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'cart_close',
      title: 'Cart close email',
      description: 'Final reminder before doors close',
      icon: FiClock,
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleContinue = () => {
    const typeData = {
      type: selectedType,
      beliefToShift: selectedType === 'belief_shifting' ? beliefToShift : null,
      additionalContext,
      confidenceLevel
    };
    onTypeSelected(typeData);
  };

  const isValid = selectedType && 
    (selectedType !== 'belief_shifting' || beliefToShift.trim());

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiMail} className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          What type of email are you writing?
        </h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          This helps me give you the most relevant writing guidance and psychological insights.
        </p>
      </div>

      {/* Email Type Selection */}
      <div className="space-y-4 mb-8">
        {emailTypes.map((type) => (
          <motion.label
            key={type.id}
            whileHover={{ scale: 1.02 }}
            className={`block p-6 rounded-2xl border-2 cursor-pointer transition-all ${
              selectedType === type.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <input
              type="radio"
              name="emailType"
              value={type.id}
              checked={selectedType === type.id}
              onChange={(e) => setSelectedType(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-start space-x-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${type.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <SafeIcon icon={type.icon} className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {type.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {type.description}
                </p>
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedType === type.id
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-gray-300'
              }`}>
                {selectedType === type.id && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
              </div>
            </div>
          </motion.label>
        ))}
      </div>

      {/* Conditional Belief Shifting Input */}
      {selectedType === 'belief_shifting' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <div className="bg-orange-50 rounded-2xl p-6">
            <label className="block text-sm font-medium text-orange-900 mb-3">
              What belief or assumption do you want this email to help shift?
            </label>
            <textarea
              value={beliefToShift}
              onChange={(e) => setBeliefToShift(e.target.value)}
              placeholder="e.g., 'I don't have enough time to commit to this,' or 'This probably won't work for someone like me,' or 'I should wait until I'm more ready...'"
              rows={3}
              className="w-full px-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:border-orange-500 bg-white text-gray-900 placeholder-gray-500"
            />
            <p className="text-xs text-orange-700 mt-2">
              💡 Think about what your best-fit clients tell themselves that keeps them stuck
            </p>
          </div>
        </motion.div>
      )}

      {/* Additional Context */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Anything else you'd like me to know about your intentions for this email?
        </label>
        <input
          type="text"
          value={additionalContext}
          onChange={(e) => setAdditionalContext(e.target.value)}
          placeholder="Optional - any specific goals or context for this email..."
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Confidence-ometer with Coconuts */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Confidence-ometer: How many confidence coconuts you feeling about writing this email atm?
        </label>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">Not many 🥥</span>
          <div className="flex-1">
            <input
              type="range"
              min="1"
              max="10"
              value={confidenceLevel}
              onChange={(e) => setConfidenceLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
          <span className="text-sm text-gray-500">All the coconuts 🥥</span>
        </div>
        <div className="text-center mt-2">
          <span className="text-lg font-medium text-blue-600">
            {Array.from({ length: confidenceLevel }, (_, i) => '🥥').join('')} ({confidenceLevel}/10)
          </span>
        </div>
      </div>

      {/* Continue Button */}
      <div className="flex justify-center">
        <motion.button
          onClick={handleContinue}
          disabled={!isValid}
          whileHover={isValid ? { scale: 1.05 } : {}}
          whileTap={isValid ? { scale: 0.95 } : {}}
          className={`px-8 py-4 rounded-xl font-semibold text-lg transition-all flex items-center space-x-2 ${
            isValid
              ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>Let's learn about this email type</span>
          <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> Each email type has its own psychology and purpose. 
          Once you pick one, I'll share some insights that'll make your writing way more effective!
        </p>
      </div>

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
    </div>
  );
};

export default EnhancedEmailTypeSelection;