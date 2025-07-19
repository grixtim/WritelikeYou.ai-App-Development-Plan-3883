import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    res.status(500).json({ error: 'Server error' });
  }
};

export const requireSubscription = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.checkSubscriptionAccess()) {
    return res.status(403).json({
      error: 'Subscription required',
      subscriptionStatus: req.user.subscriptionStatus,
      message: req.user.getSubscriptionMessage()
    });
  }

  next();
};

// Additional middleware for grace period access
export const allowGracePeriodAccess = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  // Check if user is in beta grace period
  const isInGracePeriod = () => {
    if (req.user.subscriptionStatus !== 'beta_access') return false;
    
    const betaEndDate = new Date(req.user.betaExpiresAt);
    const now = new Date();
    const gracePeriodEnd = new Date(betaEndDate);
    gracePeriodEnd.setDate(gracePeriodEnd.getDate() + 7); // 7-day grace period
    
    // If within grace period
    return now > betaEndDate && now < gracePeriodEnd;
  };

  // Allow access during grace period with limited functionality
  if (isInGracePeriod()) {
    req.user.inGracePeriod = true;
    return next();
  }

  if (!req.user.checkSubscriptionAccess()) {
    return res.status(403).json({
      error: 'Subscription required',
      subscriptionStatus: req.user.subscriptionStatus,
      message: req.user.getSubscriptionMessage()
    });
  }

  next();
};