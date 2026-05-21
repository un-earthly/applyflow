import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-06-20',
});

export const STRIPE_PRICE_IDS = {
  monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY || '',
  yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY || '',
};

export const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    interval: 'forever',
    features: [
      'Up to 5 resumes',
      'Up to 20 applications',
      'Basic form filling',
      'Community support',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 9.99,
    interval: 'month',
    features: [
      'Unlimited resumes',
      'Unlimited applications',
      'Advanced form filling',
      'AI resume tailoring',
      'Priority email support',
      'Analytics dashboard',
    ],
  },
  {
    id: 'pro-annual',
    name: 'Pro (Annual)',
    price: 99.99,
    interval: 'year',
    features: [
      'Unlimited resumes',
      'Unlimited applications',
      'Advanced form filling',
      'AI resume tailoring',
      'Priority support',
      'Analytics dashboard',
      'Save 17% vs monthly',
    ],
  },
];
