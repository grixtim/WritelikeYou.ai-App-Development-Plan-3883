// Simulated API calls for Willy's AI responses
// In production, these would call the Anthropic API

export const willyAPI = {
  generateSetupReflection: async (setupData) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { offerName, clientCurrentIdentity, clientDesiredIdentity, commonObstacles } = setupData;
    
    // Simulated personalized reflection in Willy's voice
    const reflections = [
      `Alrighty, so it sounds like ${offerName} helps people go from ${clientCurrentIdentity.split('.')[0].toLowerCase()} to ${clientDesiredIdentity.split('.')[0].toLowerCase()}. The main thing keeping your best-fit clients stuck seems to be ${commonObstacles[0]?.toLowerCase() || 'that inner voice that says they\'re not ready yet'}. Am I hitting close here, or should we dig into this a bit more?`,
      
      `Okay, here's what I'm sensing about ${offerName} (and feel free to tell me if I'm way off base here)... It sounds like your people are currently ${clientCurrentIdentity.split('.')[0].toLowerCase()}, but they really want to become ${clientDesiredIdentity.split('.')[0].toLowerCase()}. The thing that's keeping them stuck? ${commonObstacles[0] || 'That perfectionism loop'} - which, by the way, actually makes them PERFECT for what you're offering.`,
      
      `So your ${offerName} is all about helping people transform from ${clientCurrentIdentity.split('.')[0].toLowerCase()} into ${clientDesiredIdentity.split('.')[0].toLowerCase()}. What I find really interesting is that ${commonObstacles[0]?.toLowerCase() || 'the very thing they think disqualifies them'} is actually exactly why they need this. Does that feel right to you?`
    ];
    
    return {
      reflection: reflections[Math.floor(Math.random() * reflections.length)],
      confidence: 0.92
    };
  },
  
  generateContextualMiniLesson: async (emailType, setupData, additionalContext = '') => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const lessons = {
      cart_open: {
        title: "Excitement and Decision-Making",
        content: `Alrighty, since you're writing a cart open email, here's something that'll be really useful to understand about how people make decisions when they're excited (spoiler: it's not what most business owners think)... When your best-fit clients see that ${setupData.offerName} is finally available, their brain immediately starts doing two things at once: feeling excited about the possibility AND looking for reasons why now might not be the right time. This isn't them being difficult - this is just how human brains work when we're faced with something we want but feels important. Your cart open email needs to honor both of these things happening. The excitement part is easy - you're probably already good at sharing your genuine enthusiasm. But here's where it gets interesting... the logical part of their brain needs just enough concrete reasons to feel confident saying yes. Not overwhelming them with benefits, but giving them 2-3 solid, logical reasons why starting now makes sense for someone in their exact situation. Think of it like you're helping them build a case for saying yes that they'll feel confident about later - even when the initial excitement wears off.`
      },
      belief_shifting: {
        title: "Meeting People Where They Are",
        content: `Alrighty, since you're writing a belief shifting email, here's something that'll be really useful to understand about how our brains work (and why arguing with people's beliefs usually backfires spectacularly)... Once someone believes something about themselves - especially something limiting - their brain becomes a detective looking for evidence that proves they're right. So if someone thinks "${setupData.commonObstacles[0] || 'this won\'t work for someone like me'}", they'll unconsciously filter everything through that lens. Here's what's brilliant about belief shifting emails: instead of trying to convince them they're wrong (which triggers their inner defense attorney), we meet them exactly where they are. We say "Of course you're thinking this - that makes total sense given your experience." And THEN we offer them a new, more helpful way to see their situation. The most powerful reframes often take something they see as a limitation and gently show how it's actually exactly why ${setupData.offerName} is perfect for them. It's not about dismissing their concern - it's about helping them see it differently.`
      },
      social_proof: {
        title: "The Real Magic of Social Proof",
        content: `Alrighty, since you're writing a social proof email, let's talk about what social proof actually DOES on a psychological level (because it's way more interesting than just "showing testimonials")... When someone sees relevant social proof, their brain is essentially thinking: "This person has more information than me about this offer, their brain has already done the work of processing this decision, and if I'm like them and it worked out well... it's probably a good idea for me too." But here's where it gets really interesting - the most powerful social proof for ${setupData.offerName} isn't going to be the polished "this program changed my life" testimonials. It's going to be the messy, human, real moments where someone sounds exactly like your best-fit clients feel right now. Like instead of "Sarah increased her revenue by 200%," it's Sarah saying "I mean, I just love helping people, but also I really want to stop feeling guilty every time I talk about my prices, you know?" That rawness and specificity is what makes someone else think "that's exactly how I feel." Context matters too - use your own words before the testimonial to help your reader see themselves in that person's situation.`
      },
      cart_close: {
        title: "Future Pacing and Decision Pressure",
        content: `Alrighty, since you're writing a cart close email, here's what's happening in your best-fit clients' minds right now (and it's probably not what you think)... At this point, they're not just deciding whether ${setupData.offerName} is good - they're imagining two different futures. One where they take action now, and one where they don't. The most influential factor in their decision will be the expected emotions they imagine feeling in each scenario. Your cart close email should help them vividly imagine how they'll feel in both futures - the satisfaction and progress they'll experience if they say yes, and the frustration or regret they might feel if they let this opportunity pass by. But here's the thing - and this is where a lot of business owners get it wrong - this isn't about creating false urgency or pressuring them. It's about helping them connect with what they actually want for themselves and why this matters to them. Some of your cart close emails might be quite short and direct, and that's perfectly fine. The key is that emotional connection to their desired future, not the length or complexity of your message.`
      }
    };
    
    const lesson = lessons[emailType] || lessons.cart_open;
    
    return {
      ...lesson,
      personalizedIntro: `Based on what you've shared about ${setupData.offerName} and your best-fit clients, ${additionalContext ? `plus the fact that ${additionalContext.toLowerCase()}, ` : ''}here's what I think will be most helpful for you to understand about this type of email...`
    };
  },
  
  generateMagicPrompt: async (emailType, setupData, confidenceLevel, additionalContext = '') => {
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const { offerName, clientCurrentIdentity, clientDesiredIdentity, commonObstacles } = setupData;
    
    const promptTemplates = {
      cart_open: [
        {
          type: 'cart_open_excitement',
          title: 'Channel that genuine excitement you\'re feeling',
          content: `Alrighty, here's what I want you to imagine... You're sitting across from someone at a coffee shop who's been following your work for a while. They've been thinking about ${offerName} since you first mentioned it, and now they just found out it's finally available. There's this moment of "oh wow, this is really happening" mixed with "but is now the right time?" Start your email like you're talking to that person. Maybe something like "I've been waiting to share this with you..." and let that genuine enthusiasm you felt when you decided to create ${offerName} guide your words. Remember, they're already interested - that's why they're on your list. Now help them feel that same excitement you felt when you realized you could help people go from ${clientCurrentIdentity.split('.')[0].toLowerCase()} to ${clientDesiredIdentity.split('.')[0].toLowerCase()}.`
        },
        {
          type: 'cart_open_timing',
          title: 'Address the "why now" question directly',
          content: `Your best-fit clients are probably thinking "${offerName} sounds amazing, but why should I say yes right now?" And honestly, that's a really smart question for them to be asking. Write an email that starts with something like "You might be wondering if now is the right time..." and then share 2-3 gentle, logical reasons why someone who currently ${clientCurrentIdentity.split('.')[0].toLowerCase()} would benefit from starting now rather than waiting. Think about what's actually true for your ideal clients' current situation - not generic urgency, but real reasons why waiting might keep them stuck in exactly the place they don't want to be.`
        }
      ],
      belief_shifting: [
        {
          type: 'belief_normalize_reframe',
          title: 'Normalize first, then lovingly reframe',
          content: `Your best-fit clients are thinking: "${commonObstacles[0] || 'this might not work for someone like me'}." And honestly? That makes total sense given their experience. Start your email with something like "I know some of you might be thinking..." and acknowledge this concern with genuine understanding. Don't rush to fix it - really let them feel seen first. Then share a story (yours or a client's) that gently shows how this very concern actually makes them PERFECT for ${offerName}. The goal isn't to dismiss their worry - it's to help them see it as evidence that they're exactly the right person for this, not the wrong person.`
        }
      ],
      social_proof: [
        {
          type: 'social_proof_human_moments',
          title: 'Share the real, messy human moments',
          content: `Think about a client result or message you've gotten that shows the very human, real side of transformation with ${offerName}. Not the polished "this program was amazing" testimonial, but the one where someone sounds exactly like your best-fit clients feel right now. Start your email with something like "I got a message yesterday that I had to share with you..." and let their authentic voice tell the story. Maybe they said something about how they used to ${clientCurrentIdentity.split('.')[0].toLowerCase()} but now they ${clientDesiredIdentity.split('.')[0].toLowerCase()}. Focus on the feelings and realizations, not just the tactics or outcomes.`
        }
      ],
      cart_close: [
        {
          type: 'cart_close_future_self',
          title: 'Help them connect with their future self',
          content: `It's the final day for ${offerName}. Your best-fit clients need to imagine how they'll feel in 3-6 months if they say yes now versus if they wait. Write an email that starts with something like "A year from now, you'll be grateful you..." and help them really feel into both scenarios. What would it feel like to still be ${clientCurrentIdentity.split('.')[0].toLowerCase()} six months from now? What would it feel like to be ${clientDesiredIdentity.split('.')[0].toLowerCase()} instead? Keep it grounded in reality and focused on what they actually want for themselves. What would their future self want them to decide today?`
        }
      ]
    };
    
    const prompts = promptTemplates[emailType] || promptTemplates.cart_open;
    const selectedPrompt = prompts[Math.floor(Math.random() * prompts.length)];
    
    return {
      ...selectedPrompt,
      inspirationLevel: Math.floor(Math.random() * 3) + 8 // 8-10 scale for high inspiration
    };
  },

  generateCopyFeedback: async (emailContent, emailType) => {
    // Simulate API delay for feedback generation
    await new Promise(resolve => setTimeout(resolve, 2800));
    
    // This would call Anthropic Claude with specialized WriteLikeYou instructions
    // For now, we'll simulate responses based on email type
    
    const feedbackTemplates = {
      cart_open: {
        strengths: [
          {
            example: "Your opening line 'I've been waiting to share this with you' creates immediate connection",
            reasoning: "It establishes a personal relationship and builds anticipation right from the start"
          },
          {
            example: "You've clearly explained the transformation your offer provides",
            reasoning: "This helps readers see themselves in both the before and after states, making the benefits tangible"
          }
        ],
        suggestions: [
          {
            suggestion: "Consider adding 1-2 specific logical reasons why now is the right time",
            reasoning: "This helps address the 'why now?' question that's likely in your reader's mind when making a decision"
          }
        ],
        overallImpression: "Your authentic excitement really comes through in this email! You've created something that feels genuine and warm, not salesy. That personal touch is exactly what helps readers connect with you."
      },
      belief_shifting: {
        strengths: [
          {
            example: "The way you normalized their concern with 'I know many of you are thinking...'",
            reasoning: "This shows empathy and makes the reader feel seen and understood, not judged"
          },
          {
            example: "Your personal story about overcoming a similar challenge",
            reasoning: "Sharing your vulnerability builds trust and shows that you understand their situation firsthand"
          }
        ],
        suggestions: [
          {
            suggestion: "You might want to strengthen the reframe by connecting it directly to their desired outcome",
            reasoning: "This helps them see how their perceived limitation is actually a strength that will help them get what they want"
          }
        ],
        overallImpression: "You've created a really compassionate email that meets people exactly where they are. Your empathy shines through, which is so important for helping people shift limiting beliefs."
      },
      social_proof: {
        strengths: [
          {
            example: "Using a real client's exact words about their hesitation before joining",
            reasoning: "This raw, unpolished testimonial feels authentic and helps readers see themselves in the story"
          },
          {
            example: "The way you introduced the testimonial with context about who this person is",
            reasoning: "This helps your readers connect with the person in the story and see the relevance to their own situation"
          }
        ],
        suggestions: [
          {
            suggestion: "Consider highlighting one specific emotional transformation moment from the testimonial",
            reasoning: "Emotional moments often resonate more deeply than results or outcomes alone"
          }
        ],
        overallImpression: "Your email does a beautiful job of letting real client experiences shine through. You've avoided the trap of overly polished testimonials and instead shared something that feels genuine and relatable."
      },
      cart_close: {
        strengths: [
          {
            example: "The way you painted two different future scenarios",
            reasoning: "This helps readers emotionally connect with both possibilities, making their choice more clear"
          },
          {
            example: "Your gentle reminder about the deadline without using pressure tactics",
            reasoning: "This creates urgency without manipulation, respecting your readers' agency in making decisions"
          }
        ],
        suggestions: [
          {
            suggestion: "Consider adding a brief recap of the most important benefit of your offer",
            reasoning: "This reminds them of the core value as they make their final decision"
          }
        ],
        overallImpression: "You've written a cart close email that feels supportive rather than pushy - that's quite an achievement! Your focus on helping readers make the right decision for themselves creates trust and respect."
      },
      default: {
        strengths: [
          {
            example: "Your conversational tone throughout the email",
            reasoning: "It feels like you're talking directly to one person, which creates connection and engagement"
          },
          {
            example: "The personal details you've shared about your own experience",
            reasoning: "This vulnerability builds trust and helps readers relate to you as a real person"
          }
        ],
        suggestions: [
          {
            suggestion: "Consider adding a clear next step or call-to-action at the end",
            reasoning: "This gives readers direction on what to do with the information you've shared"
          }
        ],
        overallImpression: "Your authentic voice really comes through in this email. You've written something that feels genuine and personal, which is exactly what helps readers connect with you."
      }
    };
    
    // Select feedback based on email type or use default
    return feedbackTemplates[emailType] || feedbackTemplates.default;
  }
};