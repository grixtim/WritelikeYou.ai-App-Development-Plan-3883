import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import OnboardingProgress from './OnboardingProgress';
import * as FiIcons from 'react-icons/fi';

const { FiTarget, FiArrowRight, FiArrowLeft } = FiIcons;

const DesiredIdentityStep = ({ data, onUpdate }) => {
  const [clientDesiredIdentity, setClientDesiredIdentity] = useState(data.clientDesiredIdentity || '');
  
  const currentStep = 3;
  const totalSteps = 7;

  const handleContinue = () => {
    onUpdate({ clientDesiredIdentity });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiTarget} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Who do they want to become?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Think about their desired self-identity. What's the internal narrative they want to have about themselves?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Desired self-identity
          </label>
          <textarea
            value={clientDesiredIdentity}
            onChange={(e) => setClientDesiredIdentity(e.target.value)}
            placeholder="e.g., They want to see themselves as a physician who's mastered the art of sustainable success - someone who's both an exceptional doctor and present parent. They want to feel energized and proud of how they've created boundaries that protect their wellbeing while still delivering excellent patient care."
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Link
            to="/enhanced-onboarding/client-identity"
            className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <Link
            to="/enhanced-onboarding/obstacles"
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              clientDesiredIdentity.trim()
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Next: What's in their way</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> This isn't just about what they want to achieve - it's about who they want to BE. 
          What would they say about themselves when they've made this transformation?
        </p>
      </div>
    </motion.div>
  );
};

export default DesiredIdentityStep;