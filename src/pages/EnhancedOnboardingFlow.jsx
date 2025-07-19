import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import OfferNameStep from '../components/enhanced-onboarding/OfferNameStep';
import ClientIdentityStep from '../components/enhanced-onboarding/ClientIdentityStep';
import DesiredIdentityStep from '../components/enhanced-onboarding/DesiredIdentityStep';
import ObstaclesStep from '../components/enhanced-onboarding/ObstaclesStep';
import ResultsStep from '../components/enhanced-onboarding/ResultsStep';
import OfferDescriptionStep from '../components/enhanced-onboarding/OfferDescriptionStep';
import AIOfferReflectionStep from '../components/enhanced-onboarding/AIOfferReflectionStep';
import OnboardingComplete from '../components/enhanced-onboarding/OnboardingComplete';

const EnhancedOnboardingFlow = () => {
  const navigate = useNavigate();
  const { completeOnboarding, updateUser } = useUser();
  const { trackEvent } = useAnalytics();
  
  const [offerData, setOfferData] = useState({
    offerName: '',
    clientCurrentIdentity: '',
    clientDesiredIdentity: '',
    commonObstacles: [],
    mainResults: [],
    offerDescription: ''
  });

  const updateOfferData = (stepData) => {
    setOfferData(prev => ({ ...prev, ...stepData }));
  };

  const handleComplete = () => {
    // Update the user context with the enhanced offer data
    updateUser({ enhancedOffer: offerData });
    
    trackEvent('enhanced_onboarding_completed', {
      offerType: offerData.offerName,
      offerDescription: offerData.offerDescription
    });
    
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Routes>
          <Route 
            path="/" 
            element={<OfferNameStep data={offerData} onUpdate={updateOfferData} />} 
          />
          <Route 
            path="/client-identity" 
            element={<ClientIdentityStep data={offerData} onUpdate={updateOfferData} />} 
          />
          <Route 
            path="/desired-identity" 
            element={<DesiredIdentityStep data={offerData} onUpdate={updateOfferData} />} 
          />
          <Route 
            path="/obstacles" 
            element={<ObstaclesStep data={offerData} onUpdate={updateOfferData} />} 
          />
          <Route 
            path="/results" 
            element={<ResultsStep data={offerData} onUpdate={updateOfferData} />} 
          />
          <Route 
            path="/description" 
            element={<OfferDescriptionStep data={offerData} onUpdate={updateOfferData} />} 
          />
          <Route 
            path="/reflection" 
            element={<AIOfferReflectionStep data={offerData} onUpdate={updateOfferData} />} 
          />
          <Route 
            path="/complete" 
            element={<OnboardingComplete data={offerData} onComplete={handleComplete} />} 
          />
        </Routes>
      </div>
    </div>
  );
};

export default EnhancedOnboardingFlow;