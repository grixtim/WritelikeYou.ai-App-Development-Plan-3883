import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import { AnalyticsProvider } from './contexts/AnalyticsContext';
import { AuthProvider } from './contexts/AuthContext';
import HomePage from './pages/HomePage';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';
import OnboardingFlow from './pages/OnboardingFlow';
import EnhancedOnboardingFlow from './pages/EnhancedOnboardingFlow';
import Dashboard from './pages/Dashboard';
import EnhancedWritingSession from './pages/EnhancedWritingSession';
import ProgressTracker from './pages/ProgressTracker';
import Layout from './components/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import './App.css';

function App() {
  return (
    <AnalyticsProvider>
      <AuthProvider>
        <UserProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignupForm />} />
                
                {/* Protected Routes */}
                <Route 
                  path="/onboarding/*" 
                  element={
                    <ProtectedRoute>
                      <OnboardingFlow />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/enhanced-onboarding/*" 
                  element={
                    <ProtectedRoute>
                      <EnhancedOnboardingFlow />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/write" 
                  element={
                    <ProtectedRoute>
                      <EnhancedWritingSession />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/progress" 
                  element={
                    <ProtectedRoute>
                      <ProgressTracker />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </Layout>
          </Router>
        </UserProvider>
      </AuthProvider>
    </AnalyticsProvider>
  );
}

export default App;