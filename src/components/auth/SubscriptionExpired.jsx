import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiCreditCard, FiMail } = FiIcons;

const SubscriptionExpired = () => {
  const { userProfile, getSubscriptionMessage } = useAuth();
  const subscriptionMessage = getSubscriptionMessage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiClock} className="w-8 h-8 text-orange-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {userProfile?.subscription_status === 'beta_free' ? 'Beta Access Expired' : 'Subscription Required'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {subscriptionMessage?.message || 'Your access has expired. Please upgrade to continue using Writelikeyou.ai'}
          </p>

          {userProfile?.subscription_status === 'beta_free' && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>Thanks for being part of our beta!</strong><br />
                Your beta access was valid until December 9, 2025.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <SafeIcon icon={FiCreditCard} className="w-5 h-5" />
              <span>Upgrade Now</span>
            </motion.button>

            <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all">
              <SafeIcon icon={FiMail} className="w-5 h-5" />
              <span>Contact Support</span>
            </button>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              <strong>Cohort:</strong> {userProfile?.cohort_week} ({userProfile?.cohort_month})
            </p>
            <p>
              <strong>Member since:</strong> {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionExpired;