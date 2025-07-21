import React from 'react';
import { motion } from 'framer-motion';

const OnboardingProgress = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
        <span className="text-sm font-medium text-blue-600">
          {Math.round(progress)}% complete
        </span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>
      
      {/* Celebration messages as user progresses */}
      {progress > 0 && progress < 30 && (
        <p className="text-xs text-gray-500 mt-1">Great start! You're on your way.</p>
      )}
      {progress >= 30 && progress < 60 && (
        <p className="text-xs text-gray-500 mt-1">You're making excellent progress!</p>
      )}
      {progress >= 60 && progress < 90 && (
        <p className="text-xs text-gray-500 mt-1">Almost there! Just a few more steps.</p>
      )}
      {progress >= 90 && progress < 100 && (
        <p className="text-xs text-gray-500 mt-1">So close to the finish line!</p>
      )}
      {progress === 100 && (
        <p className="text-xs text-blue-600 font-medium mt-1">All done! 🎉</p>
      )}
    </div>
  );
};

export default OnboardingProgress;