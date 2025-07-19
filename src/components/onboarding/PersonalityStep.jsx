import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHeart, FiArrowRight, FiArrowLeft } = FiIcons;

const PersonalityStep = ({ data, onUpdate }) => {
  const [personality, setPersonality] = useState(data.personality || {
    writingStyle: '',
    energyLevel: '',
    humor: '',
    vulnerability: ''
  });

  const handleContinue = () => {
    onUpdate({ personality });
  };

  const updatePersonality = (field, value) => {
    setPersonality(prev => ({ ...prev, [field]: value }));
  };

  const writingStyles = [
    'Conversational and casual',
    'Professional but warm',
    'Storytelling focused',
    'Direct and to-the-point',
    'Detailed and explanatory',
    'Inspiring and uplifting'
  ];

  const energyLevels = [
    'Calm and steady',
    'Enthusiastic and energetic',
    'Thoughtful and reflective',
    'Playful and light',
    'Passionate and intense',
    'Gentle and nurturing'
  ];

  const humorStyles = [
    'I love adding humor',
    'Subtle wit works for me',
    'Keep it light occasionally',
    'Prefer to stay serious',
    'Self-deprecating humor',
    'Depends on the topic'
  ];

  const vulnerabilityLevels = [
    'I share openly about struggles',
    'I share some personal stories',
    'I prefer to stay professional',
    'I share when it helps others',
    'I\'m still figuring this out',
    'It depends on my mood'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiHeart} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          What's your writing personality?
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          This is where the magic happens. Help me understand your natural voice 
          so I can help you write emails that feel authentically you.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            How do you naturally write?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {writingStyles.map((style) => (
              <button
                key={style}
                onClick={() => updatePersonality('writingStyle', style)}
                className={`p-4 rounded-xl text-sm font-medium transition-all text-left ${
                  personality.writingStyle === style
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            What's your energy like?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {energyLevels.map((level) => (
              <button
                key={level}
                onClick={() => updatePersonality('energyLevel', level)}
                className={`p-4 rounded-xl text-sm font-medium transition-all text-left ${
                  personality.energyLevel === level
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            How do you feel about humor in your writing?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {humorStyles.map((humor) => (
              <button
                key={humor}
                onClick={() => updatePersonality('humor', humor)}
                className={`p-4 rounded-xl text-sm font-medium transition-all text-left ${
                  personality.humor === humor
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {humor}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-lg font-medium text-gray-900 mb-4">
            How comfortable are you with being vulnerable?
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {vulnerabilityLevels.map((level) => (
              <button
                key={level}
                onClick={() => updatePersonality('vulnerability', level)}
                className={`p-4 rounded-xl text-sm font-medium transition-all text-left ${
                  personality.vulnerability === level
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        <div className="flex space-x-4 pt-6">
          <Link 
            to="/onboarding/clients"
            className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
            <span>Back</span>
          </Link>
          
          <Link 
            to="/onboarding/complete"
            onClick={handleContinue}
            className={`flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all ${
              Object.values(personality).every(value => value)
                ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            <span>Almost done!</span>
            <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> There's no "right" personality for email writing. 
          Your authentic voice is exactly what your best-fit clients want to hear.
        </p>
      </div>
    </motion.div>
  );
};

export default PersonalityStep;