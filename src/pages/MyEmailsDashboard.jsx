import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useWritingSession } from '../hooks/useWritingSession';
import { useUser } from '../contexts/UserContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { 
  FiMail, FiDownload, FiExternalLink, FiEdit3, FiCalendar, FiTrendingUp, 
  FiClock, FiCheckCircle, FiSearch, FiFilter, FiLoader, FiAlertCircle,
  FiX, FiChevronDown 
} = FiIcons;

const MyEmailsDashboard = () => {
  const { getSessionHistory, isLoading, error } = useWritingSession();
  const { userProgress } = useUser();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedSession, setSelectedSession] = useState(null);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportFormat, setExportFormat] = useState('txt');
  const [exportLoading, setExportLoading] = useState(false);
  const [showCompletionCelebration, setShowCompletionCelebration] = useState(false);
  const [newlyCompletedSession, setNewlyCompletedSession] = useState(null);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const location = useLocation();

  // Check if redirected with newly completed session
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('completed');
    if (sessionId) {
      // Find the session in the loaded sessions
      const completedSession = sessions.find(s => s.sessionId === sessionId);
      if (completedSession) {
        setNewlyCompletedSession(completedSession);
        setShowCompletionCelebration(true);
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [sessions, location.search]);

  // Fetch session history on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Apply filters when sessions, searchTerm, or filterType change
  useEffect(() => {
    applyFilters();
  }, [sessions, searchTerm, filterType]);

  const fetchSessions = async () => {
    try {
      const result = await getSessionHistory(50); // Get up to 50 recent sessions
      if (result.success) {
        setSessions(result.sessions);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      // For demo purposes, add some mock sessions if API fails
      setSessions(generateMockSessions());
    }
  };

  const generateMockSessions = () => {
    const mockTypes = ['cart_open', 'belief_shifting', 'social_proof', 'cart_close'];
    const mockStatuses = ['completed', 'draft', 'abandoned'];
    return Array.from({ length: 10 }, (_, i) => ({
      sessionId: `session_${i+1}`,
      emailType: mockTypes[Math.floor(Math.random() * mockTypes.length)],
      completionStatus: mockStatuses[Math.floor(Math.random() * mockStatuses.length)],
      confidenceBefore: Math.floor(Math.random() * 5) + 3,
      confidenceAfter: Math.floor(Math.random() * 5) + 5,
      wordCount: Math.floor(Math.random() * 500) + 200,
      flowTimeSeconds: Math.floor(Math.random() * 1800) + 300,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
    }));
  };

  const applyFilters = () => {
    let filtered = [...sessions];

    // Apply email type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(session => session.emailType === filterType);
    }

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(session => 
        session.emailType.toLowerCase().includes(term) || 
        session.sessionId.toLowerCase().includes(term)
      );
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    
    setFilteredSessions(filtered);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'h:mm a');
  };

  const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
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

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Completed</span>;
      case 'draft':
        return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">In Progress</span>;
      case 'abandoned':
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">Abandoned</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">{status}</span>;
    }
  };

  const openEmailPreview = (session) => {
    setSelectedSession(session);
  };

  const closeEmailPreview = () => {
    setSelectedSession(null);
  };

  const handleExport = async (session) => {
    setExportLoading(true);
    try {
      // In a real app, this would fetch the email content from the backend
      // For demo purposes, we'll simulate a delay and create a simple export
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate export content
      const content = `Email Type: ${getEmailTypeDisplayName(session.emailType)}
Date: ${formatDate(session.createdAt)}
Confidence Before: ${session.confidenceBefore}/10
Confidence After: ${session.confidenceAfter}/10
Word Count: ${session.wordCount}
Flow Time: ${formatDuration(session.flowTimeSeconds)}

This is a placeholder for the actual email content that would be fetched from the database.
The content would include the full email that the user wrote during this session.`;
      
      // Create and trigger download
      downloadFile(content, `email-${session.sessionId.substring(0, 8)}`, exportFormat);
    } catch (error) {
      console.error('Error exporting email:', error);
    } finally {
      setExportLoading(false);
      setShowExportOptions(false);
    }
  };

  const handleExportAll = async () => {
    setIsExportingAll(true);
    try {
      // In a real app, this would fetch all email contents from the backend
      // For demo purposes, we'll simulate a delay and create a simple export
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate export content for all completed emails
      const completedSessions = sessions.filter(s => s.completionStatus === 'completed');
      let content = `# My Emails Export\nExported on ${new Date().toLocaleDateString()}\nTotal Emails: ${completedSessions.length}\n\n`;
      
      completedSessions.forEach((session, index) => {
        content += `## Email ${index + 1}: ${getEmailTypeDisplayName(session.emailType)}\n`;
        content += `Date: ${formatDate(session.createdAt)}\n`;
        content += `Confidence: ${session.confidenceBefore}/10 → ${session.confidenceAfter}/10\n`;
        content += `Word Count: ${session.wordCount}\n\n`;
        content += `This is a placeholder for email ${index + 1} content.\n\n`;
        content += `---\n\n`;
      });
      
      // Create and trigger download
      downloadFile(content, `all-emails-${new Date().toISOString().split('T')[0]}`, exportFormat);
    } catch (error) {
      console.error('Error exporting all emails:', error);
    } finally {
      setIsExportingAll(false);
    }
  };

  const downloadFile = (content, fileName, format) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCelebrationClose = () => {
    setShowCompletionCelebration(false);
    setNewlyCompletedSession(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <SafeIcon icon={FiLoader} className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="ml-2 text-gray-600">Loading your emails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Completion Celebration Modal */}
      {showCompletionCelebration && newlyCompletedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl p-8 md:p-12 max-w-lg w-full text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <SafeIcon icon={FiCheckCircle} className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Email Added to Library!</h2>
            <p className="text-xl text-gray-600 mb-6">
              Your {getEmailTypeDisplayName(newlyCompletedSession.emailType).toLowerCase()} has been saved to your email library.
            </p>
            <div className="bg-blue-50 rounded-xl p-4 mb-6">
              <p className="text-blue-800">
                <strong>Confidence boost:</strong> +{newlyCompletedSession.confidenceAfter - newlyCompletedSession.confidenceBefore} points
              </p>
              <p className="text-blue-800">
                <strong>Word count:</strong> {newlyCompletedSession.wordCount} words
              </p>
            </div>
            <button
              onClick={handleCelebrationClose}
              className="px-8 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              View in My Emails
            </button>
          </motion.div>
        </div>
      )}

      {/* Email Preview Modal */}
      {selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{getEmailTypeDisplayName(selectedSession.emailType)}</h3>
                <p className="text-sm text-gray-600">{formatDate(selectedSession.createdAt)} • {formatTime(selectedSession.createdAt)}</p>
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleExport(selectedSession)}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  title="Export Email"
                >
                  <SafeIcon icon={FiDownload} className="w-5 h-5" />
                </button>
                <Link to={`/write/edit/${selectedSession.sessionId}`}>
                  <button
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                    title="Edit Email"
                  >
                    <SafeIcon icon={FiEdit3} className="w-5 h-5" />
                  </button>
                </Link>
                <button
                  onClick={closeEmailPreview}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
                  title="Close"
                >
                  <SafeIcon icon={FiX} className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="mb-4 bg-blue-50 rounded-xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-blue-700">Confidence Before</p>
                    <p className="text-lg font-semibold text-blue-900">{selectedSession.confidenceBefore}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Confidence After</p>
                    <p className="text-lg font-semibold text-blue-900">{selectedSession.confidenceAfter}/10</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Word Count</p>
                    <p className="text-lg font-semibold text-blue-900">{selectedSession.wordCount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-700">Flow Time</p>
                    <p className="text-lg font-semibold text-blue-900">{formatDuration(selectedSession.flowTimeSeconds)}</p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Email Content</h4>
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    This is a placeholder for the email content that would be fetched from the database. In a real implementation,
                    the full email content would be displayed here.
                  </p>
                  <p className="text-gray-700 mt-4">
                    The content would include the subject line, body text, and any formatting that was applied during the writing session.
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={closeEmailPreview}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 mr-3"
                >
                  Close
                </button>
                <Link to={`/write/edit/${selectedSession.sessionId}`}>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Edit Email
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Emails</h1>
          <p className="text-gray-600">View, edit, and export your email drafts</p>
        </div>
        <Link to="/write">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all flex items-center space-x-2"
          >
            <SafeIcon icon={FiEdit3} className="w-4 h-4" />
            <span>Write New Email</span>
          </motion.button>
        </Link>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
      >
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiMail} className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-500">Total Emails</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {sessions.filter(s => s.completionStatus === 'completed').length}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {sessions.filter(s => s.completionStatus === 'draft').length} drafts in progress
          </p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiTrendingUp} className="w-5 h-5 text-green-500" />
            <span className="text-sm font-medium text-gray-500">Avg. Confidence Gain</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {sessions.length > 0 ? 
              `+${Math.round(sessions.reduce((sum, session) => 
                sum + ((session.confidenceAfter || 0) - (session.confidenceBefore || 0)), 0) / sessions.length * 10) / 10}` 
              : '+0'}
          </p>
          <p className="text-sm text-green-600 mt-1">points per email</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md">
          <div className="flex items-center space-x-3 mb-2">
            <SafeIcon icon={FiCalendar} className="w-5 h-5 text-purple-500" />
            <span className="text-sm font-medium text-gray-500">Last Email</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {sessions.length > 0 ? 
              formatDate(
                [...sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0].updatedAt
              ) 
              : 'N/A'}
          </p>
          <p className="text-sm text-purple-600 mt-1">
            {sessions.length > 0 ? 
              formatTime(
                [...sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0].updatedAt
              ) 
              : ''}
          </p>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-md mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <div className="relative flex-grow md:w-64">
              <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none px-4 py-2 pr-10 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
              >
                <option value="all">All Types</option>
                <option value="cart_open">Cart Open</option>
                <option value="belief_shifting">Belief Shifting</option>
                <option value="social_proof">Social Proof</option>
                <option value="cart_close">Cart Close</option>
              </select>
              <SafeIcon
                icon={FiChevronDown}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
            >
              <SafeIcon icon={FiDownload} className="w-4 h-4" />
              <span>Export</span>
              <SafeIcon icon={FiChevronDown} className="w-4 h-4" />
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 border border-gray-100">
                <div className="p-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">Export Format</p>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setExportFormat('txt')}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        exportFormat === 'txt' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      TXT
                    </button>
                    <button
                      onClick={() => setExportFormat('md')}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        exportFormat === 'md' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      MD
                    </button>
                  </div>
                </div>
                <div className="p-2">
                  <button
                    onClick={handleExportAll}
                    disabled={isExportingAll || sessions.filter(s => s.completionStatus === 'completed').length === 0}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 rounded flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isExportingAll ? (
                      <>
                        <SafeIcon icon={FiLoader} className="w-4 h-4 animate-spin" />
                        <span>Exporting...</span>
                      </>
                    ) : (
                      <>
                        <SafeIcon icon={FiDownload} className="w-4 h-4" />
                        <span>Export All Emails</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center space-x-3">
            <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Results count */}
        <p className="text-sm text-gray-600">
          Showing {filteredSessions.length} {filteredSessions.length === 1 ? 'email' : 'emails'}
          {filterType !== 'all' && ` of type "${getEmailTypeDisplayName(filterType)}"`}
          {searchTerm && ` matching "${searchTerm}"`}
        </p>
      </motion.div>

      {/* Email List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {filteredSessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-md text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <SafeIcon icon={FiMail} className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No emails found</h3>
            <p className="text-gray-600 mb-6">
              {sessions.length === 0 ? "You haven't written any emails yet." : "No emails match your search criteria."}
            </p>
            {sessions.length === 0 && (
              <Link to="/write">
                <button className="px-6 py-3 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
                  Write Your First Email
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <motion.div
                key={session.sessionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className={`bg-white rounded-2xl shadow-md overflow-hidden border-l-4 ${
                  newlyCompletedSession?.sessionId === session.sessionId ? 'border-green-500' :
                  session.completionStatus === 'completed' ? 'border-blue-500' :
                  session.completionStatus === 'draft' ? 'border-yellow-500' : 'border-gray-300'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center">
                  <div className="p-6 flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {getEmailTypeDisplayName(session.emailType)}
                        </h3>
                        {getStatusBadge(session.completionStatus)}
                        {newlyCompletedSession?.sessionId === session.sessionId && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full animate-pulse">
                            Just Completed!
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 hidden md:block">
                        {formatDate(session.createdAt)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                      <div>
                        <p className="text-xs text-gray-500">Confidence</p>
                        <p className="text-sm font-medium text-gray-900">
                          {session.confidenceBefore}/10 → {session.confidenceAfter}/10
                          {session.confidenceAfter > session.confidenceBefore && (
                            <span className="text-green-600 ml-1">
                              (+{session.confidenceAfter - session.confidenceBefore})
                            </span>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Words</p>
                        <p className="text-sm font-medium text-gray-900">{session.wordCount}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Flow Time</p>
                        <p className="text-sm font-medium text-gray-900">
                          {formatDuration(session.flowTimeSeconds)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Created</p>
                        <p className="text-sm font-medium text-gray-900 md:hidden">
                          {formatDate(session.createdAt)}
                        </p>
                        <p className="text-sm font-medium text-gray-900 hidden md:block">
                          {formatTime(session.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 md:hidden mt-2">
                      <button
                        onClick={() => openEmailPreview(session)}
                        className="px-3 py-1 text-xs font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >
                        View
                      </button>
                      <Link to={`/write/edit/${session.sessionId}`}>
                        <button className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                          Edit
                        </button>
                      </Link>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-6 flex flex-row md:flex-col items-center justify-between md:justify-center space-y-0 md:space-y-2 border-t md:border-t-0 md:border-l border-gray-100">
                    <button
                      onClick={() => openEmailPreview(session)}
                      className="p-2 text-blue-700 hover:bg-blue-50 rounded-full hidden md:block"
                      title="View Email"
                    >
                      <SafeIcon icon={FiExternalLink} className="w-5 h-5" />
                    </button>
                    <Link to={`/write/edit/${session.sessionId}`}>
                      <button
                        className="p-2 text-gray-700 hover:bg-gray-100 rounded-full hidden md:block"
                        title="Edit Email"
                      >
                        <SafeIcon icon={FiEdit3} className="w-5 h-5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => {
                        setSelectedSession(session);
                        setShowExportOptions(true);
                      }}
                      className="p-2 text-gray-700 hover:bg-gray-100 rounded-full"
                      title="Export Email"
                    >
                      <SafeIcon icon={FiDownload} className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MyEmailsDashboard;