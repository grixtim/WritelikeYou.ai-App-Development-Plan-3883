import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiLoader, FiShield, FiAlertCircle, FiX } = FiIcons;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Plan details
const plans = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 29,
    interval: 'month',
    features: [
      'Full access to all writing features',
      'Unlimited emails',
      'AI writing assistant',
      'Personal writing analytics',
      'Cancel anytime',
    ],
    priceId: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID
  },
  {
    id: 'annual',
    name: 'Annual',
    price: 290,
    interval: 'year',
    savings: 'Save $58',
    features: [
      'Everything in Monthly',
      'Priority support',
      'Early access to new features',
      'Best value',
    ],
    priceId: import.meta.env.VITE_STRIPE_ANNUAL_PRICE_ID,
    highlight: true
  }
];

const PlanSelection = ({ onClose, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { userProfile } = useAuth();
  
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to annual
  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Stripe has not initialized yet. Please try again.');
      setLoading(false);
      return;
    }

    // Get a reference to the card element
    const cardElement = elements.getElement(CardElement);

    // Create payment method
    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: {
        name,
        email
      }
    });

    if (stripeError) {
      setError(stripeError.message);
      setLoading(false);
      return;
    }

    try {
      // Get the token
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      // Create the subscription
      const response = await fetch(`${API_BASE_URL}/subscriptions/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan.priceId,
          paymentMethodId: paymentMethod.id,
          billingDetails: {
            name,
            email
          }
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Handle subscription confirmation
        if (data.status === 'active') {
          // Subscription is already active
          onSuccess();
          onClose();
        } else {
          // Need to confirm the payment
          const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
          
          if (confirmError) {
            setError(confirmError.message);
          } else {
            onSuccess();
            onClose();
          }
        }
      } else {
        setError(data.error || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 max-w-3xl w-full mx-4 my-8"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
          <button 
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            <SafeIcon icon={FiX} className="w-5 h-5" />
          </button>
        </div>

        {!showCheckout ? (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {plans.map((plan) => (
              <motion.div
                key={plan.id}
                whileHover={{ scale: 1.02 }}
                className={`border-2 rounded-2xl p-6 transition-all ${
                  plan.highlight
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                {plan.highlight && (
                  <div className="bg-blue-500 text-white text-xs uppercase font-bold tracking-wider py-1 px-2 rounded-full inline-block mb-4">
                    Best Value
                  </div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name} Plan</h3>
                <div className="flex items-baseline mb-4">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/{plan.interval}</span>
                </div>
                
                {plan.savings && (
                  <p className="text-green-600 font-medium text-sm mb-4">{plan.savings}</p>
                )}
                
                <ul className="mb-6 space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  onClick={() => handleSelectPlan(plan)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-full py-3 px-4 rounded-xl font-semibold transition-all ${
                    plan.highlight
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                      : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  Select Plan
                </motion.button>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">{selectedPlan.name} Plan</span>
                <span className="font-medium">${selectedPlan.price}/{selectedPlan.interval}</span>
              </div>
              {selectedPlan.savings && (
                <div className="text-green-600 text-sm text-right">{selectedPlan.savings}</div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
                  <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}
              
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name on card
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
                  disabled
                />
                <p className="text-xs text-gray-500 mt-1">
                  This is the email associated with your account
                </p>
              </div>
              
              <div>
                <label htmlFor="card" className="block text-sm font-medium text-gray-700 mb-2">
                  Card details
                </label>
                <div className="border border-gray-200 rounded-xl p-4 bg-white">
                  <CardElement
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#424770',
                          '::placeholder': {
                            color: '#aab7c4',
                          },
                        },
                        invalid: {
                          color: '#9e2146',
                        },
                      },
                    }}
                  />
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <SafeIcon icon={FiShield} className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Secure payment processing by Stripe</span>
                </div>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  disabled={loading}
                  className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
                >
                  Back to Plans
                </button>
                
                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {loading ? (
                    <>
                      <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Subscribe Now</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PlanSelection;