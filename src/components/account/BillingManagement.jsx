import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCreditCard, FiCalendar, FiRefreshCw, FiExternalLink, FiAlertCircle, FiCheck, FiLoader } = FiIcons;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BillingManagement = () => {
  const { userProfile } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchSubscriptionDetails();
  }, []);

  const fetchSubscriptionDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_BASE_URL}/subscriptions/details`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error fetching subscription details');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You\'ll still have access until the end of your billing period.')) {
      return;
    }
    
    try {
      setProcessing(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_BASE_URL}/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSubscription({
          ...subscription,
          cancelAtPeriodEnd: true,
          status: 'canceled',
        });
        alert('Your subscription has been canceled. You\'ll have access until the end of your current billing period.');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error canceling subscription');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error canceling subscription:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleManagePaymentMethod = async () => {
    try {
      setProcessing(true);
      setError(null);
      
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_BASE_URL}/subscriptions/billing-portal`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        // Open Stripe billing portal in new tab
        window.open(data.url, '_blank');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Error opening billing portal');
      }
    } catch (error) {
      setError('Network error. Please try again.');
      console.error('Error opening billing portal:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;
    
    switch (subscription.status) {
      case 'active':
        return <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Active</span>;
      case 'past_due':
        return <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">Past Due</span>;
      case 'canceled':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Canceled</span>;
      case 'unpaid':
        return <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">Unpaid</span>;
      default:
        return <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">{subscription.status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
        <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-500 mx-auto animate-spin" />
        <p className="text-gray-600 mt-4">Loading subscription details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
        <button
          onClick={fetchSubscriptionDetails}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all flex items-center space-x-2 mx-auto"
        >
          <SafeIcon icon={FiRefreshCw} className="w-4 h-4" />
          <span>Try Again</span>
        </button>
      </div>
    );
  }

  // If no subscription or beta access
  if (!subscription || !subscription.active || userProfile?.subscriptionStatus === 'beta_access') {
    const message = userProfile?.subscriptionStatus === 'beta_access' 
      ? `You have beta access until ${userProfile.betaExpiresAt ? new Date(userProfile.betaExpiresAt).toLocaleDateString() : 'unknown date'}`
      : 'You don\'t have an active subscription';
      
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Status</h2>
        
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-blue-900 mb-2">
            {userProfile?.subscriptionStatus === 'beta_access' ? 'Beta Access' : 'No Active Subscription'}
          </h3>
          <p className="text-blue-700">
            {message}
          </p>
        </div>
        
        {userProfile?.subscriptionStatus !== 'beta_access' && (
          <div className="mt-8 text-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Subscribe Now
            </motion.button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Subscription Details</h2>
        {getStatusBadge()}
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Plan Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium">
                {subscription.interval === 'month' ? 'Monthly' : 'Annual'} Plan
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Price</span>
              <span className="font-medium">
                ${subscription.amount}{' '}
                <span className="text-gray-500 text-sm">
                  / {subscription.interval}
                </span>
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Renewal Date</span>
              <span className="font-medium">
                {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <span className="font-medium">
                {subscription.cancelAtPeriodEnd 
                  ? 'Cancels on renewal date' 
                  : subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-2xl p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Method</h3>
          {subscription.paymentMethod ? (
            <div className="space-y-3">
              <div className="flex items-center">
                <SafeIcon icon={FiCreditCard} className="w-5 h-5 text-gray-500 mr-2" />
                <span className="font-medium capitalize">
                  {subscription.paymentMethod.brand} •••• {subscription.paymentMethod.last4}
                </span>
              </div>
              <div className="flex items-center">
                <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-500 mr-2" />
                <span className="text-gray-600">
                  Expires {subscription.paymentMethod.expMonth}/{subscription.paymentMethod.expYear}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No payment method on file</p>
          )}
        </div>
      </div>
      
      {/* Warning for past due accounts */}
      {subscription.status === 'past_due' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-8">
          <div className="flex items-start space-x-3">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-800">Payment Issue Detected</h4>
              <p className="text-yellow-700 text-sm mt-1">
                Your last payment failed. Please update your payment method to avoid service interruption.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <motion.button
          onClick={handleManagePaymentMethod}
          disabled={processing}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
        >
          <SafeIcon icon={FiCreditCard} className="w-5 h-5" />
          <span>Manage Payment Method</span>
          <SafeIcon icon={FiExternalLink} className="w-4 h-4 ml-1" />
        </motion.button>
        
        {!subscription.cancelAtPeriodEnd && subscription.status !== 'canceled' && (
          <motion.button
            onClick={handleCancelSubscription}
            disabled={processing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center space-x-2"
          >
            {processing ? (
              <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
            ) : (
              <SafeIcon icon={FiCheck} className="w-5 h-5" />
            )}
            <span>Cancel Subscription</span>
          </motion.button>
        )}
      </div>
      
      {subscription.cancelAtPeriodEnd && (
        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Your subscription is set to cancel on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}.
            You'll continue to have access until then.
          </p>
        </div>
      )}
    </div>
  );
};

export default BillingManagement;