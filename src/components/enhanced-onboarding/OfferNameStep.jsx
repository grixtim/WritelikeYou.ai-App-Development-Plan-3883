import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import OnboardingProgress from './OnboardingProgress';
import * as FiIcons from 'react-icons/fi';

const { FiPackage, FiArrowRight } = FiIcons;

const OfferNameStep = ({ data, onUpdate }) => {
  const [offerName, setOfferName] = useState(data.offerName || '');
  
  const currentStep = 1;
  const totalSteps = 7;

  const handleContinue = () => {
    onUpdate({ offerName });
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
          <SafeIcon icon={FiPackage} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          What's the name of your offer?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          This could be your coaching program, course, or service. Don't worry about making it perfect - 
          we just need to know what we're talking about!
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Offer name
          </label>
          <input
            type="text"
            value={offerName}
            onChange={(e) => setOfferName(e.target.value)}
            placeholder="e.g., The Physician's Path to Sustainable Success, The Balanced Doctor Blueprint..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
          />
        </div>

        <div className="pt-6">
          <Link
            to="/enhanced-onboarding/client-identity"
            onClick={handleContinue}
            className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              offerName.trim()
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Let's talk about your people</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> Don't overthink this! I just need to know what to call your offer 
          so I can help you write emails that genuinely connect with your best-fit clients.
        </p>
      </div>
    </motion.div>
  );
};

export default OfferNameStep;