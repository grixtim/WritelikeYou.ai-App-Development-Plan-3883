import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiArrowRight, FiArrowLeft, FiPlus, FiX } = FiIcons;

const ClientPsychologyStep = ({ data, onUpdate }) => {
  const [bestFitClient, setBestFitClient] = useState(data.bestFitClient || {
    demographics: '',
    painPoints: [],
    desires: [],
    communicationStyle: ''
  });

  const [newPainPoint, setNewPainPoint] = useState('');
  const [newDesire, setNewDesire] = useState('');

  const handleContinue = () => {
    onUpdate({ bestFitClient });
  };

  const updateClient = (field, value) => {
    setBestFitClient(prev => ({ ...prev, [field]: value }));
  };

  const addPainPoint = () => {
    if (newPainPoint.trim()) {
      updateClient('painPoints', [...bestFitClient.painPoints, newPainPoint.trim()]);
      setNewPainPoint('');
    }
  };

  const removePainPoint = (index) => {
    updateClient('painPoints', bestFitClient.painPoints.filter((_, i) => i !== index));
  };

  const addDesire = () => {
    if (newDesire.trim()) {
      updateClient('desires', [...bestFitClient.desires, newDesire.trim()]);
      setNewDesire('');
    }
  };

  const removeDesire = (index) => {
    updateClient('desires', bestFitClient.desires.filter((_, i) => i !== index));
  };

  const communicationStyles = [
    'Direct and straightforward',
    'Warm and encouraging',
    'Detailed and thorough',
    'Casual and friendly',
    'Professional but personal',
    'Inspiring and motivational'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiUsers} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Who are your best-fit clients?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Help me understand the people you love working with. This isn't about demographics - 
          it's about understanding their hearts and minds.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Describe your ideal client
          </label>
          <textarea
            value={bestFitClient.demographics}
            onChange={(e) => updateClient('demographics', e.target.value)}
            placeholder="Think beyond age and location. What are they like as people? What do they value? What stage of life or business are they in?"
            rows={3}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What challenges are they facing?
          </label>
          <div className="space-y-2">
            {bestFitClient.painPoints.map((point, index) => (
              <div key={index} className="flex items-center space-x-2 bg-red-50 px-3 py-2 rounded-lg">
                <span className="flex-1 text-sm text-red-700">{point}</span>
                <button
                  onClick={() => removePainPoint(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newPainPoint}
                onChange={(e) => setNewPainPoint(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addPainPoint()}
                placeholder="e.g., Feeling overwhelmed by marketing..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addPainPoint}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What do they really want?
          </label>
          <div className="space-y-2">
            {bestFitClient.desires.map((desire, index) => (
              <div key={index} className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <span className="flex-1 text-sm text-green-700">{desire}</span>
                <button
                  onClick={() => removeDesire(index)}
                  className="text-green-500 hover:text-green-700"
                >
                  <SafeIcon icon={FiX} className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="flex space-x-2">
              <input
                type="text"
                value={newDesire}
                onChange={(e) => setNewDesire(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDesire()}
                placeholder="e.g., To feel confident in their expertise..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={addDesire}
                className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            How do they prefer to be communicated with?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {communicationStyles.map((style) => (
              <button
                key={style}
                onClick={() => updateClient('communicationStyle', style)}
                className={`p-3 rounded-xl text-sm font-medium transition-all text-left ${
                  bestFitClient.communicationStyle === style
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <Link 
            to="/onboarding/offer"
            className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Back</span>
          </Link>
          
          <Link 
            to="/onboarding/personality"
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              bestFitClient.demographics && bestFitClient.communicationStyle
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Now let's talk about you</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> Think about your favorite clients. What makes them 
          a joy to work with? That's who we're writing for.
        </p>
      </div>
    </motion.div>
  );
};

export default ClientPsychologyStep;