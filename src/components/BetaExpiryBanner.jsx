import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiAlertCircle, FiArrowRight } = FiIcons;

const BetaExpiryBanner = ({ betaExpiresAt, isExpired, inGracePeriod, gracePeriodDays }) => {
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Calculate days until expiry
  const calculateDaysUntilExpiry = () => {
    if (!betaExpiresAt) return 0;
    const now = new Date();
    const expiry = new Date(betaExpiresAt);
    const diffTime = expiry - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const daysUntilExpiry = calculateDaysUntilExpiry();
  
  // Determine banner type based on status
  let bannerType = 'info';
  if (isExpired) {
    bannerType = inGracePeriod ? 'warning' : 'error';
  } else if (daysUntilExpiry <= 14) {
    bannerType = 'warning';
  }
  
  // Define banner styles based on type
  const bannerStyles = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };
  
  // Define icon based on type
  const iconColor = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };
  
  // Generate banner message
  const getBannerMessage = () => {
    if (isExpired) {
      if (inGracePeriod) {
        return `Your beta access has expired. You're in a ${gracePeriodDays}-day grace period with limited access. Upgrade now to continue full access.`;
      } else {
        return `Your beta access has expired. Please upgrade to restore full access to WritelikeYou.ai.`;
      }
    } else if (daysUntilExpiry <= 14) {
      return `Your beta access will expire in ${daysUntilExpiry} days (on ${formatDate(betaExpiresAt)}). Secure your access now to continue your writing journey.`;
    } else {
      return `You have beta access until ${formatDate(betaExpiresAt)}.`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${bannerStyles[bannerType]} border rounded-xl p-4 mb-8 flex items-start space-x-3`}
    >
      <SafeIcon 
        icon={isExpired ? FiAlertCircle : FiClock} 
        className={`${iconColor[bannerType]} w-5 h-5 flex-shrink-0 mt-0.5`} 
      />
      <div className="flex-1">
        <p className="font-medium">
          Beta Access Status: {getBannerMessage()}
        </p>
      </div>
      <Link to="/beta-conversion">
        <button className="flex items-center space-x-1 font-medium text-sm px-3 py-1 rounded-lg bg-white shadow-sm hover:shadow transition-all">
          <span>Secure Your Access</span>
          <SafeIcon icon={FiArrowRight} className="w-4 h-4" />
        </button>
      </Link>
    </motion.div>
  );
};

export default BetaExpiryBanner;