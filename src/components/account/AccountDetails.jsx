import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiMail, FiCalendar, FiLoader, FiCheck, FiAlertCircle } = FiIcons;

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AccountDetails = ({ userProfile }) => {
  const { updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    email: userProfile?.email || '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data, error } = await updateUserProfile(formData);
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
        setIsEditing(false);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Information</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <SafeIcon icon={FiAlertCircle} className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 flex items-center space-x-3">
          <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-green-800 text-sm">Your account information has been updated successfully.</p>
        </div>
      )}

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              disabled
            />
            <p className="text-xs text-gray-500 mt-1">Email address cannot be changed.</p>
          </div>
          
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={loading}
              className="flex-1 py-3 px-4 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <SafeIcon icon={FiLoader} className="w-5 h-5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Name</span>
                </div>
                <p className="text-lg font-medium text-gray-900 pl-8">
                  {userProfile?.name || userProfile?.email?.split('@')[0] || 'Not provided'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Email</span>
                </div>
                <p className="text-lg font-medium text-gray-900 pl-8">{userProfile?.email}</p>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">Member Since</span>
                </div>
                <p className="text-lg font-medium text-gray-900 pl-8">
                  {userProfile?.createdAt 
                    ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : 'Unknown'}
                </p>
              </div>
              
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <SafeIcon icon={FiUser} className="w-5 h-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">User ID</span>
                </div>
                <p className="text-lg font-medium text-gray-900 pl-8">
                  {userProfile?.id 
                    ? `${userProfile.id.substring(0, 8)}...${userProfile.id.substring(userProfile.id.length - 4)}`
                    : 'Not available'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all"
            >
              Edit Profile
            </button>
          </div>
        </div>
      )}
      
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-gray-900 mb-6">Account Security</h3>
        
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-medium text-gray-900 mb-4">Change Password</h4>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all">
              Update Password
            </button>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-6">
            <h4 className="font-medium text-gray-900 mb-4">Two-Factor Authentication</h4>
            <p className="text-gray-600 mb-4">
              Enhance your account security by enabling two-factor authentication.
            </p>
            <button className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-all">
              Set Up Two-Factor Authentication
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-xl font-semibold text-red-600 mb-6">Danger Zone</h3>
        
        <div className="bg-red-50 rounded-2xl p-6">
          <h4 className="font-medium text-red-800 mb-2">Delete Account</h4>
          <p className="text-red-700 text-sm mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <button className="px-6 py-3 bg-white border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-100 transition-all">
            Delete My Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;