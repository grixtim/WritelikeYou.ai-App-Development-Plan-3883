import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

export const useSubscriptionMiddleware = () => {
  const { userProfile, checkSubscriptionAccess, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading || !userProfile) return;

    const protectedPaths = ['/write', '/dashboard', '/progress'];
    const isProtectedPath = protectedPaths.some(path => 
      location.pathname.startsWith(path)
    );

    if (isProtectedPath && !checkSubscriptionAccess()) {
      // Redirect to subscription expired page or show modal
      console.log('Access denied - subscription expired');
    }
  }, [userProfile, location.pathname, loading, checkSubscriptionAccess, navigate]);

  return {
    hasAccess: checkSubscriptionAccess(),
    subscriptionStatus: userProfile?.subscription_status,
    isLoading: loading
  };
};