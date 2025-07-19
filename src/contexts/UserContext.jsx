import React, { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [userProgress, setUserProgress] = useState({
    emailsWritten: 0,
    confidenceScore: 0,
    streakDays: 0,
    lastWritingSession: null,
    totalWordsWritten: 0,
    achievements: [],
    successMetrics: {
      soundsLikeMeCount: 0,
      inspiredCount: 0,
      energizedCount: 0,
      confidenceBoosts: [],
      completionRate: 100
    }
  });

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('writelikeyou_user');
    const savedProgress = localStorage.getItem('writelikeyou_progress');
    
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsOnboarded(userData.onboardingComplete || false);
    }
    
    if (savedProgress) {
      setUserProgress(JSON.parse(savedProgress));
    }
  }, []);

  // Save user data to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('writelikeyou_user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('writelikeyou_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const completeOnboarding = (onboardingData) => {
    const userData = {
      ...onboardingData,
      onboardingComplete: true,
      createdAt: new Date().toISOString()
    };
    setUser(userData);
    setIsOnboarded(true);
  };

  const updateProgress = (progressData) => {
    setUserProgress(prev => ({ ...prev, ...progressData }));
  };

  const addAchievement = (achievement) => {
    setUserProgress(prev => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        {
          ...achievement,
          unlockedAt: new Date().toISOString()
        }
      ]
    }));
  };

  const trackSuccessMetric = (metric, value) => {
    setUserProgress(prev => ({
      ...prev,
      successMetrics: {
        ...prev.successMetrics,
        [`${metric}Count`]: (prev.successMetrics[`${metric}Count`] || 0) + (value ? 1 : 0)
      }
    }));
  };

  return (
    <UserContext.Provider value={{
      user,
      isOnboarded,
      userProgress,
      updateUser,
      completeOnboarding,
      updateProgress,
      addAchievement,
      trackSuccessMetric
    }}>
      {children}
    </UserContext.Provider>
  );
};