import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const AnalyticsProvider = ({ children }) => {
  const { user, userProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [queuedEvents, setQueuedEvents] = useState([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);

  // Process queued events when user is authenticated
  useEffect(() => {
    if (user && queuedEvents.length > 0 && !isProcessingQueue) {
      processEventQueue();
    }
  }, [user, queuedEvents]);

  // Process the event queue
  const processEventQueue = async () => {
    if (isProcessingQueue || queuedEvents.length === 0 || !user) return;
    
    setIsProcessingQueue(true);
    
    try {
      const eventsToProcess = [...queuedEvents];
      setQueuedEvents([]);
      
      for (const event of eventsToProcess) {
        await trackEventToServer(event.eventName, event.properties);
      }
    } catch (error) {
      console.error('Error processing event queue:', error);
      // Put failed events back in the queue
      setQueuedEvents(prev => [...prev, ...queuedEvents]);
    } finally {
      setIsProcessingQueue(false);
    }
  };

  // Track event to server if authenticated, otherwise queue it
  const trackEvent = (eventName, properties = {}) => {
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    };
    
    setEvents(prev => [...prev, event]);
    
    // If user is authenticated, track to server, otherwise queue
    if (user) {
      trackEventToServer(eventName, properties).catch(error => {
        console.error('Error tracking event to server:', error);
        // Queue the event if server tracking fails
        setQueuedEvents(prev => [...prev, { eventName, properties }]);
      });
    } else {
      // Queue the event for later
      setQueuedEvents(prev => [...prev, { eventName, properties }]);
    }
  };

  // Track event to analytics API
  const trackEventToServer = async (eventName, properties = {}) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return;
      
      const response = await fetch(`${API_BASE_URL}/analytics/track`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          eventName,
          metadata: properties
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to track event');
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error tracking ${eventName} to server:`, error);
      throw error;
    }
  };

  // Get session ID
  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('writelikeyou_session');
    if (!sessionId) {
      sessionId = Date.now().toString();
      sessionStorage.setItem('writelikeyou_session', sessionId);
    }
    return sessionId;
  };

  // Key tracking methods for the app
  const trackMagicPromptMoment = (promptData) => {
    trackEvent('magic_prompt_delivered', {
      promptType: promptData.type,
      userConfidenceBefore: promptData.confidenceBefore,
      inspirationLevel: promptData.inspirationLevel,
      emailType: promptData.emailType
    });
  };

  const trackWritingStart = (sessionData) => {
    trackEvent('writing_started', {
      sessionType: sessionData.type,
      promptUsed: sessionData.promptUsed,
      confidenceBefore: sessionData.confidenceBefore,
      emailType: sessionData.emailType
    });
  };

  const trackWritingComplete = (sessionData) => {
    trackEvent('session_completed', {
      wordCount: sessionData.wordCount,
      timeSpent: sessionData.timeSpent,
      confidenceAfter: sessionData.confidenceAfter,
      activeWritingTime: sessionData.activeWritingTime,
      emailType: sessionData.emailType
    });
  };

  const trackDraftCompleted = (draftData) => {
    trackEvent('draft_completed', {
      wordCount: draftData.wordCount,
      timeSpent: draftData.timeSpent,
      emailType: draftData.emailType,
      confidenceLevel: draftData.confidenceLevel
    });
  };

  const trackEmailTypeSelected = (typeData) => {
    trackEvent('email_type_selected', {
      emailType: typeData.type,
      beliefToShift: typeData.beliefToShift,
      confidenceLevel: typeData.confidenceLevel
    });
  };

  const trackMiniLessonViewed = (lessonData) => {
    trackEvent('mini_lesson_viewed', {
      emailType: lessonData.emailType,
      lessonTitle: lessonData.title,
      timeSpent: lessonData.timeSpent
    });
  };

  const trackSetupCompleted = (setupData) => {
    trackEvent('setup_completed', {
      offerName: setupData.offerName,
      offerType: setupData.offerDescription,
      setupCompleteSource: setupData.setupSource || 'onboarding'
    });
  };

  const trackConfidenceBoost = (beforeAfter) => {
    trackEvent('confidence_boost', {
      before: beforeAfter.before,
      after: beforeAfter.after,
      improvement: beforeAfter.after - beforeAfter.before
    });
  };

  const trackSuccessMetric = (metric, value, context = {}) => {
    trackEvent('success_metric_reported', {
      metric,
      value,
      ...context
    });
  };

  const trackReturnUsage = (daysSinceLastSession) => {
    trackEvent('return_usage', {
      daysSinceLastSession,
      isWithinTwoWeeks: daysSinceLastSession <= 14
    });
  };

  // Get personal analytics
  const getPersonalAnalytics = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error('Not authenticated');
      
      const response = await fetch(`${API_BASE_URL}/analytics/personal`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching personal analytics:', error);
      throw error;
    }
  };

  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackMagicPromptMoment,
      trackWritingStart,
      trackWritingComplete,
      trackDraftCompleted,
      trackEmailTypeSelected,
      trackMiniLessonViewed,
      trackSetupCompleted,
      trackConfidenceBoost,
      trackSuccessMetric,
      trackReturnUsage,
      getPersonalAnalytics,
      events
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};