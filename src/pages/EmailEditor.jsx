import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useWritingSession } from '../hooks/useWritingSession';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiEdit3, FiSave, FiCheck, FiArrowLeft, FiLoader, FiAlertCircle, FiX } = FiIcons;

const EmailEditor = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { getActiveSession, autoSaveDraft, completeSession, isLoading, error } = useWritingSession();
  const [session, setSession] = useState(null);
  const [content, setContent] = useState('');
  const [isEditing, setIsEditing] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle'); // idle, saving, saved, error
  const [saveMessage, setSaveMessage] = useState('');
  const [showExitPrompt, setShowExitPrompt] = useState(false);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        // In a real app, you would fetch the specific session by ID
        // For now, we'll simulate by getting the active session
        const result = await getActiveSession();
        
        if (result) {
          setSession(result);
          setContent(result.userDraftContent || '');
        } else {
          // Simulate session data for demo purposes
          const mockSession = {
            sessionId,
            emailType: 'cart_open',
            confidenceBefore: 5,
            confidenceAfter: 8,
            userDraftContent: 'This is a placeholder for the email content you would be editing.',
            completionStatus: 'completed',
            wordCount: 250,
            flowTimeSeconds: 600,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          setSession(mockSession);
          setContent(mockSession.userDraftContent || '');
        }
      } catch (error) {
        console.error('Error fetching session:', error);
      }
    };

    fetchSession();
  }, [sessionId]);

  // Auto-save when content changes
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (content && session && content !== session.userDraftContent) {
        handleAutoSave();
      }
    }, 5000); // Auto-save after 5 seconds of inactivity
    
    return () => clearTimeout(autoSaveTimer);
  }, [content]);

  const handleAutoSave = async () => {
    if (!content || !session) return;
    
    setSaveStatus('saving');
    setSaveMessage('Saving...');
    
    try {
      // In a real app, this would save to your backend
      const result = await autoSaveDraft(content, session.flowTimeSeconds || 0);
      
      if (result && result.success) {
        setSaveStatus('saved');
        setSaveMessage('Saved');
        setTimeout(() => {
          setSaveStatus('idle');
          setSaveMessage('');
        }, 3000);
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      console.error('Error auto-saving:', error);
      setSaveStatus('error');
      setSaveMessage('Save failed');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    setSaveMessage('Saving...');
    
    try {
      // In a real app, this would save to your backend
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      
      // Update local state to reflect changes
      setSession(prev => ({
        ...prev,
        userDraftContent: content,
        updatedAt: new Date().toISOString()
      }));
      
      setSaveStatus('saved');
      setSaveMessage('Saved successfully');
      setTimeout(() => {
        setSaveStatus('idle');
        setSaveMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error saving:', error);
      setSaveStatus('error');
      setSaveMessage('Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    try {
      // In a real app, this would mark the session as complete
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      
      // Navigate to the emails dashboard with completion flag
      navigate(`/emails?completed=${sessionId}`);
    } catch (error) {
      console.error('Error completing session:', error);
      setSaveStatus('error');
      setSaveMessage('Failed to complete email');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExit = () => {
    if (content !== session?.userDraftContent) {
      setShowExitPrompt(true);
    } else {
      navigate('/emails');
    }
  };

  const confirmExit = () => {
    navigate('/emails');
  };

  const getEmailTypeDisplayName = (type) => {
    const names = {
      'cart_open': 'Cart Open Email',
      'belief_shifting': 'Belief Shifting Email',
      'social_proof': 'Social Proof Email',
      'cart_close': 'Cart Close Email'
    };
    return names[type] || type;
  };

  if (isLoading || !session) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="ml-2 text-gray-600">Loading email...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Exit Confirmation Dialog */}
      {showExitPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Unsaved Changes
            </h3>
            <p className="text-gray-700 mb-4">
              You have unsaved changes. Are you sure you want to leave?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowExitPrompt(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={confirmExit}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Leave Without Saving
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={handleExit}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
          >
            <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Email' : 'View Email'}
            </h1>
            <p className="text-gray-600">
              {getEmailTypeDisplayName(session.emailType)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {saveStatus === 'saving' && (
            <div className="flex items-center text-yellow-600 text-sm">
              <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin mr-1" />
              <span>{saveMessage}</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center text-green-600 text-sm">
              <SafeIcon icon={FiCheck} className="w-4 h-4 mr-1" />
              <span>{saveMessage}</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <div className="flex items-center text-red-600 text-sm">
              <SafeIcon icon={FiAlertCircle} className="w-4 h-4 mr-1" />
              <span>{saveMessage}</span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-1"
            >
              <SafeIcon icon={FiSave} className="w-4 h-4" />
              <span>Save</span>
            </button>
            <button
              onClick={handleComplete}
              disabled={isSaving}
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-1"
            >
              <SafeIcon icon={FiCheck} className="w-4 h-4" />
              <span>Complete</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Email Editor */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-md p-6"
      >
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center space-x-3">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subject Line
          </label>
          <input
            type="text"
            placeholder="Email subject line"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
            disabled={!isEditing || isSaving}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your email content here..."
            rows={20}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-none"
            disabled={!isEditing || isSaving}
          />
        </div>

        <div className="flex justify-between items-center mt-6 text-sm text-gray-600">
          <div>
            {content.split(/\s+/).filter(word => word.length > 0).length} words
          </div>
          <div>
            Last edited: {new Date(session.updatedAt).toLocaleString()}
          </div>
        </div>
      </motion.div>

      {/* Email Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 rounded-2xl p-6 mt-6"
      >
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Email Stats</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-blue-700">Confidence Before</p>
            <p className="text-xl font-semibold text-blue-900">{session.confidenceBefore}/10</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Confidence After</p>
            <p className="text-xl font-semibold text-blue-900">{session.confidenceAfter}/10</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Word Count</p>
            <p className="text-xl font-semibold text-blue-900">{session.wordCount}</p>
          </div>
          <div>
            <p className="text-sm text-blue-700">Flow Time</p>
            <p className="text-xl font-semibold text-blue-900">
              {Math.floor(session.flowTimeSeconds / 60)}:{(session.flowTimeSeconds % 60).toString().padStart(2, '0')}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default EmailEditor;