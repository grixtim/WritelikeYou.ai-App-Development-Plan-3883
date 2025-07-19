import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import OnboardingProgress from './OnboardingProgress';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiArrowRight, FiArrowLeft } = FiIcons;

const ClientIdentityStep = ({ data, onUpdate }) => {
  const [clientCurrentIdentity, setClientCurrentIdentity] = useState(data.clientCurrentIdentity || '');
  
  const currentStep = 2;
  const totalSteps = 7;

  const handleContinue = () => {
    onUpdate({ clientCurrentIdentity });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />

      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiUsers} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          How do your best-fit clients currently see themselves?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Think about their current self-identity. What's their internal narrative about who they are right now?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Current self-identity
          </label>
          <textarea
            value={clientCurrentIdentity}
            onChange={(e) => setClientCurrentIdentity(e.target.value)}
            placeholder="e.g., They see themselves as a brilliant physician who's burning out from trying to do it all. Despite their success, they feel overwhelmed and guilty about not being able to balance their career with self-care and family time."
            rows={5}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Link
            to="/enhanced-onboarding"
            className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <Link
            to="/enhanced-onboarding/desired-identity"
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              clientCurrentIdentity.trim()
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Next: Their desired identity</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> Focus on their internal story about themselves, not just external circumstances. 
          How do they complete the sentence "I am someone who..."?
        </p>
      </div>
    </motion.div>
  );
};

export default ClientIdentityStep;