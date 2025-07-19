import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiAlertTriangle } = FiIcons;

const ConfirmCancellationModal = ({ onCancel, onConfirm, subscription }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4"
      >
        <div className="flex items-center space-x-3 mb-4 text-red-600">
          <SafeIcon icon={FiAlertTriangle} className="w-6 h-6" />
          <h3 className="text-xl font-bold">Cancel Subscription</h3>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Are you sure you want to cancel your subscription? You'll still have access until the end of your current billing period.
          </p>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-600 mb-2">
              <strong>Current period ends:</strong> {formatDate(subscription.currentPeriodEnd)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Plan:</strong> {subscription.interval === 'month' ? 'Monthly' : 'Annual'} (${subscription.amount}/{subscription.interval})
            </p>
          </div>
          
          <p className="text-sm text-red-600">
            You can reactivate your subscription at any time before {formatDate(subscription.currentPeriodEnd)}.
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
          >
            Keep Subscription
          </button>
          
          <button
            onClick={onConfirm}
            className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
          >
            Cancel Subscription
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmCancellationModal;