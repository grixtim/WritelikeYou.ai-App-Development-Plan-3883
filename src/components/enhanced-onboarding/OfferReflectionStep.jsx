import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import OnboardingProgress from './OnboardingProgress';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle, FiArrowRight, FiArrowLeft, FiEdit } = FiIcons;

const OfferReflectionStep = ({ data, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({ ...data });
  const currentStep = 7;
  const totalSteps = 7;

  const handleContinue = () => {
    onUpdate(editedData);
  };

  const generateReflection = () => {
    // Create a conversational reflection of what we've learned
    return (
      <>
        <p className="mb-4">
          So your offer, <strong>{data.offerName}</strong>, is a {data.offerDescription} designed for people who currently 
          see themselves as {data.clientCurrentIdentity.split('.')[0].toLowerCase()}.
        </p>
        <p className="mb-4">
          Through your work together, they'll transform into someone who {data.clientDesiredIdentity.split('.')[0].toLowerCase()}, 
          overcoming obstacles like {data.commonObstacles.slice(0, 2).join(', ')}{data.commonObstacles.length > 2 ? ', and more' : ''}.
        </p>
        <p>
          Most importantly, they'll achieve what they truly want: {data.mainResults.slice(0, 2).join(', ')}
          {data.mainResults.length > 2 ? ', and other meaningful results' : ''}.
        </p>
      </>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-xl p-8 md:p-12"
    >
      <OnboardingProgress currentStep={currentStep} totalSteps={totalSteps} />
      
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiMessageCircle} className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Here's what I understand about your offer
        </h1>
        <p className="text-lg text-gray-600 leading-relaxed">
          Take a moment to review. Does this sound right? You can edit anything that doesn't feel quite right.
        </p>
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          <div className="bg-blue-50 rounded-2xl p-6 mb-4">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold">W</span>
              </div>
              <div className="text-left text-blue-800">
                {generateReflection()}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <SafeIcon icon={FiEdit} className="w-4 h-4" />
              <span>Something's not quite right</span>
            </button>
          </div>

          <div className="flex space-x-4 pt-6">
            <Link 
              to="/enhanced-onboarding/description"
              className="flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <SafeIcon icon={FiArrowLeft} className="w-5 h-5" />
              <span>Back</span>
            </Link>
            
            <Link 
              to="/enhanced-onboarding/complete"
              onClick={handleContinue}
              className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
            >
              <span>Yes, that's right!</span>
              <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer name
            </label>
            <input
              type="text"
              value={editedData.offerName}
              onChange={(e) => setEditedData({ ...editedData, offerName: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current self-identity
            </label>
            <textarea
              value={editedData.clientCurrentIdentity}
              onChange={(e) => setEditedData({ ...editedData, clientCurrentIdentity: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desired self-identity
            </label>
            <textarea
              value={editedData.clientDesiredIdentity}
              onChange={(e) => setEditedData({ ...editedData, clientDesiredIdentity: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Offer description
            </label>
            <input
              type="text"
              value={editedData.offerDescription}
              onChange={(e) => setEditedData({ ...editedData, offerDescription: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="flex space-x-4 pt-6">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <span>Cancel</span>
            </button>
            
            <button
              onClick={() => {
                onUpdate(editedData);
                setIsEditing(false);
              }}
              className="flex-1 flex items-center justify-center space-x-2 py-4 rounded-xl font-semibold text-lg transition-all bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg hover:shadow-xl"
            >
              <span>Save changes</span>
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> It's really hard to articulate these kinds of things sometimes - 
          especially when it's the first time you're putting it into words. We can always refine this later!
        </p>
      </div>
    </motion.div>
  );
};

export default OfferReflectionStep;