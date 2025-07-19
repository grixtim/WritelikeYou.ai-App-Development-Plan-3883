import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheck, FiLoader, FiShield, FiCreditCard, FiAlertCircle } = FiIcons;

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

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

// CheckoutForm component
const CheckoutForm = ({ selectedPlan, onSubscriptionComplete, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { userProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState(userProfile?.email || '');

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
          onSubscriptionComplete();
        } else {
          // Need to confirm the payment
          const { error: confirmError } = await stripe.confirmCardPayment(data.clientSecret);
          
          if (confirmError) {
            setError(confirmError.message);
          } else {
            onSubscriptionComplete();
          }
        }
      } else {
        setError(data.error || 'Failed to create subscription');
        if (onError) onError(data.error);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      setError('Network error. Please try again.');
      if (onError) onError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
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
        />
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
      
      <div className="pt-4">
        <button
          type="submit"
          disabled={!stripe || loading}
          className="w-full py-3 px-4 rounded-xl font-semibold text-lg transition-all bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <SafeIcon icon={FiCreditCard} className="w-5 h-5" />
              <span>Subscribe for ${selectedPlan.price}/{selectedPlan.interval}</span>
            </>
          )}
        </button>
      </div>
      
      <p className="text-center text-sm text-gray-500">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel anytime from your account settings.
      </p>
    </form>
  );
};

const SubscriptionPlans = () => {
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to annual
  const [showCheckout, setShowCheckout] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  
  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowCheckout(true);
    setCheckoutError(null);
  };
  
  const handleSubscriptionComplete = () => {
    setSubscribed(true);
    setShowCheckout(false);
    
    // Refresh the page after a delay to show updated subscription status
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  };
  
  const handleCheckoutError = (error) => {
    setCheckoutError(error);
  };

  if (subscribed) {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Successful!</h2>
        <p className="text-gray-600 mb-4">
          Thank you for subscribing to Writelikeyou.ai. Your account has been updated.
        </p>
        <p className="text-sm text-gray-500">
          Refreshing your page...
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Plan</h2>
      
      {!showCheckout ? (
        <div className="grid md:grid-cols-2 gap-8 mb-8">
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
        <div className="max-w-lg mx-auto">
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">{selectedPlan.name} Plan</span>
              <span className="font-medium">${selectedPlan.price}/{selectedPlan.interval}</span>
            </div>
            {selectedPlan.savings && (
              <div className="text-green-600 text-sm text-right">{selectedPlan.savings}</div>
            )}
          </div>
          
          <Elements stripe={stripePromise}>
            <CheckoutForm 
              selectedPlan={selectedPlan} 
              onSubscriptionComplete={handleSubscriptionComplete}
              onError={handleCheckoutError}
            />
          </Elements>
          
          {!checkoutError && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setShowCheckout(false)}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Go back to plan selection
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Need help?</strong> Feel free to reach out to our support team with any questions about our plans.
        </p>
      </div>
    </div>
  );
};

export default SubscriptionPlans;