import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import EmailTypeSelection from '../components/writing/EmailTypeSelection';
import MiniLessonDelivery from '../components/writing/MiniLessonDelivery';
import MagicPromptGenerator from '../components/writing/MagicPromptGenerator';
import EmailEditor from '../components/writing/EmailEditor';
import WritingFeedback from '../components/writing/WritingFeedback';

const WritingSession = () => {
  const { user, updateProgress } = useUser();
  const { trackWritingStart, trackWritingComplete } = useAnalytics();
  
  const [currentStep, setCurrentStep] = useState('type-selection'); // type-selection, mini-lesson, prompt, writing, feedback
  const [emailType, setEmailType] = useState(null);
  const [objectionBelief, setObjectionBelief] = useState(null);
  const [magicPrompt, setMagicPrompt] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [sessionData, setSessionData] = useState({
    startTime: new Date(),
    confidenceBefore: 0,
    confidenceAfter: 0
  });

  const handleTypeSelected = (typeData) => {
    setEmailType(typeData.type);
    setObjectionBelief(typeData.objectionBelief);
    setCurrentStep('mini-lesson');
  };

  const handleLessonComplete = () => {
    setCurrentStep('prompt');
  };

  const handlePromptGenerated = (prompt, confidenceLevel) => {
    setMagicPrompt(prompt);
    setSessionData(prev => ({ ...prev, confidenceBefore: confidenceLevel }));
    setCurrentStep('writing');
    
    trackWritingStart({
      type: emailType,
      promptUsed: prompt.type
    });
  };

  const handleWritingComplete = (content, confidenceAfter) => {
    setEmailContent(content);
    setSessionData(prev => ({ ...prev, confidenceAfter }));
    setCurrentStep('feedback');
    
    const timeSpent = Math.round((new Date() - sessionData.startTime) / 1000 / 60);
    trackWritingComplete({
      wordCount: content.split(' ').length,
      timeSpent,
      confidenceAfter,
      emailType
    });

    // Update user progress
    updateProgress(prev => ({
      ...prev,
      emailsWritten: prev.emailsWritten + 1,
      confidenceScore: Math.round((prev.confidenceScore + confidenceAfter) / 2),
      lastWritingSession: new Date().toISOString()
    }));
  };

  const handleStartNewEmail = () => {
    setCurrentStep('type-selection');
    setEmailType(null);
    setObjectionBelief(null);
    setMagicPrompt(null);
    setEmailContent('');
    setSessionData({
      startTime: new Date(),
      confidenceBefore: 0,
      confidenceAfter: 0
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Writing Session
        </h1>
        <p className="text-gray-600">
          Let's create an email that feels authentically you
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {['type-selection', 'mini-lesson', 'prompt', 'writing', 'feedback'].map((step, index) => (
            <React.Fragment key={step}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                currentStep === step
                  ? 'bg-blue-500 text-white'
                  : ['type-selection', 'mini-lesson', 'prompt', 'writing', 'feedback'].indexOf(currentStep) > index
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-500'
              }`}>
                {index + 1}
              </div>
              {index < 4 && (
                <div className={`w-12 h-1 ${
                  ['type-selection', 'mini-lesson', 'prompt', 'writing', 'feedback'].indexOf(currentStep) > index
                    ? 'bg-green-500'
                    : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 'type-selection' && (
          <EmailTypeSelection onTypeSelected={handleTypeSelected} />
        )}

        {currentStep === 'mini-lesson' && (
          <MiniLessonDelivery
            emailType={emailType}
            objectionBelief={objectionBelief}
            onLessonComplete={handleLessonComplete}
          />
        )}

        {currentStep === 'prompt' && (
          <MagicPromptGenerator
            user={user}
            emailType={emailType}
            objectionBelief={objectionBelief}
            onPromptGenerated={handlePromptGenerated}
          />
        )}

        {currentStep === 'writing' && (
          <EmailEditor
            magicPrompt={magicPrompt}
            emailType={emailType}
            onComplete={handleWritingComplete}
          />
        )}

        {currentStep === 'feedback' && (
          <WritingFeedback
            emailContent={emailContent}
            sessionData={sessionData}
            emailType={emailType}
            onStartNew={handleStartNewEmail}
          />
        )}
      </motion.div>
    </div>
  );
};

export default WritingSession;