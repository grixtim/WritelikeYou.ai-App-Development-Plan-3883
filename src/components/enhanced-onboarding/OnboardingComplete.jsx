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
        Beautiful! Your offer details are complete
      </h1>
      
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
        You've just done something really important - you've clarified what your {data.offerName} is 
        all about and who it's really for. This will make it so much easier to write emails that connect 
        with your best-fit clients.
      </p>

      <div className="bg-blue-50 rounded-2xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">
          Here's what we've defined:
        </h3>
        <div className="grid md:grid-cols-2 gap-4 text-left">
          <div>
            <p className="text-sm font-medium text-blue-700">Your offer</p>
            <p className="text-blue-600">{data.offerName}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Format</p>
            <p className="text-blue-600">{data.offerDescription}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Current identity</p>
            <p className="text-blue-600 line-clamp-2">{data.clientCurrentIdentity.split('.')[0]}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-blue-700">Desired identity</p>
            <p className="text-blue-600 line-clamp-2">{data.clientDesiredIdentity.split('.')[0]}</p>
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
        <span>Let's use this to write amazing emails!</span>
      </motion.button>

      <p className="text-gray-500 mt-6">
        We'll use these details to help you write emails that truly connect with your best-fit clients.
      </p>
    </motion.div>
  );
};

export default OnboardingComplete;