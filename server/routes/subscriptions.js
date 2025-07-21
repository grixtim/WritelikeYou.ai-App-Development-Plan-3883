import express from 'express';
import { body, validationResult } from 'express-validator';
import stripe, { PRODUCTS } from '../config/stripe.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a subscription
router.post('/create', [
  body('priceId').isString(),
  body('paymentMethodId').isString(),
  body('billingDetails').optional().isObject(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { priceId, paymentMethodId, billingDetails } = req.body;
    const user = req.user;
    
    // Validate price ID
    if (priceId !== PRODUCTS.MONTHLY.PRICE_ID && priceId !== PRODUCTS.ANNUAL.PRICE_ID) {
      return res.status(400).json({ error: 'Invalid price ID' });
    }

    try {
      // If user doesn't have a Stripe customer ID, create one
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: billingDetails?.name || user.email.split('@')[0],
          payment_method: paymentMethodId,
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
          metadata: {
            userId: user._id.toString(),
          },
        });
        
        customerId = customer.id;
        
        // Update user with Stripe customer ID
        user.stripeCustomerId = customerId;
        await user.save();
      } else {
        // If customer exists, attach the payment method
        await stripe.paymentMethods.attach(paymentMethodId, {
          customer: customerId,
        });
        
        // Set as default payment method
        await stripe.customers.update(customerId, {
          invoice_settings: {
            default_payment_method: paymentMethodId,
          },
        });
      }
      
      // Create the subscription
      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{ price: priceId }],
        payment_behavior: 'default_incomplete',
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        expand: ['latest_invoice.payment_intent'],
      });
      
      // Get payment method details
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      // Update user with subscription details
      user.stripeSubscriptionId = subscription.id;
      user.stripePriceId = priceId;
      user.subscriptionStatus = subscription.status;
      user.stripeCurrentPeriodEnd = new Date(subscription.current_period_end * 1000);
      user.paymentMethod = paymentMethodId;
      user.paymentMethodDetails = {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      };
      
      if (billingDetails) {
        user.billingDetails = billingDetails;
      }
      
      // Add to subscription history
      user.subscriptionHistory.push({
        status: subscription.status,
        priceId: priceId,
        startDate: new Date(subscription.current_period_start * 1000),
        endDate: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      });
      
      await user.save();
      
      // Return client secret for payment confirmation
      return res.json({
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status,
      });
    } catch (error) {
      console.error('Subscription creation error:', error);
      return res.status(400).json({
        error: error.message || 'Error creating subscription',
      });
    }
  } catch (error) {
    console.error('Server error in subscription creation:', error);
    res.status(500).json({ error: 'Server error processing subscription' });
  }
});

// Update payment method
router.post('/update-payment-method', [
  body('paymentMethodId').isString(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentMethodId } = req.body;
    const user = req.user;
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No customer ID found' });
    }
    
    try {
      // Attach new payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: user.stripeCustomerId,
      });
      
      // Set as default payment method
      await stripe.customers.update(user.stripeCustomerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      
      // Get payment method details
      const paymentMethod = await stripe.paymentMethods.retrieve(paymentMethodId);
      
      // Update user record
      user.paymentMethod = paymentMethodId;
      user.paymentMethodDetails = {
        brand: paymentMethod.card.brand,
        last4: paymentMethod.card.last4,
        expMonth: paymentMethod.card.exp_month,
        expYear: paymentMethod.card.exp_year,
      };
      
      await user.save();
      
      return res.json({
        success: true,
        paymentMethod: {
          id: paymentMethodId,
          brand: paymentMethod.card.brand,
          last4: paymentMethod.card.last4,
          expMonth: paymentMethod.card.exp_month,
          expYear: paymentMethod.card.exp_year,
        },
      });
    } catch (error) {
      console.error('Payment method update error:', error);
      return res.status(400).json({
        error: error.message || 'Error updating payment method',
      });
    }
  } catch (error) {
    console.error('Server error in payment method update:', error);
    res.status(500).json({ error: 'Server error updating payment method' });
  }
});

// Cancel subscription
router.post('/cancel', async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ error: 'No active subscription found' });
    }
    
    try {
      // Cancel at period end
      const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
        cancel_at_period_end: true,
      });
      
      // Update user record
      user.subscriptionStatus = 'canceled';
      
      // Update subscription history
      const historyEntry = user.subscriptionHistory.find(
        entry => entry.status !== 'canceled' && entry.priceId === user.stripePriceId
      );
      
      if (historyEntry) {
        historyEntry.status = 'canceled';
        historyEntry.cancelAtPeriodEnd = true;
      }
      
      await user.save();
      
      return res.json({
        success: true,
        status: 'canceled',
        cancelAtPeriodEnd: true,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      });
    } catch (error) {
      console.error('Subscription cancellation error:', error);
      return res.status(400).json({
        error: error.message || 'Error canceling subscription',
      });
    }
  } catch (error) {
    console.error('Server error in subscription cancellation:', error);
    res.status(500).json({ error: 'Server error canceling subscription' });
  }
});

// Redirect to Stripe billing portal
router.get('/billing-portal', async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripeCustomerId) {
      return res.status(400).json({ error: 'No customer ID found' });
    }
    
    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${process.env.FRONTEND_URL}/account/billing`,
      });
      
      return res.json({ url: session.url });
    } catch (error) {
      console.error('Billing portal error:', error);
      return res.status(400).json({
        error: error.message || 'Error creating billing portal session',
      });
    }
  } catch (error) {
    console.error('Server error in billing portal redirect:', error);
    res.status(500).json({ error: 'Server error creating billing portal session' });
  }
});

// Get subscription details
router.get('/details', async (req, res) => {
  try {
    const user = req.user;
    
    if (!user.stripeSubscriptionId) {
      return res.json({ 
        active: false,
        status: user.subscriptionStatus,
        message: user.getSubscriptionMessage()
      });
    }
    
    try {
      // Get latest subscription data from Stripe
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      
      // Format subscription data for response
      const subscriptionData = {
        active: subscription.status === 'active',
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        priceId: user.stripePriceId,
        interval: subscription.items.data[0].plan.interval,
        amount: subscription.items.data[0].plan.amount / 100,
        currency: subscription.items.data[0].plan.currency,
        paymentMethod: user.paymentMethodDetails ? {
          brand: user.paymentMethodDetails.brand,
          last4: user.paymentMethodDetails.last4,
          expMonth: user.paymentMethodDetails.expMonth,
          expYear: user.paymentMethodDetails.expYear,
        } : null,
        message: user.getSubscriptionMessage()
      };
      
      return res.json(subscriptionData);
    } catch (error) {
      console.error('Subscription details error:', error);
      
      // If Stripe couldn't find the subscription, it might be deleted
      if (error.code === 'resource_missing') {
        // Reset user's subscription data
        user.subscriptionStatus = 'none';
        user.stripeSubscriptionId = null;
        await user.save();
        
        return res.json({ 
          active: false,
          status: 'none',
          message: user.getSubscriptionMessage()
        });
      }
      
      return res.status(400).json({
        error: error.message || 'Error retrieving subscription details',
      });
    }
  } catch (error) {
    console.error('Server error in subscription details:', error);
    res.status(500).json({ error: 'Server error retrieving subscription details' });
  }
});

export default router;