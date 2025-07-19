import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import WelcomeStep from '../components/onboarding/WelcomeStep';
import OfferDetailsStep from '../components/onboarding/OfferDetailsStep';
import ClientPsychologyStep from '../components/onboarding/ClientPsychologyStep';
import PersonalityStep from '../components/onboarding/PersonalityStep';
import OnboardingComplete from '../components/onboarding/OnboardingComplete';

const OnboardingFlow = () => {
  const navigate = useNavigate();
  const { completeOnboarding } = useUser();
  const { trackEvent } = useAnalytics();
  const [onboardingData, setOnboardingData] = useState({
    name: '',
    businessType: '',
    offer: {
      title: '',
      description: '',
      priceRange: '',
      launchDate: ''
    },
    bestFitClient: {
      demographics: '',
      painPoints: [],
      desires: [],
      communicationStyle: ''
    },
    personality: {
      writingStyle: '',
      energyLevel: '',
      humor: '',
      vulnerability: ''
    }
  });

  const updateOnboardingData = (stepData) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const handleComplete = () => {
    completeOnboarding(onboardingData);
    trackEvent('onboarding_completed', { 
      businessType: onboardingData.businessType,
      offerType: onboardingData.offer.title 
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Routes>
          <Route 
            path="/" 
            element={
              <WelcomeStep 
                data={onboardingData} 
                onUpdate={updateOnboardingData} 
              />
            } 
          />
          <Route 
            path="/offer" 
            element={
              <OfferDetailsStep 
                data={onboardingData} 
                onUpdate={updateOnboardingData} 
              />
            } 
          />
          <Route 
            path="/clients" 
            element={
              <ClientPsychologyStep 
                data={onboardingData} 
                onUpdate={updateOnboardingData} 
              />
            } 
          />
          <Route 
            path="/personality" 
            element={
              <PersonalityStep 
                data={onboardingData} 
                onUpdate={updateOnboardingData} 
              />
            } 
          />
          <Route 
            path="/complete" 
            element={
              <OnboardingComplete 
                data={onboardingData} 
                onComplete={handleComplete} 
              />
            } 
          />
        </Routes>
      </div>
    </div>
  );
};

export default OnboardingFlow;