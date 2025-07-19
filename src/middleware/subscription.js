/**
 * Subscription middleware for client-side route protection
 * This complements the server-side protection
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const useSubscriptionGuard = (requiredStatus = ['active', 'beta_access', 'trial']) => {
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait until authentication state is loaded
    if (loading) return;

    // If no user profile, redirect to login
    if (!userProfile) {
      navigate('/login', { replace: true });
      return;
    }

    // Check if user has required subscription status
    const hasAccess = requiredStatus.includes(userProfile.subscriptionStatus);
    
    // Handle beta access expiration
    if (userProfile.subscriptionStatus === 'beta_access') {
      const now = new Date();
      const expiryDate = new Date(userProfile.betaExpiresAt);
      
      if (now > expiryDate) {
        // Check for grace period (7 days after expiration)
        const gracePeriodEnd = new Date(expiryDate);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
        
        if (now < gracePeriodEnd) {
          // In grace period - allow limited access
          return;
        } else {
          // Grace period expired - redirect to subscription page
          navigate('/beta-conversion', { 
            replace: true,
            state: { 
              message: 'Your beta access has expired. Please subscribe to continue using WritelikeYou.ai.',
              from: window.location.pathname
            }
          });
          return;
        }
      }
    }

    // For non-beta subscriptions
    if (!hasAccess) {
      // Handle past due with grace period
      if (userProfile.subscriptionStatus === 'past_due') {
        // Allow access for 7 days after due date
        const currentPeriodEnd = new Date(userProfile.stripeCurrentPeriodEnd);
        const gracePeriodEnd = new Date(currentPeriodEnd);
        gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7);
        
        if (new Date() < gracePeriodEnd) {
          return; // Still in grace period
        }
      }

      // Redirect to appropriate page based on status
      switch (userProfile.subscriptionStatus) {
        case 'canceled':
          navigate('/account/billing', { 
            replace: true,
            state: { 
              message: 'Your subscription has been canceled. Please resubscribe to continue.',
              from: window.location.pathname
            }
          });
          break;
        case 'past_due':
          navigate('/account/billing', { 
            replace: true,
            state: { 
              message: 'Your payment is past due. Please update your payment method to continue.',
              from: window.location.pathname
            }
          });
          break;
        case 'unpaid':
          navigate('/account/billing', { 
            replace: true,
            state: { 
              message: 'Your subscription is inactive due to payment failure. Please update your payment method.',
              from: window.location.pathname
            }
          });
          break;
        default:
          navigate('/pricing', { 
            replace: true,
            state: { 
              message: 'A subscription is required to access this feature.',
              from: window.location.pathname
            }
          });
          break;
      }
    }
  }, [userProfile, loading, navigate, requiredStatus]);

  return { 
    hasAccess: userProfile && requiredStatus.includes(userProfile.subscriptionStatus),
    isLoading: loading
  };
};