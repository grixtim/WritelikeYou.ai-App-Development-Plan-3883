import express from 'express';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Sign up router
router.post('/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('registrationSource').optional().isIn(['direct', 'referral', 'social', 'waitlist']),
  body('betaCode').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, registrationSource = 'direct', betaCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Generate cohort information
    const cohortInfo = User.generateCohortInfo();

    // Create new user
    const user = new User({
      email,
      password,
      registrationSource,
      ...cohortInfo,
      subscriptionStatus: 'none'
    });

    // Verify beta code if provided
    if (betaCode) {
      const betaVerification = await User.verifyBetaCode(betaCode);
      if (betaVerification.isValid) {
        user.betaAccessCode = betaCode;
        user.betaExpiresAt = betaVerification.expiresAt;
        user.subscriptionStatus = 'beta_access';
      } else {
        return res.status(400).json({ error: 'Invalid beta access code' });
      }
    }

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userData = {
      id: user._id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      betaExpiresAt: user.betaExpiresAt,
      cohortWeek: user.cohortWeek,
      cohortMonth: user.cohortMonth,
      registrationSource: user.registrationSource,
      createdAt: user.createdAt
    };

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Server error during signup' });
  }
});

// Sign in router
router.post('/signin', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userData = {
      id: user._id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      betaExpiresAt: user.betaExpiresAt,
      cohortWeek: user.cohortWeek,
      cohortMonth: user.cohortMonth,
      registrationSource: user.registrationSource,
      createdAt: user.createdAt
    };

    res.json({
      message: 'Login successful',
      token,
      user: userData
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Server error during signin' });
  }
});

// Get current user profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userData = {
      id: req.user._id,
      email: req.user.email,
      subscriptionStatus: req.user.subscriptionStatus,
      betaExpiresAt: req.user.betaExpiresAt,
      cohortWeek: req.user.cohortWeek,
      cohortMonth: req.user.cohortMonth,
      registrationSource: req.user.registrationSource,
      stripeCustomerId: req.user.stripeCustomerId,
      stripeSubscriptionId: req.user.stripeSubscriptionId,
      stripeCurrentPeriodEnd: req.user.stripeCurrentPeriodEnd,
      paymentMethod: req.user.paymentMethod,
      paymentMethodDetails: req.user.paymentMethodDetails,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt,
      subscriptionMessage: req.user.getSubscriptionMessage(),
      hasAccess: req.user.checkSubscriptionAccess()
    };

    res.json({ user: userData });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Server error fetching profile' });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('subscriptionStatus').optional().isIn(['beta_access', 'trial', 'active', 'past_due', 'canceled', 'unpaid', 'none']),
  body('stripeCustomerId').optional().isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const allowedUpdates = ['subscriptionStatus', 'stripeCustomerId'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    const userData = {
      id: user._id,
      email: user.email,
      subscriptionStatus: user.subscriptionStatus,
      betaExpiresAt: user.betaExpiresAt,
      cohortWeek: user.cohortWeek,
      cohortMonth: user.cohortMonth,
      registrationSource: user.registrationSource,
      stripeCustomerId: user.stripeCustomerId,
      stripeSubscriptionId: user.stripeSubscriptionId,
      stripeCurrentPeriodEnd: user.stripeCurrentPeriodEnd,
      paymentMethod: user.paymentMethod,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      message: 'Profile updated successfully',
      user: userData
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Server error updating profile' });
  }
});

// Check subscription access
router.get('/subscription-status', authenticateToken, async (req, res) => {
  try {
    const hasAccess = req.user.checkSubscriptionAccess();
    const message = req.user.getSubscriptionMessage();

    res.json({
      hasAccess,
      subscriptionStatus: req.user.subscriptionStatus,
      message,
      betaExpiresAt: req.user.betaExpiresAt,
      stripeCurrentPeriodEnd: req.user.stripeCurrentPeriodEnd
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ error: 'Server error checking subscription' });
  }
});

// Verify beta code
router.post('/verify-beta-code', [
  body('betaCode').isString()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { betaCode } = req.body;
    const betaVerification = await User.verifyBetaCode(betaCode);
    
    if (betaVerification.isValid) {
      return res.json({ 
        valid: true, 
        expiresAt: betaVerification.expiresAt 
      });
    } else {
      return res.status(400).json({ 
        valid: false, 
        error: 'Invalid beta code' 
      });
    }
  } catch (error) {
    console.error('Beta code verification error:', error);
    res.status(500).json({ error: 'Server error verifying beta code' });
  }
});

export default router;