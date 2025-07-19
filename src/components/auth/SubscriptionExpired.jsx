import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiCreditCard, FiMail } = FiIcons;

const SubscriptionExpired = () => {
  const { userProfile, getSubscriptionMessage } = useAuth();
  const subscriptionMessage = getSubscriptionMessage();

  // Calculate days in grace period if beta has expired
  const calculateGracePeriodDays = () => {
    if (!userProfile?.betaExpiresAt) return 0;
    
    const betaEndDate = new Date(userProfile.betaExpiresAt);
    const now = new Date();
    const gracePeriodEnd = new Date(betaEndDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7-day grace period
    
    // If within grace period
    if (now > betaEndDate && now < gracePeriodEnd) {
      const daysLeft = Math.ceil((gracePeriodEnd - now) / (1000 * 60 * 60 * 24));
      return daysLeft;
    }
    
    return 0;
  };
  
  const gracePeriodDays = calculateGracePeriodDays();
  const isInGracePeriod = gracePeriodDays > 0;

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
            {userProfile?.subscriptionStatus === 'beta_access' ? 
              (isInGracePeriod ? 'Beta Access Grace Period' : 'Beta Access Expired') :
              'Subscription Required'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {subscriptionMessage?.message || 'Your access has expired. Please upgrade to continue using Writelikeyou.ai'}
          </p>
          
          {userProfile?.subscriptionStatus === 'beta_access' && (
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              {isInGracePeriod ? (
                <div>
                  <p className="text-sm text-blue-800 font-semibold mb-2">
                    Grace Period: {gracePeriodDays} days remaining
                  </p>
                  <p className="text-xs text-blue-700">
                    During this period, you can view your existing emails but cannot create new ones.
                    Upgrade now to continue your full access.
                  </p>
                </div>
              ) : (
                <p className="text-sm text-blue-800">
                  <strong>Thanks for being part of our beta!</strong><br />
                  Your beta access was valid until {new Date(userProfile.betaExpiresAt).toLocaleDateString()}.
                </p>
              )}
            </div>
          )}
          
          <div className="space-y-4">
            <Link to="/beta-conversion">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
              >
                <SafeIcon icon={FiCreditCard} className="w-5 h-5" />
                <span>Upgrade Now</span>
              </motion.button>
            </Link>
            
            <a href="mailto:support@writelikeyou.ai" className="block">
              <button className="w-full flex items-center justify-center space-x-2 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all">
                <SafeIcon icon={FiMail} className="w-5 h-5" />
                <span>Contact Support</span>
              </button>
            </a>
          </div>
          
          <div className="mt-6 text-sm text-gray-500">
            <p>
              <strong>Cohort:</strong> {userProfile?.cohortWeek} ({userProfile?.cohortMonth})
            </p>
            <p>
              <strong>Member since:</strong> {userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SubscriptionExpired;