import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPackage, FiArrowRight, FiArrowLeft } = FiIcons;

const OfferDetailsStep = ({ data, onUpdate }) => {
  const [offer, setOffer] = useState(data.offer || {
    title: '',
    description: '',
    priceRange: '',
    launchDate: ''
  });

  const handleContinue = () => {
    onUpdate({ offer });
  };

  const updateOffer = (field, value) => {
    setOffer(prev => ({ ...prev, [field]: value }));
  };

  const priceRanges = [
    'Under $100',
    '$100 - $500',
    '$500 - $1,000',
    '$1,000 - $5,000',
    '$5,000 - $10,000',
    'Over $10,000'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiPackage} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Tell me about your offer
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          The more I understand what you're launching, the better I can help you 
          write emails that genuinely connect with your best-fit clients.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What are you launching?
          </label>
          <input
            type="text"
            value={offer.title}
            onChange={(e) => updateOffer('title', e.target.value)}
            placeholder="e.g., My signature coaching program, Email writing course..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your offer in your own words
          </label>
          <textarea
            value={offer.description}
            onChange={(e) => updateOffer('description', e.target.value)}
            placeholder="Don't worry about making this perfect. Just tell me what you're offering and why it matters to you..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            What's your price range?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {priceRanges.map((range) => (
              <button
                key={range}
                onClick={() => updateOffer('priceRange', range)}
                className={`p-3 rounded-xl text-sm font-medium transition-all ${
                  offer.priceRange === range
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            When are you planning to launch?
          </label>
          <input
            type="text"
            value={offer.launchDate}
            onChange={(e) => updateOffer('launchDate', e.target.value)}
            placeholder="e.g., Next month, This spring, When I'm ready..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex space-x-4 pt-6">
          <Link 
            to="/onboarding"
            className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Back</span>
          </Link>
          
          <Link 
            to="/onboarding/clients"
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              offer.title && offer.description
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Let's talk about your people</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> Don't overthink this. I just want to understand 
          what you're passionate about so I can help you share that passion authentically.
        </p>
      </div>
    </motion.div>
  );
};

export default OfferDetailsStep;