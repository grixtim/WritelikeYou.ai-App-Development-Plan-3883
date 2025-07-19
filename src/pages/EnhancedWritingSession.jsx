import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '../contexts/UserContext';
import { useAnalytics } from '../contexts/AnalyticsContext';
import { useWritingSession } from '../hooks/useWritingSession';
import EnhancedEmailTypeSelection from '../components/writing/EnhancedEmailTypeSelection';
import AIEnhancedMiniLesson from '../components/writing/AIEnhancedMiniLesson';
import AIEnhancedMagicPromptGenerator from '../components/writing/AIEnhancedMagicPromptGenerator';
import EnhancedWritingEditor from '../components/writing/EnhancedWritingEditor';
import CopyFeedbackSystem from '../components/writing/CopyFeedbackSystem';
import CompletionCelebration from '../components/writing/CompletionCelebration';

const EnhancedWritingSession = () => {
  const { user, updateProgress } = useUser();
  const { trackWritingStart, trackWritingComplete } = useAnalytics();
  const { 
    currentSession, 
    createSession, 
    getActiveSession, 
    updateProgress: updateSessionProgress,
    completeSession,
    isLoading: sessionLoading 
  } = useWritingSession();

  const [currentStep, setCurrentStep] = useState('type-selection');
  const [emailType, setEmailType] = useState(null);
  const [beliefToShift, setBeliefToShift] = useState(null);
  const [additionalContext, setAdditionalContext] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState(5);
  const [magicPrompt, setMagicPrompt] = useState(null);
  const [emailContent, setEmailContent] = useState('');
  const [sessionData, setSessionData] = useState({
    startTime: new Date(),
    confidenceBefore: 0,
    confidenceAfter: 0,
    activeWritingTime: 0,
    totalTime: 0
  });

  // Track if we're coming from feedback or not
  const [fromFeedback, setFromFeedback] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    const checkExistingSession = async () => {
      const activeSession = await getActiveSession();
      if (activeSession) {
        // Resume existing session
        setEmailType(activeSession.emailType);
        setConfidenceLevel(activeSession.confidenceBefore);
        setCurrentStep(activeSession.currentStep || 'type-selection');
        
        // Restore session data if available
        if (activeSession.magicPromptGenerated) {
          setMagicPrompt(activeSession.magicPromptGenerated);
        }
        if (activeSession.userDraftContent) {
          setEmailContent(activeSession.userDraftContent);
        }
        if (activeSession.setupData) {
          setAdditionalContext(activeSession.setupData.additionalContext || '');
          setBeliefToShift(activeSession.setupData.beliefToShift || null);
        }
      }
    };

    checkExistingSession();
  }, []);

  const handleTypeSelected = async (typeData) => {
    setEmailType(typeData.type);
    setBeliefToShift(typeData.beliefToShift);
    setAdditionalContext(typeData.additionalContext);
    setConfidenceLevel(typeData.confidenceLevel);
    setSessionData(prev => ({
      ...prev,
      confidenceBefore: typeData.confidenceLevel
    }));

    // Create or update session
    let sessionResult;
    if (currentSession) {
      sessionResult = await updateSessionProgress({
        emailType: typeData.type,
        setupData: {
          beliefToShift: typeData.beliefToShift,
          additionalContext: typeData.additionalContext,
          confidenceLevel: typeData.confidenceLevel,
          ...user.enhancedOffer
        },
        confidenceBefore: typeData.confidenceLevel,
        currentStep: 'mini-lesson'
      });
    } else {
      sessionResult = await createSession(
        typeData.type,
        {
          beliefToShift: typeData.beliefToShift,
          additionalContext: typeData.additionalContext,
          confidenceLevel: typeData.confidenceLevel,
          ...user.enhancedOffer
        },
        typeData.confidenceLevel
      );
    }

    if (sessionResult.success) {
      setCurrentStep('mini-lesson');
    }
  };

  const handleLessonComplete = async () => {
    await updateSessionProgress({
      currentStep: 'prompt'
    });
    setCurrentStep('prompt');
  };

  const handlePromptGenerated = async (prompt) => {
    setMagicPrompt(prompt);
    
    await updateSessionProgress({
      currentStep: 'writing',
      magicPromptGenerated: prompt
    });
    
    setCurrentStep('writing');
    
    trackWritingStart({
      type: emailType,
      promptUsed: prompt.type,
      confidenceBefore: confidenceLevel
    });
  };

  const handleWritingComplete = async (content, writingSessionData) => {
    setEmailContent(content);
    setSessionData(prev => ({
      ...prev,
      ...writingSessionData
    }));

    // Complete the session in the database
    const result = await completeSession(
      content,
      writingSessionData.confidenceAfter,
      {
        soundsLikeMe: null, // Will be updated in final step
        feelingAfterWriting: null
      },
      writingSessionData.totalTime
    );

    if (result.success) {
      setCurrentStep('final');
      
      // Update user progress in context
      updateProgress(prev => ({
        ...prev,
        emailsWritten: prev.emailsWritten + 1,
        confidenceScore: Math.round((prev.confidenceScore + writingSessionData.confidenceAfter) / 2),
        lastWritingSession: new Date().toISOString(),
        totalWordsWritten: (prev.totalWordsWritten || 0) + writingSessionData.wordCount
      }));

      trackWritingComplete({
        wordCount: writingSessionData.wordCount,
        timeSpent: Math.round(writingSessionData.totalTime / 60),
        confidenceAfter: writingSessionData.confidenceAfter,
        emailType: emailType
      });
    }
  };

  const handleRequestFeedback = async (content, partialSessionData) => {
    setEmailContent(content);
    setSessionData(prev => ({
      ...prev,
      ...partialSessionData
    }));
    
    await updateSessionProgress({
      currentStep: 'feedback',
      userDraftContent: content
    });
    
    setFromFeedback(true);
    setCurrentStep('feedback');
  };

  const handleFeedbackComplete = async () => {
    // If we came from the feedback button, go back to writing
    if (fromFeedback) {
      setFromFeedback(false);
      await updateSessionProgress({
        currentStep: 'writing'
      });
      setCurrentStep('writing');
    } else {
      setCurrentStep('final');
    }
  };

  const handleStartNewEmail = () => {
    // Reset all state for new session
    setCurrentStep('type-selection');
    setEmailType(null);
    setBeliefToShift(null);
    setAdditionalContext('');
    setConfidenceLevel(5);
    setMagicPrompt(null);
    setEmailContent('');
    setFromFeedback(false);
    setSessionData({
      startTime: new Date(),
      confidenceBefore: 0,
      confidenceAfter: 0,
      activeWritingTime: 0,
      totalTime: 0
    });
  };

  if (sessionLoading && !currentSession) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Loading your session...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Writing Session
          {currentSession && (
            <span className="text-lg text-gray-500 ml-2">
              #{currentSession.sessionId?.slice(0, 8)}
            </span>
          )}
        </h1>
        <p className="text-gray-600">
          Let's create an email that feels authentically you
        </p>
      </motion.div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center mb-8">
        <div className="flex items-center space-x-4">
          {[
            { key: 'type-selection', label: '1' },
            { key: 'mini-lesson', label: '2' },
            { key: 'prompt', label: '3' },
            { key: 'writing', label: '4' },
            { key: 'feedback', label: '5' },
            { key: 'final', label: '6' }
          ].map((step, index) => (
            <React.Fragment key={step.key}>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep === step.key
                    ? 'bg-blue-500 text-white'
                    : ['type-selection', 'mini-lesson', 'prompt', 'writing', 'feedback', 'final'].indexOf(
                        currentStep
                      ) > index
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {step.label}
              </div>
              {index < 5 && (
                <div
                  className={`w-12 h-1 ${
                    ['type-selection', 'mini-lesson', 'prompt', 'writing', 'feedback', 'final'].indexOf(
                      currentStep
                    ) > index
                      ? 'bg-green-500'
                      : 'bg-gray-200'
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep + (fromFeedback ? '-feedback' : '')}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {currentStep === 'type-selection' && (
          <EnhancedEmailTypeSelection onTypeSelected={handleTypeSelected} />
        )}

        {currentStep === 'mini-lesson' && (
          <AIEnhancedMiniLesson
            emailType={emailType}
            setupData={user.enhancedOffer || user}
            additionalContext={additionalContext}
            onLessonComplete={handleLessonComplete}
          />
        )}

        {currentStep === 'prompt' && (
          <AIEnhancedMagicPromptGenerator
            user={user}
            emailType={emailType}
            beliefToShift={beliefToShift}
            additionalContext={additionalContext}
            confidenceLevel={confidenceLevel}
            onPromptGenerated={handlePromptGenerated}
          />
        )}

        {currentStep === 'writing' && (
          <EnhancedWritingEditor
            magicPrompt={magicPrompt}
            emailType={emailType}
            onComplete={handleWritingComplete}
            onRequestFeedback={handleRequestFeedback}
          />
        )}

        {currentStep === 'feedback' && (
          <CopyFeedbackSystem
            emailContent={emailContent}
            emailType={emailType}
            onComplete={handleFeedbackComplete}
          />
        )}

        {currentStep === 'final' && (
          <CompletionCelebration
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

export default EnhancedWritingSession;