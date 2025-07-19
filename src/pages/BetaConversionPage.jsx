import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiShield, FiCheck, FiLoader, FiAlertCircle, FiArrowRight, FiCreditCard } = FiIcons;

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

// Beta Checkout Form component
const BetaCheckoutForm = ({ selectedPlan, onSubscriptionComplete, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { userProfile } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [name, setName] = useState(userProfile?.name || '');
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
      
      <div className="bg-blue-50 rounded-xl p-6 mb-4">
        <div className="flex items-center space-x-3 mb-2">
          <SafeIcon icon={FiCheck} className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Continue Your WriteLikeYou Journey</h3>
        </div>
        <p className="text-blue-700 text-sm ml-8">
          Your beta access will be seamlessly upgraded to a paid subscription. All your existing emails and data will remain intact.
        </p>
      </div>
      
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
          This is the email associated with your beta account
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
              <span>Secure Your Access • ${selectedPlan.price}/{selectedPlan.interval}</span>
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

const BetaConversionPage = () => {
  const { userProfile } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState(plans[1]); // Default to annual
  const [showCheckout, setShowCheckout] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
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
      window.location.href = '/dashboard';
    }, 3000);
  };
  
  const handleCheckoutError = (error) => {
    setCheckoutError(error);
  };

  // Redirect if not a beta user
  if (userProfile && userProfile.subscriptionStatus !== 'beta_access') {
    return (
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          This page is for beta users only
        </h2>
        <p className="text-gray-600 mb-6">
          It looks like you're already a subscriber or not currently on a beta plan.
        </p>
        <Link to="/dashboard">
          <button className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all">
            Go to Dashboard
          </button>
        </Link>
      </div>
    );
  }

  if (subscribed) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <SafeIcon icon={FiCheck} className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You for Your Subscription!</h2>
          <p className="text-xl text-gray-600 mb-6">
            Your beta access has been successfully upgraded to a paid subscription.
          </p>
          <div className="bg-blue-50 rounded-2xl p-6 mb-8 max-w-md mx-auto">
            <h3 className="font-semibold text-blue-900 mb-3">What happens next:</h3>
            <ul className="text-left text-blue-700 space-y-2">
              <li className="flex items-start">
                <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>Your access is now secured beyond the beta period</span>
              </li>
              <li className="flex items-start">
                <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>All your existing emails and data remain intact</span>
              </li>
              <li className="flex items-start">
                <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                <span>A confirmation email with billing details has been sent to you</span>
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            You'll be redirected to your dashboard in a moment...
          </p>
          <Link to="/dashboard">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 mx-auto"
            >
              <span>Go to Dashboard</span>
              <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Secure Your WriteLikeYou.ai Access
          </h1>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Your beta journey has been amazing. Continue writing authentic emails that connect with your audience.
          </p>
        </div>
        
        {/* Beta Status Banner */}
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <SafeIcon icon={FiClock} className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Beta Access Status</h3>
              <p className="text-blue-700 mb-2">
                You currently have beta access until <span className="font-semibold">{formatDate(userProfile?.betaExpiresAt)}</span>
              </p>
              <p className="text-sm text-blue-600">
                After this date, you'll enter a 7-day grace period with limited access to your existing emails before your account is restricted.
              </p>
            </div>
          </div>
        </div>
        
        {!showCheckout ? (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Choose Your Plan</h2>
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
                    className={`w-full py-3 px-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                      plan.highlight
                        ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                        : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <span>Secure Your Access</span>
                    <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3 text-center">Why Upgrade Now?</h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <SafeIcon icon={FiCheck} className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-800 mb-1">Seamless Transition</h4>
                  <p className="text-sm text-gray-600">Keep all your existing emails and data</p>
                </div>
                <div className="text-center">
                  <SafeIcon icon={FiShield} className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-800 mb-1">Uninterrupted Access</h4>
                  <p className="text-sm text-gray-600">Continue your writing journey without disruption</p>
                </div>
                <div className="text-center">
                  <SafeIcon icon={FiClock} className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                  <h4 className="font-medium text-gray-800 mb-1">Early Adopter Benefits</h4>
                  <p className="text-sm text-gray-600">Lock in current pricing as an early supporter</p>
                </div>
              </div>
            </div>
          </>
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
              <BetaCheckoutForm 
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
      </div>
    </div>
  );
};

export default BetaConversionPage;