import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import WillyAssistant from './WillyAssistant';

const Layout = ({ children }) => {
  const location = useLocation();
  const { user } = useAuth();
  
  const isHomePage = location.pathname === '/';
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);
  const isOnboarding = location.pathname.startsWith('/onboarding');
  
  const showHeader = user && !isHomePage && !isAuthPage && !isOnboarding;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {showHeader && <Header />}
      <main className={showHeader ? 'pt-16' : ''}>
        {children}
      </main>
      {user && !isAuthPage && <WillyAssistant />}
    </div>
  );
};

export default Layout;