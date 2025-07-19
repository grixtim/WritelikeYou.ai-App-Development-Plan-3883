import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);

  useEffect(() => {
    // Check for existing token on app load
    const token = localStorage.getItem('authToken');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setUserProfile(data.user);
        setSubscriptionStatus(data.user.subscriptionStatus);
      } else {
        // Token is invalid, remove it
        localStorage.removeItem('authToken');
        setUser(null);
        setUserProfile(null);
        setSubscriptionStatus(null);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      localStorage.removeItem('authToken');
      setUser(null);
      setUserProfile(null);
      setSubscriptionStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, additionalData = {}) => {
    try {
      setLoading(true);

      const payload = {
        email,
        password,
        registrationSource: additionalData.registration_source || 'direct'
      };
      
      // Add beta code if provided
      if (additionalData.betaCode) {
        payload.betaCode = additionalData.betaCode;
      }
      
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setUserProfile(data.user);
        setSubscriptionStatus(data.user.subscriptionStatus);
        return { data: { user: data.user }, error: null };
      } else {
        return {
          data: null,
          error: { message: data.error || data.errors?.[0]?.msg || 'Signup failed' },
        };
      }
    } catch (error) {
      console.error('Signup error:', error);
      return { data: null, error: { message: 'Network error. Please try again.' } };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/auth/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        setUser(data.user);
        setUserProfile(data.user);
        setSubscriptionStatus(data.user.subscriptionStatus);
        return { data: { user: data.user }, error: null };
      } else {
        return {
          data: null,
          error: { message: data.error || data.errors?.[0]?.msg || 'Login failed' },
        };
      }
    } catch (error) {
      console.error('Signin error:', error);
      return { data: null, error: { message: 'Network error. Please try again.' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      localStorage.removeItem('authToken');
      setUser(null);
      setUserProfile(null);
      setSubscriptionStatus(null);
    } catch (error) {
      console.error('Error in signOut:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (updates) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('No authentication token');

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setUserProfile(data.user);
        setSubscriptionStatus(data.user.subscriptionStatus);
        return { data: data.user, error: null };
      } else {
        return {
          data: null,
          error: { message: data.error || data.errors?.[0]?.msg || 'Update failed' },
        };
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      return { data: null, error: { message: 'Network error. Please try again.' } };
    }
  };

  const verifyBetaCode = async (betaCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-beta-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ betaCode }),
      });

      const data = await response.json();
      
      if (response.ok && data.valid) {
        return { 
          isValid: true, 
          expiresAt: data.expiresAt 
        };
      } else {
        return { 
          isValid: false, 
          error: data.error || 'Invalid beta code'
        };
      }
    } catch (error) {
      console.error('Error verifying beta code:', error);
      return { 
        isValid: false, 
        error: 'Network error. Please try again.' 
      };
    }
  };

  const checkSubscriptionAccess = () => {
    if (!userProfile) return false;

    const now = new Date();
    
    switch (userProfile.subscriptionStatus) {
      case 'beta_access':
        return userProfile.betaExpiresAt ? now <= new Date(userProfile.betaExpiresAt) : false;
      case 'trial':
      case 'active':
        return true;
      case 'past_due':
        // Give grace period for past_due status
        return userProfile.stripeCurrentPeriodEnd ? 
          now <= new Date(new Date(userProfile.stripeCurrentPeriodEnd).getTime() + 7 * 24 * 60 * 60 * 1000) : 
          false;
      case 'canceled':
        // Check if still within paid period
        return userProfile.stripeCurrentPeriodEnd ? 
          now <= new Date(userProfile.stripeCurrentPeriodEnd) : 
          false;
      case 'unpaid':
      case 'none':
      default:
        return false;
    }
  };

  const getSubscriptionMessage = () => {
    if (!userProfile) return null;

    const now = new Date();
    
    switch (userProfile.subscriptionStatus) {
      case 'beta_access': 
        if (!userProfile.betaExpiresAt) return { type: 'warning', message: 'Beta access status without expiration date' };
        
        const daysUntilExpiry = Math.ceil((new Date(userProfile.betaExpiresAt) - now) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry > 30) {
          return { type: 'info', message: `Beta access valid until ${new Date(userProfile.betaExpiresAt).toLocaleDateString()}` };
        } else if (daysUntilExpiry > 0) {
          return { type: 'warning', message: `Beta access expires in ${daysUntilExpiry} days` };
        } else {
          return { type: 'error', message: 'Beta access has expired' };
        }
      
      case 'trial': 
        return { type: 'info', message: 'You are on a trial subscription' };
      
      case 'active':
        // Calculate days until renewal
        if (userProfile.stripeCurrentPeriodEnd) {
          const daysUntilRenewal = Math.ceil((new Date(userProfile.stripeCurrentPeriodEnd) - now) / (1000 * 60 * 60 * 24));
          return { 
            type: 'success', 
            message: `Active subscription, renews in ${daysUntilRenewal} days`
          };
        }
        return { type: 'success', message: 'Active subscription' };
      
      case 'past_due':
        return { type: 'warning', message: 'Payment past due. Please update your payment method.' };
      
      case 'canceled':
        if (userProfile.stripeCurrentPeriodEnd && now <= new Date(userProfile.stripeCurrentPeriodEnd)) {
          const daysRemaining = Math.ceil((new Date(userProfile.stripeCurrentPeriodEnd) - now) / (1000 * 60 * 60 * 24));
          return { 
            type: 'warning', 
            message: `Your subscription has been canceled but you have access until ${new Date(userProfile.stripeCurrentPeriodEnd).toLocaleDateString()} (${daysRemaining} days remaining)` 
          };
        }
        return { type: 'error', message: 'Your subscription has been canceled' };
      
      case 'unpaid':
        return { type: 'error', message: 'Your subscription is inactive due to payment failure' };
      
      case 'none':
      default:
        return { type: 'error', message: 'No active subscription' };
    }
  };

  const value = {
    user,
    userProfile,
    loading,
    subscriptionStatus,
    signUp,
    signIn,
    signOut,
    updateUserProfile,
    verifyBetaCode,
    checkSubscriptionAccess,
    getSubscriptionMessage
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};