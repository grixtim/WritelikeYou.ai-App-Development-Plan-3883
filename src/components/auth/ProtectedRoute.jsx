import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../common/LoadingSpinner';
import SubscriptionExpired from './SubscriptionExpired';

const ProtectedRoute = ({ children, requiresSubscription = true }) => {
  const { user, userProfile, loading, checkSubscriptionAccess } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiresSubscription && !checkSubscriptionAccess()) {
    return <SubscriptionExpired />;
  }

  return children;
};

export default ProtectedRoute;