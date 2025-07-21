import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Use the latest API version or specify as needed
});

// Define product and price IDs for easy reference
export const PRODUCTS = {
  MONTHLY: {
    NAME: 'Writelikeyou.ai Monthly Subscription',
    PRICE_ID: process.env.STRIPE_MONTHLY_PRICE_ID
  },
  ANNUAL: {
    NAME: 'Writelikeyou.ai Annual Subscription',
    PRICE_ID: process.env.STRIPE_ANNUAL_PRICE_ID
  }
};

// Create products and prices if they don't exist (for development)
export const setupStripeProducts = async () => {
  if (process.env.NODE_ENV !== 'production') {
    try {
      // Check if products already exist
      const existingProducts = await stripe.products.list();
      
      const monthlyProduct = existingProducts.data.find(p => p.name === PRODUCTS.MONTHLY.NAME);
      const annualProduct = existingProducts.data.find(p => p.name === PRODUCTS.ANNUAL.NAME);
      
      // Create monthly product if it doesn't exist
      if (!monthlyProduct) {
        console.log('Creating monthly product...');
        const product = await stripe.products.create({
          name: PRODUCTS.MONTHLY.NAME,
          description: 'Monthly subscription to Writelikeyou.ai',
        });
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 2900, // $29.00
          currency: 'usd',
          recurring: {
            interval: 'month',
          },
        });
        
        console.log(`Created monthly product: ${product.id} with price: ${price.id}`);
        console.log(`Set STRIPE_MONTHLY_PRICE_ID=${price.id} in your .env file`);
      }
      
      // Create annual product if it doesn't exist
      if (!annualProduct) {
        console.log('Creating annual product...');
        const product = await stripe.products.create({
          name: PRODUCTS.ANNUAL.NAME,
          description: 'Annual subscription to Writelikeyou.ai (save $58)',
        });
        
        const price = await stripe.prices.create({
          product: product.id,
          unit_amount: 29000, // $290.00
          currency: 'usd',
          recurring: {
            interval: 'year',
          },
        });
        
        console.log(`Created annual product: ${product.id} with price: ${price.id}`);
        console.log(`Set STRIPE_ANNUAL_PRICE_ID=${price.id} in your .env file`);
      }
    } catch (error) {
      console.error('Error setting up Stripe products:', error);
    }
  }
};

export default stripe;