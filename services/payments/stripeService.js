import Stripe from 'stripe';

class StripeService {
  constructor() {
    this.secretKey = process.env.STRIPE_SECRET_KEY;
    this.publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Only initialize Stripe if API key is provided
    if (this.secretKey) {
      this.stripe = new Stripe(this.secretKey, {
        apiVersion: '2024-11-20.acacia', // Оновлена версія API
      });
      console.log('✅ Stripe service initialized successfully');
    } else {
      this.stripe = null;
      console.warn('⚠️ Stripe API key not configured. Stripe payments will not be available.');
    }
  }

  // Перевірка чи налаштований Stripe
  isConfigured() {
    return this.stripe !== null;
  }

  // Отримати публічний ключ (для фронтенду)
  getPublishableKey() {
    return this.publishableKey;
  }

  // Створити Payment Intent
  async createPaymentIntent(amount, currency = 'EUR', orderId, customerInfo) {
    try {
      // Check if Stripe is configured
      if (!this.stripe) {
        return {
          success: false,
          error: 'Stripe credentials not configured'
        };
      }

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
      // Check if Stripe is configured
      if (!this.stripe) {
        return {
          success: false,
          error: 'Stripe credentials not configured'
        };
      }

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
      // Check if Stripe is configured
      if (!this.stripe) {
        return {
          success: false,
          error: 'Stripe credentials not configured'
        };
      }

      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret
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
      // Check if Stripe is configured
      if (!this.stripe) {
        return {
          success: false,
          error: 'Stripe credentials not configured'
        };
      }

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