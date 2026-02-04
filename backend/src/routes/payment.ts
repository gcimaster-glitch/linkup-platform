import { Hono } from 'hono';
import { StripeService } from '../services/stripe';
import { ResendService } from '../services/resend';
import type { Bindings } from '../index';

const app = new Hono<{ Bindings: Bindings }>();

app.post('/create-intent', async (c) => {
  const { ticketId, amount } = await c.req.json();
  const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);
  
  try {
    const paymentIntent = await stripe.createPaymentIntent(amount);
    return c.json({ 
      clientSecret: paymentIntent.client_secret,
      id: paymentIntent.id 
    });
  } catch (e: any) {
    return c.json({ error: e.message }, 500);
  }
});

app.post('/verify-identity', async (c) => {
  // eKYC flow
  const stripe = new StripeService(c.env.STRIPE_SECRET_KEY);
  const session = await stripe.createIdentitySession('user_123');
  return c.json(session);
});

export { app as paymentRoutes };
