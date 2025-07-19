import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configure email transport
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || ''
  }
});

/**
 * Send subscription confirmation email
 * @param {string} to - Recipient email
 * @param {Object} data - Subscription data
 */
export const sendSubscriptionConfirmationEmail = async (to, data) => {
  // Skip sending if email is not configured
  if (!process.env.EMAIL_USER || process.env.NODE_ENV === 'development') {
    console.log('Email service not configured or in development mode. Email would have been sent to:', to);
    console.log('Email data:', data);
    return true;
  }
  
  try {
    const { name, plan, price, interval, startDate, paymentMethod } = data;
    
    const mailOptions = {
      from: `"WritelikeYou.ai" <${process.env.EMAIL_FROM || 'noreply@writelikeyou.ai'}>`,
      to,
      subject: 'Your WriteLikeYou.ai Subscription Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">Subscription Confirmed</h1>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>Thank you for subscribing to WriteLikeYou.ai! Your subscription has been successfully set up.</p>
          
          <div style="background-color: #f3f4f6; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #4b5563;">Subscription Details</h2>
            <p><strong>Plan:</strong> ${plan}</p>
            <p><strong>Price:</strong> $${price}/${interval}</p>
            <p><strong>Start Date:</strong> ${startDate}</p>
            <p><strong>Payment Method:</strong> ${paymentMethod.brand} ending in ${paymentMethod.last4}</p>
          </div>
          
          <p>All your existing emails and data from your beta period have been preserved. You now have full access to all features without interruption.</p>
          
          <p>If you have any questions about your subscription, please contact our support team at support@writelikeyou.ai.</p>
          
          <p>Happy writing!</p>
          
          <p>The WriteLikeYou.ai Team</p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center;">
            <p>WritelikeYou.ai - Write emails that feel like you</p>
            <p>This email was sent to ${to}.</p>
            <p>If you have any questions, please contact us at support@writelikeyou.ai</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Subscription confirmation email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending subscription confirmation email:', error);
    throw error;
  }
};

/**
 * Send beta expiration reminder email
 * @param {string} to - Recipient email
 * @param {Object} data - User data
 */
export const sendBetaExpirationReminderEmail = async (to, data) => {
  // Skip sending if email is not configured
  if (!process.env.EMAIL_USER || process.env.NODE_ENV === 'development') {
    console.log('Email service not configured or in development mode. Email would have been sent to:', to);
    console.log('Email data:', data);
    return true;
  }
  
  try {
    const { name, betaExpiresAt, daysUntilExpiry } = data;
    
    const expiryDate = new Date(betaExpiresAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const mailOptions = {
      from: `"WritelikeYou.ai" <${process.env.EMAIL_FROM || 'noreply@writelikeyou.ai'}>`,
      to,
      subject: `Your WriteLikeYou.ai Beta Access Expires in ${daysUntilExpiry} Days`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">Beta Access Ending Soon</h1>
          </div>
          
          <p>Hello ${name || 'there'},</p>
          
          <p>Thank you for being one of our valued beta testers! We wanted to remind you that your beta access to WriteLikeYou.ai will expire in <strong>${daysUntilExpiry} days</strong> (on ${expiryDate}).</p>
          
          <div style="background-color: #f3f4f6; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #4b5563;">What Happens Next</h2>
            <p>After your beta access expires, you'll enter a 7-day grace period where you can view your existing emails but cannot create new ones.</p>
            <p>To continue with full access after your beta period, you'll need to upgrade to one of our subscription plans.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/beta-conversion" style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Secure Your Access Now</a>
          </div>
          
          <p>We've loved having you as part of our beta community and hope you'll continue your journey with WriteLikeYou.ai!</p>
          
          <p>If you have any questions, please contact our support team at support@writelikeyou.ai.</p>
          
          <p>Best regards,</p>
          <p>The WriteLikeYou.ai Team</p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center;">
            <p>WritelikeYou.ai - Write emails that feel like you</p>
            <p>This email was sent to ${to}.</p>
            <p>If you have any questions, please contact us at support@writelikeyou.ai</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Beta expiration reminder email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending beta expiration reminder email:', error);
    throw error;
  }
};

/**
 * Send payment failed email
 * @param {string} to - Recipient email
 * @param {Object} data - Payment data
 */
export const sendPaymentFailedEmail = async (to, data) => {
  // Skip sending if email is not configured
  if (!process.env.EMAIL_USER || process.env.NODE_ENV === 'development') {
    console.log('Email service not configured or in development mode. Email would have been sent to:', to);
    console.log('Email data:', data);
    return true;
  }
  
  try {
    const { name, amount, currency, date, lastFour, reason, updateUrl } = data;
    
    const mailOptions = {
      from: `"WritelikeYou.ai" <${process.env.EMAIL_FROM || 'noreply@writelikeyou.ai'}>`,
      to,
      subject: 'Action Required: Payment Failed for Your WriteLikeYou.ai Subscription',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(to right, #f43f5e, #ef4444); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">Payment Failed</h1>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>We were unable to process your payment of <strong>${amount} ${currency.toUpperCase()}</strong> for your WriteLikeYou.ai subscription on ${date}.</p>
          
          <div style="background-color: #fee2e2; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #b91c1c;">Payment Details</h2>
            <p><strong>Card ending in:</strong> ${lastFour}</p>
            <p><strong>Reason:</strong> ${reason}</p>
            <p><strong>Date:</strong> ${date}</p>
          </div>
          
          <p>Your account is currently in a grace period, but to ensure uninterrupted access to WriteLikeYou.ai, please update your payment method as soon as possible.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${updateUrl}" style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Update Payment Method</a>
          </div>
          
          <p>If you have any questions or need assistance, please contact our support team at support@writelikeyou.ai.</p>
          
          <p>Thank you for your prompt attention to this matter.</p>
          
          <p>The WriteLikeYou.ai Team</p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center;">
            <p>WritelikeYou.ai - Write emails that feel like you</p>
            <p>This email was sent to ${to}.</p>
            <p>If you have any questions, please contact us at support@writelikeyou.ai</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Payment failed email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment failed email:', error);
    throw error;
  }
};

/**
 * Send subscription renewal email
 * @param {string} to - Recipient email
 * @param {Object} data - Renewal data
 */
export const sendSubscriptionRenewalEmail = async (to, data) => {
  // Skip sending if email is not configured
  if (!process.env.EMAIL_USER || process.env.NODE_ENV === 'development') {
    console.log('Email service not configured or in development mode. Email would have been sent to:', to);
    console.log('Email data:', data);
    return true;
  }
  
  try {
    const { name, amount, currency, date, nextBillingDate, invoiceUrl } = data;
    
    const mailOptions = {
      from: `"WritelikeYou.ai" <${process.env.EMAIL_FROM || 'noreply@writelikeyou.ai'}>`,
      to,
      subject: 'Your WriteLikeYou.ai Subscription Has Been Renewed',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(to right, #3b82f6, #8b5cf6); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">Subscription Renewed</h1>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>Thank you for your continued subscription to WriteLikeYou.ai! Your payment of <strong>${amount} ${currency.toUpperCase()}</strong> has been successfully processed on ${date}.</p>
          
          <div style="background-color: #f3f4f6; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #4b5563;">Subscription Details</h2>
            <p><strong>Amount:</strong> ${amount} ${currency.toUpperCase()}</p>
            <p><strong>Date:</strong> ${date}</p>
            <p><strong>Next billing date:</strong> ${nextBillingDate}</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${invoiceUrl}" style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Invoice</a>
          </div>
          
          <p>You can manage your subscription at any time by visiting your <a href="${process.env.FRONTEND_URL}/account/billing" style="color: #3b82f6; text-decoration: underline;">account settings</a>.</p>
          
          <p>Thank you for being a valued member of WriteLikeYou.ai!</p>
          
          <p>The WriteLikeYou.ai Team</p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center;">
            <p>WritelikeYou.ai - Write emails that feel like you</p>
            <p>This email was sent to ${to}.</p>
            <p>If you have any questions, please contact us at support@writelikeyou.ai</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Subscription renewal email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending subscription renewal email:', error);
    throw error;
  }
};

/**
 * Send payment action required email
 * @param {string} to - Recipient email
 * @param {Object} data - Payment data
 */
export const sendPaymentActionRequiredEmail = async (to, data) => {
  // Skip sending if email is not configured
  if (!process.env.EMAIL_USER || process.env.NODE_ENV === 'development') {
    console.log('Email service not configured or in development mode. Email would have been sent to:', to);
    console.log('Email data:', data);
    return true;
  }
  
  try {
    const { name, amount, currency, actionUrl } = data;
    
    const mailOptions = {
      from: `"WritelikeYou.ai" <${process.env.EMAIL_FROM || 'noreply@writelikeyou.ai'}>`,
      to,
      subject: 'Action Required: Complete Your WriteLikeYou.ai Payment',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="background: linear-gradient(to right, #f59e0b, #d97706); padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
            <h1 style="color: white; margin: 0;">Action Required</h1>
          </div>
          
          <p>Hello ${name},</p>
          
          <p>Your payment of <strong>${amount} ${currency.toUpperCase()}</strong> for your WriteLikeYou.ai subscription requires additional verification.</p>
          
          <div style="background-color: #fef3c7; border-radius: 10px; padding: 20px; margin: 20px 0;">
            <h2 style="margin-top: 0; color: #92400e;">Additional Verification Required</h2>
            <p>Your bank has requested additional verification to complete this payment. This is a security measure to protect your card from unauthorized use.</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${actionUrl}" style="background: linear-gradient(to right, #3b82f6, #8b5cf6); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Complete Verification</a>
          </div>
          
          <p>To ensure uninterrupted access to WriteLikeYou.ai, please complete this verification as soon as possible.</p>
          
          <p>If you have any questions or need assistance, please contact our support team at support@writelikeyou.ai.</p>
          
          <p>The WriteLikeYou.ai Team</p>
          
          <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 20px; font-size: 12px; color: #6b7280; text-align: center;">
            <p>WritelikeYou.ai - Write emails that feel like you</p>
            <p>This email was sent to ${to}.</p>
            <p>If you have any questions, please contact us at support@writelikeyou.ai</p>
          </div>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Payment action required email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending payment action required email:', error);
    throw error;
  }
};

export default {
  sendSubscriptionConfirmationEmail,
  sendBetaExpirationReminderEmail,
  sendPaymentFailedEmail,
  sendSubscriptionRenewalEmail,
  sendPaymentActionRequiredEmail
};