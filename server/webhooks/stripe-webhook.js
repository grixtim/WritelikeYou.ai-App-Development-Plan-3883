import express from 'express';
import stripe from '../config/stripe.js';
import User from '../models/User.js';
import { 
  sendPaymentFailedEmail, 
  sendSubscriptionRenewalEmail,
  sendPaymentActionRequiredEmail // Add this import
} from '../services/emailService.js';

const router = express.Router();

// Rest of the file remains the same...