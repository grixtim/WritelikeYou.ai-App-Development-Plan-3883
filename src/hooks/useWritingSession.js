import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useWritingSession = () => {
  const { user } = useAuth();
  const [currentSession, setCurrentSession] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Auto-save functionality
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedContentRef = useRef('');
  const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

  const getAuthHeaders = () => {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // Create new writing session
  const createSession = async (emailType, setupData = {}, confidenceBefore = 5) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/writing-sessions/create`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ emailType, setupData, confidenceBefore })
      });

      const data = await response.json();

      if (response.ok) {
        // Fetch the full session data
        await getActiveSession();
        return { success: true, sessionId: data.session.sessionId };
      } else {
        setError(data.error || 'Failed to create session');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Create session error:', error);
      setError('Network error creating session');
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Get active session
  const getActiveSession = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/writing-sessions/active`, {
        headers: getAuthHeaders()
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSession(data.session);
        lastSavedContentRef.current = data.session.userDraftContent || '';
        return data.session;
      } else if (response.status === 404) {
        setCurrentSession(null);
        return null;
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to fetch active session');
        return null;
      }
    } catch (error) {
      console.error('Get active session error:', error);
      setError('Network error fetching session');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save draft content
  const autoSaveDraft = useCallback(async (content, flowTimeSeconds) => {
    if (!currentSession || !content || content === lastSavedContentRef.current) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/writing-sessions/${currentSession.sessionId}/auto-save`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ userDraftContent: content, flowTimeSeconds })
      });

      if (response.ok) {
        const data = await response.json();
        lastSavedContentRef.current = content;
        
        // Update current session with new save info
        setCurrentSession(prev => ({
          ...prev,
          userDraftContent: content,
          autoSaveCount: data.autoSaveCount,
          lastAutoSave: data.lastAutoSave,
          wordCount: data.wordCount,
          flowTimeSeconds
        }));
        
        return { success: true, data };
      } else {
        console.error('Auto-save failed:', await response.json());
        return { success: false };
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      return { success: false };
    }
  }, [currentSession]);

  // Setup auto-save for draft content
  const setupAutoSave = useCallback((content, flowTimeSeconds) => {
    // Clear existing timeout
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    // Set new timeout for auto-save
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveDraft(content, flowTimeSeconds);
    }, AUTO_SAVE_INTERVAL);
  }, [autoSaveDraft]);

  // Update session progress
  const updateProgress = async (updates) => {
    if (!currentSession) return { success: false, error: 'No active session' };

    try {
      const response = await fetch(`${API_BASE_URL}/writing-sessions/${currentSession.sessionId}/progress`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(updates)
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentSession(prev => ({
          ...prev,
          ...updates,
          updatedAt: data.session.updatedAt
        }));
        return { success: true, data };
      } else {
        setError(data.error || 'Failed to update progress');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Update progress error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Complete session
  const completeSession = async (finalContent, confidenceAfter, userFeedback = {}, totalTimeSpent) => {
    if (!currentSession) return { success: false, error: 'No active session' };

    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/writing-sessions/${currentSession.sessionId}/complete`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          userDraftContent: finalContent,
          confidenceAfter,
          userFeedback,
          totalTimeSpent
        })
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentSession(null); // Clear active session
        
        // Clear auto-save timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        return { success: true, data: { ...data.session, confidenceGain: data.session.confidenceGain } };
      } else {
        setError(data.error || 'Failed to complete session');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Complete session error:', error);
      return { success: false, error: 'Network error' };
    } finally {
      setIsLoading(false);
    }
  };

  // Abandon session
  const abandonSession = async () => {
    if (!currentSession) return { success: false, error: 'No active session' };

    try {
      const response = await fetch(`${API_BASE_URL}/writing-sessions/${currentSession.sessionId}/abandon`, {
        method: 'PUT',
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentSession(null);
        
        // Clear auto-save timeout
        if (autoSaveTimeoutRef.current) {
          clearTimeout(autoSaveTimeoutRef.current);
        }
        
        return { success: true };
      } else {
        setError(data.error || 'Failed to abandon session');
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Abandon session error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Get session history
  const getSessionHistory = async (limit = 20) => {
    try {
      const response = await fetch(`${API_BASE_URL}/writing-sessions/history/list?limit=${limit}`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, sessions: data.sessions };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get session history error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Get analytics
  const getAnalytics = async (dateRange = {}) => {
    try {
      const params = new URLSearchParams(dateRange);
      const response = await fetch(`${API_BASE_URL}/writing-sessions/analytics/summary?${params}`, {
        headers: getAuthHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, analytics: data };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Get analytics error:', error);
      return { success: false, error: 'Network error' };
    }
  };

  // Check for active session on mount
  useEffect(() => {
    if (user) {
      getActiveSession();
    }
  }, [user]);

  // Cleanup auto-save timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    currentSession,
    isLoading,
    error,
    createSession,
    getActiveSession,
    autoSaveDraft,
    setupAutoSave,
    updateProgress,
    completeSession,
    abandonSession,
    getSessionHistory,
    getAnalytics,
    clearError: () => setError(null)
  };
};