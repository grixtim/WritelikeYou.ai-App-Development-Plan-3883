import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import OnboardingProgress from './OnboardingProgress';
import * as FiIcons from 'react-icons/fi';

const { FiAlertTriangle, FiArrowRight, FiArrowLeft, FiPlus, FiX } = FiIcons;

const ObstaclesStep = ({ data, onUpdate }) => {
  const [commonObstacles, setCommonObstacles] = useState(data.commonObstacles || []);
  const [newObstacle, setNewObstacle] = useState('');
  const currentStep = 4;
  const totalSteps = 7;

  const addObstacle = () => {
    if (newObstacle.trim()) {
      setCommonObstacles(prev => [...prev, newObstacle.trim()]);
      setNewObstacle('');
    }
  };

  const removeObstacle = (index) => {
    setCommonObstacles(prev => prev.filter((_, i) => i !== index));
  };

  const handleContinue = () => {
    onUpdate({ commonObstacles });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiAlertTriangle} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          What's keeping them stuck?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          What are the common obstacles, beliefs, or patterns that prevent your best-fit clients from making this transformation?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Common obstacles (add 3-5 key ones)
          </label>
          <div className="space-y-2 mb-4">
            {commonObstacles.map((obstacle, index) => (
              <div key={index} className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <span className="flex-1 text-sm text-red-700">{obstacle}</span>
                <button
                  onClick={() => removeObstacle(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newObstacle}
              onChange={(e) => setNewObstacle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addObstacle()}
              placeholder="e.g., Perfectionism keeping them from setting boundaries, Fear of letting patients down..."
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={addObstacle}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <Link
            to="/enhanced-onboarding/desired-identity"
            className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Back</span>
          </Link>

          <Link
            to="/enhanced-onboarding/results"
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              commonObstacles.length >= 2
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Next: What they'll achieve</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>My tip:</strong> Think about the internal and external obstacles. What do they tell themselves? What patterns do they get stuck in?
        </p>
      </div>
    </motion.div>
  );
};

export default ObstaclesStep;