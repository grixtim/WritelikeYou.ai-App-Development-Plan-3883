import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBookOpen, FiArrowRight, FiMessageCircle } = FiIcons;

const MiniLessonDelivery = ({ emailType, objectionBelief, onLessonComplete }) => {
  const [showClarificationInput, setShowClarificationInput] = useState(false);
  const [clarificationQuestion, setClarificationQuestion] = useState('');

  const lessons = {
    cart_open: {
      title: "Excitement and Decision-Making",
      content: (
        <div className="space-y-4">
          <p>
            Alrighty, since you're writing a cart open email, here's a psychological principle that'll be really useful to keep in mind...
          </p>
          <p>
            When people are in that exciting moment of opportunity, they make decisions based on a combination of <strong>desire and justification</strong>. Your best-fit clients are already excited about what you offer - that's why they're on your list. But excitement alone isn't enough to help them decide. They need to feel like this decision makes sense for where they are right now.
          </p>
          <p>
            So your cart open email needs to honor both the excitement ('this is finally here!') and give them the logical reasons why now is the right time ('this is exactly what I need'). Think of it like you're helping them build a case for saying yes that they'll feel confident about later.
          </p>
        </div>
      ),
      icon: FiBookOpen,
      color: 'from-blue-500 to-blue-600'
    },
    objection_addressing: {
      title: "Confirmation Bias, Normalizing, and Reframing",
      content: (
        <div className="space-y-4">
          <p>
            Alrighty, since you're writing an objection addressing email, here's what's happening psychologically that'll be really useful to understand...
          </p>
          <p>
            Once people form a belief about something - especially a limiting belief - <strong>confirmation bias</strong> kicks in. This means they'll unconsciously look for evidence that proves their belief is true and dismiss evidence that contradicts it. So if someone thinks 'this won't work for me because I'm too [busy/new/overwhelmed],' they're actively filtering reality through that lens.
          </p>
          <p>
            Your job isn't to argue with their belief - that usually backfires. Instead, you want to <strong>normalize their concern first</strong> ('of course you're wondering about this'), then offer a gentle reframe that gives them a new, more helpful way to see their situation. The most powerful reframes often take something they see as a limitation and show how it's actually an advantage or exactly why this solution is perfect for them.
          </p>
          {objectionBelief && (
            <div className="bg-orange-50 rounded-xl p-4 mt-4">
              <p className="text-orange-900 font-medium mb-2">For the belief you want to shift:</p>
              <p className="text-orange-800 italic">"{objectionBelief}"</p>
              <p className="text-orange-700 text-sm mt-2">
                Remember: normalize first, then gently reframe. Don't argue - redirect.
              </p>
            </div>
          )}
        </div>
      ),
      icon: FiBookOpen,
      color: 'from-orange-500 to-red-500'
    },
    social_proof: {
      title: "Social Proof, Message Underneath Words, Context and Relevance",
      content: (
        <div className="space-y-4">
          <p>
            Alrighty, since you're writing a social proof email, let's talk about what social proof actually DOES on a psychological level...
          </p>
          <p>
            Social proof is about showing that others have trusted you and your offer and gotten value. When used well, social proof helps your best-fit clients feel safe to trust you, able to decide, and excited to take action - thanks to the way it works with our brains' love of shortcuts.
          </p>
          <p>
            Here's what's unconsciously happening when someone sees relevant, context-rich social proof: 'This person must have more information than me about this offer,' 'This person's brain has already done the work of processing this info and made a good decision,' and 'If I'm like this person, and they've made this decision and it worked out well... it's a good idea for me to go for this too.'
          </p>
          <p>
            But here's the key: the most powerful social proof isn't just 'this program was great.' It's when you can capture the real human experience - like someone saying (in relation to an offer that helps parents support their little one to sleep better) <em>'I mean, I just love her so much, but also I really want to sleep again or just have a morning to myself, you know.'</em> That rawness and specificity is what makes someone else think 'that's exactly how I feel.'
          </p>
          <p>
            Another important thing to know: <strong>context matters</strong>. So use your own words before the testimonial to connect the copy you've written to the testimonial you're about to share. That provides the context that helps your reader see themselves in that person's situation.
          </p>
        </div>
      ),
      icon: FiBookOpen,
      color: 'from-green-500 to-green-600'
    },
    cart_close: {
      title: "Future Pacing + Expected Emotions",
      content: (
        <div className="space-y-4">
          <p>
            Alrighty, since you're writing a cart close email (any email in those final 24 hours), here's what's happening in your best-fit clients' minds right now...
          </p>
          <p>
            At this point, they're not just deciding whether your offer is good - they're <strong>imagining two different futures</strong>. One where they take action now, and one where they don't. The most influential factor in their decision will be the expected emotions they imagine feeling in each scenario.
          </p>
          <p>
            Your cart close email should help them vividly imagine how they'll feel in both futures - the satisfaction and progress they'll experience if they say yes, and the frustration or regret they might feel if they let this opportunity pass. But keep it honest and grounded in reality. You're not trying to create false urgency - you're helping them connect with what they actually want for themselves and why this matters to them.
          </p>
          <p>
            Remember, some of your cart close emails might be quite short and direct - that's perfectly fine. The key is that <strong>emotional connection to their desired future</strong>.
          </p>
        </div>
      ),
      icon: FiBookOpen,
      color: 'from-purple-500 to-purple-600'
    }
  };

  const currentLesson = lessons[emailType];

  const handleContinue = () => {
    onLessonComplete();
  };

  const handleQuestionSubmit = () => {
    // In a real app, this would send the question to Willy's response system
    alert(`Great question! Willy would respond to: "${clarificationQuestion}"`);
    setClarificationQuestion('');
    setShowClarificationInput(false);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12">
      <div className="text-center mb-8">
        <div className={`w-16 h-16 bg-gradient-to-br ${currentLesson.color} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <SafeIcon icon={currentLesson.icon} className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Mini-lesson: {currentLesson.title}
        </h2>
        <p className="text-lg text-gray-600">
          Understanding the psychology behind this email type
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-blue-50 rounded-2xl p-6 mb-8"
      >
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-semibold">W</span>
          </div>
          <div className="text-left text-blue-800 leading-relaxed">
            {currentLesson.content}
          </div>
        </div>
      </motion.div>

      {/* Clarification Question Section */}
      <div className="mb-8">
        {!showClarificationInput ? (
          <div className="text-center">
            <button
              onClick={() => setShowClarificationInput(true)}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all mx-auto"
            >
              <SafeIcon icon={FiMessageCircle} className="w-4 h-4" />
              <span>Ask Willy a clarifying question</span>
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-gray-50 rounded-2xl p-6"
          >
            <label className="block text-sm font-medium text-gray-700 mb-3">
              What would you like me to clarify about this email type?
            </label>
            <div className="flex space-x-3">
              <input
                type="text"
                value={clarificationQuestion}
                onChange={(e) => setClarificationQuestion(e.target.value)}
                placeholder="e.g., How do I normalize without agreeing with their limiting belief?"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
              <button
                onClick={handleQuestionSubmit}
                disabled={!clarificationQuestion.trim()}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 transition-all"
              >
                Ask
              </button>
            </div>
            <button
              onClick={() => setShowClarificationInput(false)}
              className="text-sm text-gray-500 hover:text-gray-700 mt-2"
            >
              Never mind
            </button>
          </motion.div>
        )}
      </div>

      {/* Check-in and Continue */}
      <div className="text-center space-y-6">
        <div className="bg-blue-50 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold">W</span>
            </div>
            <div className="text-left">
              <p className="text-blue-800 leading-relaxed">
                How does that sound? Make sense? Ready to get your personalized magic prompt for this email?
              </p>
            </div>
          </div>
        </div>

        <motion.button
          onClick={handleContinue}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-8 py-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center space-x-2 mx-auto"
        >
          <span>Yes, let's get my magic prompt!</span>
          <SafeIcon icon={FiArrowRight} className="w-5 h-5" />
        </motion.button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700 text-center">
          💡 <strong>Willy's tip:</strong> Keep this lesson in mind as you write. The psychology behind 
          your email type will guide you toward more authentic and effective messaging.
        </p>
      </div>
    </div>
  );
};

export default MiniLessonDelivery;