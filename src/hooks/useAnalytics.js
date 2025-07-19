import { useEffect, useCallback } from 'react';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for automatic tracking of critical user events
 */
export const useAnalyticsTracking = () => {
  const { 
    trackEvent, 
    trackEmailTypeSelected, 
    trackMiniLessonViewed, 
    trackWritingStart, 
    trackWritingComplete 
  } = useAnalytics();
  const { user, userProfile } = useAuth();

  // Track page views
  useEffect(() => {
    if (!user) return;
    
    // Track page view
    const trackPageView = () => {
      const path = window.location.pathname;
      trackEvent('page_viewed', {
        path,
        title: document.title,
        referrer: document.referrer,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      });
    };
    
    // Initial page view
    trackPageView();
    
    // Track navigation with History API
    const handleHistoryChange = () => {
      trackPageView();
    };
    
    window.addEventListener('popstate', handleHistoryChange);
    
    // Monkey-patch pushState and replaceState
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function() {
      originalPushState.apply(this, arguments);
      handleHistoryChange();
    };
    
    history.replaceState = function() {
      originalReplaceState.apply(this, arguments);
      handleHistoryChange();
    };
    
    return () => {
      window.removeEventListener('popstate', handleHistoryChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, [user, trackEvent]);

  // Track session timing
  useEffect(() => {
    if (!user) return;
    
    let sessionStart = Date.now();
    let lastActivity = Date.now();
    let isActive = true;
    
    // Track session start
    trackEvent('session_started', {
      referrer: document.referrer,
      userAgent: navigator.userAgent,
      screenSize: `${window.innerWidth}x${window.innerHeight}`
    });
    
    // Functions to track user activity
    const updateActivity = () => {
      const now = Date.now();
      if (!isActive) {
        // User returned after inactivity
        trackEvent('session_resumed', {
          inactiveDuration: Math.round((now - lastActivity) / 1000)
        });
        isActive = true;
      }
      lastActivity = now;
    };
    
    // User becoming inactive (5 minutes without activity)
    const checkInactivity = () => {
      const now = Date.now();
      if (isActive && now - lastActivity > 5 * 60 * 1000) {
        trackEvent('session_inactive', {
          sessionDuration: Math.round((now - sessionStart) / 1000)
        });
        isActive = false;
      }
    };
    
    // Activity events
    const activityEvents = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    activityEvents.forEach(event => {
      window.addEventListener(event, updateActivity, { passive: true });
    });
    
    // Check for inactivity every minute
    const inactivityInterval = setInterval(checkInactivity, 60 * 1000);
    
    // Track session end on page unload
    const handleUnload = () => {
      const sessionDuration = Math.round((Date.now() - sessionStart) / 1000);
      
      // Use sendBeacon for more reliable tracking on page unload
      const data = JSON.stringify({
        eventName: 'session_ended',
        metadata: {
          sessionDuration,
          path: window.location.pathname
        }
      });
      
      // Try to use beacon API, fall back to sync XHR
      if (navigator.sendBeacon) {
        const token = localStorage.getItem('authToken');
        const headers = { 'Authorization': `Bearer ${token}` };
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/analytics/track`, blob);
      } else {
        // Synchronous fallback
        trackEvent('session_ended', {
          sessionDuration,
          path: window.location.pathname
        });
      }
    };
    
    window.addEventListener('beforeunload', handleUnload);
    
    return () => {
      activityEvents.forEach(event => {
        window.removeEventListener(event, updateActivity);
      });
      clearInterval(inactivityInterval);
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [user, trackEvent]);

  // Track errors
  useEffect(() => {
    if (!user) return;
    
    const handleError = (event) => {
      trackEvent('error_occurred', {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack?.substring(0, 500) // Limit stack trace length
      });
    };
    
    window.addEventListener('error', handleError);
    
    return () => {
      window.removeEventListener('error', handleError);
    };
  }, [user, trackEvent]);

  // Automatic email flow tracking helper
  const trackEmailFlow = useCallback((step, data) => {
    switch (step) {
      case 'type_selected':
        trackEmailTypeSelected(data);
        break;
      case 'mini_lesson':
        trackMiniLessonViewed(data);
        break;
      case 'writing_start':
        trackWritingStart(data);
        break;
      case 'completed':
        trackWritingComplete(data);
        break;
      default:
        trackEvent(`email_flow_${step}`, data);
    }
  }, [trackEmailTypeSelected, trackMiniLessonViewed, trackWritingStart, trackWritingComplete, trackEvent]);

  return { trackEmailFlow };
};

export default useAnalyticsTracking;