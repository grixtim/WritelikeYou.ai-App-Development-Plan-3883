import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import OnboardingProgress from './OnboardingProgress';
import * as FiIcons from 'react-icons/fi';

const { FiStar, FiArrowRight, FiArrowLeft, FiPlus, FiX } = FiIcons;

const ResultsStep = ({ data, onUpdate }) => {
  const [mainResults, setMainResults] = useState(data.mainResults || []);
  const [newResult, setNewResult] = useState('');
  
  const currentStep = 5;
  const totalSteps = 7;

  const addResult = () => {
    if (newResult.trim()) {
      setMainResults(prev => [...prev, newResult.trim()]);
      setNewResult('');
    }
  };

  const removeResult = (index) => {
    setMainResults(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onUpdate({ mainResults });
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
          <SafeIcon icon={FiStar} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          What will they achieve?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          What are the main results, outcomes, or transformations your best-fit clients will experience through your offer?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Main results and outcomes (add 3-5 key ones)
          </label>
          
          <div className="space-y-2 mb-4">
            {mainResults.map((result, index) => (
              <div key={index} className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <span className="flex-1 text-sm text-green-700">{result}</span>
                <button
                  onClick={() => removeResult(index)}
                  className="text-green-500 hover:text-green-700"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex space-x-2">
            <input
              type="text"
              value={newResult}
              onChange={(e) => setNewResult(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addResult()}
              placeholder="e.g., Create boundaries that protect their energy, Feel present with their family without guilt..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addResult}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <Link
            to="/enhanced-onboarding/obstacles"
            className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Back</span>
          </Link>
          <Link
            to="/enhanced-onboarding/description"
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              mainResults.length >= 2
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Next: Describe your offer</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> Focus on the meaningful outcomes that matter most to your clients. 
          What will be different in their lives after working with you?
        </p>
      </div>
    </motion.div>
  );
};

export default ResultsStep;