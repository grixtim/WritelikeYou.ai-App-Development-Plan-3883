import React, { useState } from 'react';
import { FeedbackWorkflow } from '@questlabs/react-sdk';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMessageCircle } = FiIcons;

const questConfig = {
  QUEST_FEEDBACK_QUESTID: 'c-greta-feedback-workflow',
  USER_ID: 'u-3f040bd8-0ea9-4f19-80ca-26c467e5b273',
  PRIMARY_COLOR: '#3b82f6'
};

const FeedbackButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Feedback Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="flex gap-1 rounded-t-md rounded-b-none justify-end items-center px-3 text-14 leading-5 font-semibold py-2 text-white z-50 fixed top-[calc(50%-20px)] -right-10 rotate-[270deg] transition-all h-9"
        style={{ background: questConfig.PRIMARY_COLOR }}
      >
        <div className="w-fit h-fit rotate-90 transition-all duration-300">
          <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
        </div>
        <p className="text-white text-sm font-medium leading-none">Feedback</p>
      </button>

      {/* Feedback Workflow Component */}
      {isOpen && (
        <FeedbackWorkflow
          uniqueUserId={questConfig.USER_ID}
          questId={questConfig.QUEST_FEEDBACK_QUESTID}
          isOpen={isOpen}
          accent={questConfig.PRIMARY_COLOR}
          onClose={() => setIsOpen(false)}
        >
          <FeedbackWorkflow.ThankYou />
        </FeedbackWorkflow>
      )}
    </>
  );
};

export default FeedbackButton;