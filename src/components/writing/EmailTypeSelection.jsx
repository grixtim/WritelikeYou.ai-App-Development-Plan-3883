import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMail, FiAlertCircle, FiUsers, FiClock, FiArrowRight } = FiIcons;

const EmailTypeSelection = ({ onTypeSelected }) => {
  const [selectedType, setSelectedType] = useState('');
  const [objectionBelief, setObjectionBelief] = useState('');

  const emailTypes = [
    {
      id: 'cart_open',
      title: 'Cart open announcement',
      description: 'Let people know your offer is now available',
      icon: FiMail,
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'objection_addressing',
      title: 'Objection addressing email',
      description: 'Help shift a limiting belief or concern',
      icon: FiAlertCircle,
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
      objectionBelief: selectedType === 'objection_addressing' ? objectionBelief : null
    };
    onTypeSelected(typeData);
  };

  const isValid = selectedType && (selectedType !== 'objection_addressing' || objectionBelief.trim());

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

      {/* Conditional input for objection addressing */}
      {selectedType === 'objection_addressing' && (
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
              value={objectionBelief}
              onChange={(e) => setObjectionBelief(e.target.value)}
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
    </div>
  );
};

export default EmailTypeSelection;