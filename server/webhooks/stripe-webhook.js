import express from 'express';
import stripe from '../config/stripe.js';
import User from '../models/User.js';
import { 
  sendPaymentFailedEmail, 
  sendSubscriptionRenewalEmail,
  sendPaymentActionRequiredEmail 
} from '../services/emailService.js';

const router = express.Router();

// Configure webhook endpoint to receive events from Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle specific events
  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object);
        break;
        
      case 'invoice.payment_action_required':
        await handlePaymentActionRequired(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`Error handling Stripe webhook: ${err.message}`);
    res.status(500).send(`Webhook processing error: ${err.message}`);
  }
});

// Handle subscription created or updated
async function handleSubscriptionChange(subscription) {
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  
  if (!user) {
    console.log(`No user found for customer: ${subscription.customer}`);
    return;
  }
  
  let status;
  
  switch (subscription.status) {
    case 'active':
    case 'trialing':
      status = 'active';
      break;
    case 'incomplete':
    case 'incomplete_expired':
    case 'unpaid':
      status = 'unpaid';
      break;
    case 'past_due':
      status = 'past_due';
      break;
    case 'canceled':
      status = 'canceled';
      break;
    default:
      status = 'none';
  }
  
  const stripeData = {
    subscriptionId: subscription.id,
    priceId: subscription.items.data[0].price.id,
    status: status,
    currentPeriodStart: subscription.current_period_start,
    currentPeriodEnd: subscription.current_period_end,
    cancelAtPeriodEnd: subscription.cancel_at_period_end
  };
  
  await user.updateSubscriptionFromStripe(stripeData);
  
  console.log(`Updated subscription for user ${user.email} to status: ${status}`);
}

// Handle subscription canceled
async function handleSubscriptionCanceled(subscription) {
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  
  if (!user) {
    console.log(`No user found for customer: ${subscription.customer}`);
    return;
  }
  
  if (!subscription.cancel_at_period_end) {
    user.subscriptionStatus = 'canceled';
    user.stripeSubscriptionId = null;
    
    user.subscriptionHistory.push({
      status: 'canceled',
      priceId: subscription.items.data[0].price.id,
      startDate: new Date(subscription.current_period_start * 1000),
      endDate: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: false
    });
    
    await user.save();
    console.log(`Subscription immediately canceled for user ${user.email}`);
  } else {
    console.log(`Subscription will be canceled at period end for user ${user.email}`);
  }
}

// Handle successful payment
async function handlePaymentSucceeded(invoice) {
  if (!invoice.subscription) {
    console.log('Invoice not related to a subscription');
    return;
  }
  
  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  
  if (!user) {
    console.log(`No user found for customer: ${invoice.customer}`);
    return;
  }
  
  if (user.subscriptionStatus !== 'active') {
    user.subscriptionStatus = 'active';
    await user.save();
    console.log(`Updated subscription status to active for user ${user.email} after payment`);
  }
  
  if (invoice.billing_reason === 'subscription_cycle') {
    try {
      await sendSubscriptionRenewalEmail(user.email, {
        name: user.email.split('@')[0],
        amount: invoice.amount_paid / 100,
        currency: invoice.currency,
        date: new Date().toLocaleDateString(),
        nextBillingDate: new Date(invoice.lines.data[0].period.end * 1000).toLocaleDateString(),
        invoiceUrl: invoice.hosted_invoice_url
      });
    } catch (emailError) {
      console.error('Error sending renewal email:', emailError);
    }
  }
}

// Handle failed payment
async function handlePaymentFailed(invoice) {
  if (!invoice.subscription) {
    console.log('Invoice not related to a subscription');
    return;
  }
  
  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  
  if (!user) {
    console.log(`No user found for customer: ${invoice.customer}`);
    return;
  }
  
  user.subscriptionStatus = 'past_due';
  await user.save();
  
  console.log(`Updated subscription status to past_due for user ${user.email} after payment failure`);
  
  try {
    await sendPaymentFailedEmail(user.email, {
      name: user.email.split('@')[0],
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      date: new Date().toLocaleDateString(),
      lastFour: user.paymentMethodDetails?.last4 || 'unknown',
      reason: invoice.last_payment_error?.message || 'Payment method declined',
      updateUrl: `${process.env.FRONTEND_URL}/account/billing`
    });
  } catch (emailError) {
    console.error('Error sending payment failed email:', emailError);
  }
}

// Handle trial ending soon
async function handleTrialWillEnd(subscription) {
  const user = await User.findOne({ stripeCustomerId: subscription.customer });
  
  if (!user) {
    console.log(`No user found for customer: ${subscription.customer}`);
    return;
  }
  
  console.log(`Trial ending soon for user ${user.email} - subscription: ${subscription.id}`);
}

// Handle payment action required (like 3D Secure)
async function handlePaymentActionRequired(invoice) {
  if (!invoice.subscription) {
    console.log('Invoice not related to a subscription');
    return;
  }
  
  const user = await User.findOne({ stripeCustomerId: invoice.customer });
  
  if (!user) {
    console.log(`No user found for customer: ${invoice.customer}`);
    return;
  }
  
  try {
    await sendPaymentActionRequiredEmail(user.email, {
      name: user.email.split('@')[0],
      amount: invoice.amount_due / 100,
      currency: invoice.currency,
      actionUrl: invoice.hosted_invoice_url
    });
  } catch (emailError) {
    console.error('Error sending payment action required email:', emailError);
  }
}

export default router;