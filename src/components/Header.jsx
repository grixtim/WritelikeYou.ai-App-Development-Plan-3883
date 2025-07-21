import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit3, FiHome, FiTrendingUp, FiBrain } = FiIcons;

const Header = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: FiHome, label: 'Home' },
    { path: '/write', icon: FiEdit3, label: 'Write' },
    { path: '/progress', icon: FiTrendingUp, label: 'Progress' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <SafeIcon icon={FiBrain} className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
              Writelikeyou.ai
            </span>
          </Link>

          <nav className="flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-white/60 rounded-lg"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                  <div className="relative flex items-center space-x-2">
                    <SafeIcon
                      icon={item.icon}
                      className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-600'}`}
                    />
                    <span className={isActive ? 'text-blue-600' : 'text-gray-600'}>
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;