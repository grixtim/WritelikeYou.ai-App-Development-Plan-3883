import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiEdit3 } = FiIcons;

const OnboardingComplete = ({ data, onComplete }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 500 }}
        className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-8"
      >
        <SafeIcon icon={FiCheckCircle} className="w-10 h-10 text-white" />
      </motion.div>

      <h1 className="text-4xl font-bold text-gray-900 mb-6">
        Perfect! I've got everything I need
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        {data.name}, I'm so excited to help you write emails that sound like you. 
        Based on what you've shared, I already have some ideas brewing for your 
        {data.offer?.title ? ` ${data.offer.title}` : ' launch'}.
      </p>

      <div className="bg-blue-50 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Here's what I learned about you:
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm font-medium text-blue-700">Your business</p>
            <p className="text-blue-600">{data.businessType}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Your offer</p>
            <p className="text-blue-600">{data.offer?.title}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Your style</p>
            <p className="text-blue-600">{data.personality?.writingStyle}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Your energy</p>
            <p className="text-blue-600">{data.personality?.energyLevel}</p>
          </div>
        </div>
      </div>

      <motion.button
        onClick={onComplete}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-10 py-5 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-xl shadow-lg hover:shadow-xl transition-all flex items-center space-x-3 mx-auto"
      >
        <SafeIcon icon={FiEdit3} className="w-6 h-6" />
        <span>Let's write your first email!</span>
      </motion.button>

      <p className="text-gray-500 mt-6">
        Ready to discover how writing can feel natural and confident again?
      </p>
    </motion.div>
  );
};

export default OnboardingComplete;