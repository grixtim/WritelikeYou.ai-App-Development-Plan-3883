import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import OnboardingProgress from './OnboardingProgress';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiArrowRight, FiArrowLeft } = FiIcons;

const OfferDescriptionStep = ({ data, onUpdate }) => {
  const [offerDescription, setOfferDescription] = useState(data.offerDescription || '');
  const currentStep = 6;
  const totalSteps = 7;

  const offerFormats = [
    '1:1 Coaching Program',
    'Group Coaching Program',
    'Self-Paced Course',
    'Membership Community',
    'Workshop Series',
    'VIP Day',
    'Done-for-You Service',
    'Live Event'
  ];

  const handleFormatSelect = (format) => {
    setOfferDescription(format);
  };

  const handleContinue = () => {
    onUpdate({ offerDescription });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiSettings} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          How would you describe your offer?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Pick a format that best describes your offer, or write your own description.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Choose a format (or skip to write your own)
          </label>
          <div className="grid grid-cols-2 gap-3">
            {offerFormats.map((format) => (
              <button
                key={format}
                onClick={() => handleFormatSelect(format)}
                className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                  offerDescription === format
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Or write your own description
          </label>
          <input
            type="text"
            value={offerDescription}
            onChange={(e) => setOfferDescription(e.target.value)}
            placeholder="e.g., 12-week group coaching program with weekly calls and Voxer support..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Link
            to="/enhanced-onboarding/results"
            className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Back</span>
          </Link>

          <Link
            to="/enhanced-onboarding/reflection"
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              offerDescription.trim()
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Let me reflect on this</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>My tip:</strong> Don't worry about getting this exactly right. I just need to understand the basic format so I can give you relevant writing guidance.
        </p>
      </div>
    </motion.div>
  );
};

export default OfferDescriptionStep;