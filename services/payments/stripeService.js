import Stripe from 'stripe';

class StripeService {
  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
    });
  }

  // Створити Payment Intent
  async createPaymentIntent(amount, currency = 'EUR', orderId, customerInfo) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe приймає в копійках
        currency: currency.toLowerCase(),
        metadata: {
          orderId: orderId,
          customerName: customerInfo.name,
          customerEmail: customerInfo.email || 'guest@covacitrees.md'
        },
        description: `Замовлення #${orderId}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe create payment intent error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Підтвердити платіж
  async confirmPayment(paymentIntentId) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      return {
        success: true,
        status: paymentIntent.status,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        metadata: paymentIntent.metadata
      };
    } catch (error) {
      console.error('Stripe confirm payment error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Webhook обробник
  async handleWebhook(payload, signature) {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      return {
        success: true,
        event: event
      };
    } catch (error) {
      console.error('Stripe webhook error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Повернути кошти (refund)
  async createRefund(paymentIntentId, amount = null) {
    try {
      const refundData = {
        payment_intent: paymentIntentId
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await this.stripe.refunds.create(refundData);

      return {
        success: true,
        refund: refund
      };
    } catch (error) {
      console.error('Stripe refund error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new StripeService();