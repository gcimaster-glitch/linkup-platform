import Stripe from 'stripe';

export class StripeService {
  private stripe: Stripe | null = null;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.stripe = new Stripe(apiKey, { apiVersion: '2023-10-16' });
    }
  }

  async createPaymentIntent(amount: number, currency: string = 'jpy') {
    if (!this.stripe) {
      console.log('Mocking Stripe PaymentIntent');
      return { id: 'pi_mock_123', client_secret: 'mock_secret_123' };
    }
    return await this.stripe.paymentIntents.create({
      amount,
      currency,
      automatic_payment_methods: { enabled: true },
    });
  }

  async createIdentitySession(userId: string) {
    if (!this.stripe) {
      console.log('Mocking Stripe Identity Session');
      return { id: 'vs_mock_123', url: 'https://verify.stripe.com/mock' };
    }
    // Note: Requires 'identity' beta access or enabled feature
    // This is a conceptual implementation
    return { id: 'vs_mock_real_impl', url: 'https://verify.stripe.com/...' };
  }
}
