import User from '../models/User.js';
import { sendBetaExpirationReminderEmail } from '../services/emailService.js';

/**
 * Send reminder emails to beta users whose access is expiring soon
 * This job should be scheduled to run daily
 */
export const sendBetaExpiryReminders = async () => {
  try {
    const now = new Date();
    
    // Find beta users with expiry dates within the next 30, 14, 7, and 3 days
    const reminderDays = [30, 14, 7, 3, 1];
    
    for (const days of reminderDays) {
      // Calculate the date range for this reminder
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + days);
      
      // Set time to end of day for the target date
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Set time to start of day for the target date
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      // Find beta users whose access expires within this day
      const users = await User.find({
        subscriptionStatus: 'beta_access',
        betaExpiresAt: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      });
      
      console.log(`Found ${users.length} beta users whose access expires in ${days} days`);
      
      // Send reminder email to each user
      for (const user of users) {
        try {
          await sendBetaExpirationReminderEmail(user.email, {
            name: user.email.split('@')[0], // Use email prefix as name
            betaExpiresAt: user.betaExpiresAt,
            daysUntilExpiry: days
          });
          
          console.log(`Sent ${days}-day reminder to ${user.email}`);
        } catch (emailError) {
          console.error(`Error sending ${days}-day reminder to ${user.email}:`, emailError);
        }
      }
    }
    
    console.log('Beta expiry reminder job completed successfully');
    return { success: true, message: 'Beta expiry reminders sent successfully' };
  } catch (error) {
    console.error('Error in beta expiry reminder job:', error);
    return { 
      success: false, 
      error: error.message || 'Error processing beta expiry reminders'
    };
  }
};

export default { sendBetaExpiryReminders };