import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHeart, FiArrowRight } = FiIcons;

const WelcomeStep = ({ data, onUpdate }) => {
  const [name, setName] = useState(data.name || '');
  const [businessType, setBusinessType] = useState(data.businessType || '');

  const handleContinue = () => {
    onUpdate({ name, businessType });
  };

  const businessTypes = [
    'Course Creator',
    'Coach',
    'Consultant',
    'Service Provider',
    'Digital Product Creator',
    'Freelancer',
    'Agency Owner',
    'Other'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiHeart} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Hey there! I'm Willy 👋
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          I'm so excited to help you write emails that feel authentically you. 
          Let's start by getting to know each other a bit.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What should I call you?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your first name"
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What kind of business do you run?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {businessTypes.map((type) => (
              <button
                key={type}
                onClick={() => setBusinessType(type)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  businessType === type
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6">
          <Link 
            to="/onboarding/offer"
            onClick={handleContinue}
            className={`w-full flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              name && businessType
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Let's talk about your offer</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> There are no wrong answers here. 
          I'm just getting to know you so I can help you write in your authentic voice.
        </p>
      </div>
    </motion.div>
  );
};

export default WelcomeStep;