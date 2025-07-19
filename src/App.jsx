import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { QuestProvider } from '@questlabs/react-sdk';
import '@questlabs/react-sdk/dist/style.css';
import { UserProvider } from './contexts/UserContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import Dashboard from './pages/Dashboard';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import WritingSession from './pages/WritingSession';
import EnhancedWritingSession from './pages/EnhancedWritingSession';
import ProgressTracker from './pages/ProgressTracker';
import OnboardingFlow from './pages/OnboardingFlow';
import EnhancedOnboardingFlow from './pages/EnhancedOnboardingFlow';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AccountSettings from './pages/AccountSettings';
import BetaConversionPage from './pages/BetaConversionPage';
import MyEmailsDashboard from './pages/MyEmailsDashboard';
import EmailEditor from './pages/EmailEditor';
import FeedbackButton from './components/FeedbackButton';

const questConfig = {
  APIKEY: 'k-d6bf6134-c6dc-4456-b666-2784fcd3f63e',
  ENTITYID: 'e-63d4bee6-18f7-45dc-a63a-90256a1511d8'
};

function App() {
  return (
    <QuestProvider 
      apiKey={questConfig.APIKEY}
      entityId={questConfig.ENTITYID}
      apiType="PRODUCTION"
    >
      <AnalyticsProvider>
        <AuthProvider>
          <UserProvider>
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/signup" element={<SignupForm />} />
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/write" element={<ProtectedRoute><EnhancedWritingSession /></ProtectedRoute>} />
                  <Route path="/write/edit/:sessionId" element={<ProtectedRoute><EmailEditor /></ProtectedRoute>} />
                  <Route path="/progress" element={<ProtectedRoute><ProgressTracker /></ProtectedRoute>} />
                  <Route path="/emails" element={<ProtectedRoute><MyEmailsDashboard /></ProtectedRoute>} />
                  <Route path="/onboarding/*" element={<OnboardingFlow />} />
                  <Route path="/enhanced-onboarding/*" element={<EnhancedOnboardingFlow />} />
                  <Route path="/account/*" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />
                  <Route path="/beta-conversion" element={<BetaConversionPage />} />
                </Routes>
                <FeedbackButton />
              </Layout>
            </Router>
          </UserProvider>
        </AuthProvider>
      </AnalyticsProvider>
    </QuestProvider>
  );
}

export default App;