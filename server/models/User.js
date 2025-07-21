import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  subscriptionStatus: {
    type: String,
    enum: ['beta_access', 'trial', 'active', 'past_due', 'canceled', 'unpaid', 'none'],
    default: 'none'
  },
  // Beta access tracking
  betaAccessCode: {
    type: String,
    default: null
  },
  betaExpiresAt: {
    type: Date,
    default: null
  },
  cohortWeek: {
    type: String,
    required: true
  },
  cohortMonth: {
    type: String,
    required: true
  },
  registrationSource: {
    type: String,
    enum: ['direct', 'referral', 'social', 'waitlist'],
    default: 'direct'
  },
  // Stripe fields
  stripeCustomerId: {
    type: String,
    default: null
  },
  stripeSubscriptionId: {
    type: String,
    default: null
  },
  stripePriceId: {
    type: String,
    default: null
  },
  stripeCurrentPeriodEnd: {
    type: Date,
    default: null
  },
  paymentMethod: {
    type: String,
    default: null
  },
  paymentMethodDetails: {
    brand: String,
    last4: String,
    expMonth: Number,
    expYear: Number
  },
  billingDetails: {
    name: String,
    email: String,
    phone: String,
    address: {
      line1: String,
      line2: String,
      city: String,
      state: String,
      postal_code: String,
      country: String
    }
  },
  // Subscription tracking
  subscriptionHistory: [{
    status: String,
    priceId: String,
    startDate: Date,
    endDate: Date,
    cancelAtPeriodEnd: Boolean
  }]
}, {
  timestamps: true
});

// Hash password before saving user
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Check subscription access method
userSchema.methods.checkSubscriptionAccess = function() {
  const now = new Date();
  
  switch (this.subscriptionStatus) {
    case 'beta_access':
      return this.betaExpiresAt ? now <= this.betaExpiresAt : false;
    case 'trial':
    case 'active':
      return true;
    case 'past_due':
      // Give grace period for past_due status
      return this.stripeCurrentPeriodEnd ? now <= new Date(this.stripeCurrentPeriodEnd.getTime() + 7 * 24 * 60 * 60 * 1000) : false;
    case 'canceled':
    case 'unpaid':
    case 'none':
    default:
      return false;
  }
};

// Get subscription message method
userSchema.methods.getSubscriptionMessage = function() {
  const now = new Date();
  
  switch (this.subscriptionStatus) {
    case 'beta_access': 
      if (!this.betaExpiresAt) return { type: 'warning', message: 'Beta access status without expiration date' };
      
      const daysUntilExpiry = Math.ceil((this.betaExpiresAt - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry > 30) {
        return { type: 'info', message: `Beta access valid until ${this.betaExpiresAt.toLocaleDateString()}` };
      } else if (daysUntilExpiry > 0) {
        return { type: 'warning', message: `Beta access expires in ${daysUntilExpiry} days` };
      } else {
        return { type: 'error', message: 'Beta access has expired' };
      }
    
    case 'trial': 
      return { type: 'info', message: 'You are on a trial subscription' };
    
    case 'active':
      // Calculate days until renewal
      if (this.stripeCurrentPeriodEnd) {
        const daysUntilRenewal = Math.ceil((this.stripeCurrentPeriodEnd - now) / (1000 * 60 * 60 * 24));
        return { 
          type: 'success', 
          message: `Active subscription, renews in ${daysUntilRenewal} days`
        };
      }
      return { type: 'success', message: 'Active subscription' };
    
    case 'past_due':
      return { type: 'warning', message: 'Payment past due. Please update your payment method.' };
    
    case 'canceled':
      if (this.stripeCurrentPeriodEnd && now <= this.stripeCurrentPeriodEnd) {
        const daysRemaining = Math.ceil((this.stripeCurrentPeriodEnd - now) / (1000 * 60 * 60 * 24));
        return { 
          type: 'warning', 
          message: `Your subscription has been canceled but you have access until ${this.stripeCurrentPeriodEnd.toLocaleDateString()} (${daysRemaining} days remaining)` 
        };
      }
      return { type: 'error', message: 'Your subscription has been canceled' };
    
    case 'unpaid':
      return { type: 'error', message: 'Your subscription is inactive due to payment failure' };
    
    case 'none':
    default:
      return { type: 'error', message: 'No active subscription' };
  }
};

// Verify beta access code
userSchema.statics.verifyBetaCode = async function(code) {
  // List of valid beta codes with their expiration dates (optional)
  const validBetaCodes = {
    'LEB BETA': new Date('2025-12-09'),
    'BETA2023': new Date('2024-12-31'),
    // Add more codes as needed
  };
  
  if (validBetaCodes[code]) {
    return {
      isValid: true,
      expiresAt: validBetaCodes[code]
    };
  }
  
  return { isValid: false };
};

// Helper method to generate cohort info
userSchema.statics.generateCohortInfo = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  // Calculate ISO week number
  const d = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNumber = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

  return {
    cohortWeek: `${year}-W${String(weekNumber).padStart(2, '0')}`,
    cohortMonth: `${year}-${month}`
  };
};

// Update subscription status based on Stripe event
userSchema.methods.updateSubscriptionFromStripe = function(stripeData) {
  // Update subscription status
  this.stripeSubscriptionId = stripeData.subscriptionId;
  this.stripePriceId = stripeData.priceId;
  this.stripeCurrentPeriodEnd = new Date(stripeData.currentPeriodEnd * 1000);
  this.subscriptionStatus = stripeData.status;
  
  // Add to subscription history
  this.subscriptionHistory.push({
    status: stripeData.status,
    priceId: stripeData.priceId,
    startDate: new Date(stripeData.currentPeriodStart * 1000),
    endDate: new Date(stripeData.currentPeriodEnd * 1000),
    cancelAtPeriodEnd: stripeData.cancelAtPeriodEnd || false
  });
  
  return this.save();
};

export default mongoose.model('User', userSchema);