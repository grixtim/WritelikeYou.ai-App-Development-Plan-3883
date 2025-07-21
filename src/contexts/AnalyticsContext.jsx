import React, { createContext, useContext, useState } from 'react';

const AnalyticsContext = createContext();

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};

export const AnalyticsProvider = ({ children }) => {
  const [events, setEvents] = useState([]);

  const trackEvent = (eventName, properties = {}) => {
    const event = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString(),
      sessionId: getSessionId()
    };
    
    setEvents(prev => [...prev, event]);
    
    // In a real app, you'd send this to your analytics service
    console.log('Analytics Event:', event);
  };

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
    trackEvent('magic_prompt_generated', {
      promptType: promptData.type,
      userConfidenceBefore: promptData.confidenceBefore,
      inspirationLevel: promptData.inspirationLevel
    });
  };

  const trackWritingStart = (sessionData) => {
    trackEvent('writing_session_started', {
      sessionType: sessionData.type,
      promptUsed: sessionData.promptUsed,
      confidenceBefore: sessionData.confidenceBefore
    });
  };

  const trackWritingComplete = (sessionData) => {
    trackEvent('writing_session_completed', {
      wordCount: sessionData.wordCount,
      timeSpent: sessionData.timeSpent,
      confidenceAfter: sessionData.confidenceAfter,
      activeWritingTime: sessionData.activeWritingTime,
      emailType: sessionData.emailType
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

  return (
    <AnalyticsContext.Provider value={{
      trackEvent,
      trackMagicPromptMoment,
      trackWritingStart,
      trackWritingComplete,
      trackConfidenceBoost,
      trackSuccessMetric,
      trackReturnUsage,
      events
    }}>
      {children}
    </AnalyticsContext.Provider>
  );
};