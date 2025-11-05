import PaymentModel from '../models/payment.js';
import OrderModel from '../models/order.js';
import { getUserLanguage } from '../utils/langDetector.js';
import { t } from '../localisation.js';
import paypalService from '../services/payments/paypalService.js';
import runpayService from '../services/payments/runpayService.js';
import paynetService from '../services/payments/paynetService.js';
import stripeService from '../services/payments/stripeService.js';

// ✅ Отримати конфігурацію Stripe для фронтенду
export const getStripeConfig = async (req, res) => {
  try {
    if (!stripeService.isConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Stripe payments are not configured'
      });
    }

    res.json({
      success: true,
      publishableKey: stripeService.getPublishableKey()
    });
  } catch (error) {
    console.error('Get Stripe config error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get Stripe configuration'
    });
  }
};



// ✅ НОВИЙ: Створити PayPal замовлення
export const createPayPalOrder = async (req, res) => {
  try {
    const { orderId, amount, currency = 'MDL' } = req.body;
    const userLang = getUserLanguage(req);

    // Перевіряємо чи існує замовлення
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: t(userLang, 'errors.order.not_found')
      });
    }

    // Створюємо замовлення в PayPal
    const paypalOrder = await paypalService.createOrder(amount, currency, orderId);

    if (!paypalOrder.success) {
      return res.status(500).json({
        message: t(userLang, 'errors.payment.paypal_creation_failed'),
        error: paypalOrder.error
      });
    }

    // Створюємо запис платежу в нашій БД
    const payment = new PaymentModel({
      orderId,
      userId: req.userId || null,
      amount,
      currency,
      paymentMethod: 'paypal',
      transactionId: paypalOrder.orderId,
      status: 'pending'
    });

    await payment.save();

    // Оновлюємо замовлення
    order.paymentId = payment._id;
    order.paymentMethod = 'paypal';
    await order.save();

    res.json({
      success: true,
      paypalOrderId: paypalOrder.orderId,
      approveLink: paypalOrder.links.find(link => link.rel === 'approve')?.href,
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Create PayPal order error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.server_error')
    });
  }
};

// ✅ НОВИЙ: Підтвердити PayPal платіж
export const capturePayPalPayment = async (req, res) => {
  try {
    const { paypalOrderId } = req.body;
    const userLang = getUserLanguage(req);

    // Знаходимо наш платіж
    const payment = await PaymentModel.findOne({ transactionId: paypalOrderId });
    if (!payment) {
      return res.status(404).json({
        message: t(userLang, 'errors.payment.not_found')
      });
    }

    // Захоплюємо платіж через PayPal
    const captureResult = await paypalService.capturePayment(paypalOrderId);

    if (!captureResult.success) {
      payment.status = 'failed';
      payment.failureReason = captureResult.error;
      await payment.save();

      return res.status(500).json({
        message: t(userLang, 'errors.payment.payment_capture_failed'),
        error: captureResult.error
      });
    }

    // Оновлюємо статус платежу
    payment.status = 'completed';
    payment.paidAt = new Date();
    payment.paymentDetails = captureResult.details;
    await payment.save();

    // Оновлюємо замовлення
    const order = await OrderModel.findById(payment.orderId);
    if (order) {
      order.paymentStatus = 'paid';
      order.status = 'processing';
      await order.save();
    }

    res.json({
      success: true,
      message: t(userLang, 'success.payment.completed'),
      payment,
      order
    });

  } catch (error) {
    console.error('Capture PayPal payment error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.server_error')
    });
  }
};


// Створення платежу
export const createPayment = async (req, res) => {
  try {
    const { orderId, paymentMethod, amount } = req.body;
    const userLang = getUserLanguage(req);

    // Перевіряємо чи існує замовлення
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: t(userLang, 'errors.order.not_found')
      });
    }

    // Створюємо запис платежу
    const payment = new PaymentModel({
      orderId,
      userId: req.userId || null,
      amount,
      paymentMethod,
      status: 'pending'
    });

    await payment.save();

    // Оновлюємо замовлення
    order.paymentId = payment._id;
    order.paymentMethod = paymentMethod;
    await order.save();

    res.status(201).json({
      payment,
      message: t(userLang, 'success.payment.created')
    });

  } catch (error) {
    console.error('Create payment error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.server_error')
    });
  }
};

// Отримати інформацію про платіж
export const getPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const userLang = getUserLanguage(req);
    const payment = await PaymentModel.findById(id)
      .populate('orderId')
      .populate('userId', 'fullName email');

    if (!payment) {
      return res.status(404).json({
        message: t(userLang, 'errors.payment.not_found')
      });
    }

    res.json(payment);
  } catch (error) {
    console.error('Get payment error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.server_error')
    });
  }
};

// Оновити статус платежу (webhook)
export const updatePaymentStatus = async (req, res) => {
  try {
    const { transactionId, status, paymentDetails } = req.body;
    const userLang = getUserLanguage(req);

    const payment = await PaymentModel.findOne({ transactionId });
    if (!payment) {
      return res.status(404).json({
        message: t(userLang, 'errors.payment.not_found')
      });
    }

    payment.status = status;
    payment.paymentDetails = paymentDetails;

    if (status === 'completed') {
      payment.paidAt = new Date();

      // Оновлюємо статус замовлення
      const order = await OrderModel.findById(payment.orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();
      }
    }

    await payment.save();

    res.json({
      message: t(userLang, 'success.payment.status_updated'),
      payment
    });
  } catch (error) {
    console.error('Update payment error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.payment.update_failed')
    });
  }
};

export default {
  createPayPalOrder,
  capturePayPalPayment,
  createPayment,
  getPayment,
  updatePaymentStatus
};
// ✅ RunPay створити платіж
export const createRunPayPayment = async (req, res) => {
  try {
    const { orderId, amount, currency = 'MDL' } = req.body;
    const userLang = getUserLanguage(req);

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: t(userLang, 'errors.order.not_found')
      });
    }

    // Створюємо платіж через RunPay
    const runpayPayment = await runpayService.initiatePayment(amount, orderId, currency);

    if (!runpayPayment.success) {
      return res.status(500).json({
        message: t(userLang, 'errors.payment.runpay_creation_failed'),
        error: runpayPayment.error
      });
    }

    // Зберігаємо в БД
    const payment = new PaymentModel({
      orderId,
      userId: req.userId || null,
      amount,
      currency,
      paymentMethod: 'runpay',
      transactionId: runpayPayment.paymentId,
      status: 'pending'
    });

    await payment.save();

    order.paymentId = payment._id;
    order.paymentMethod = 'runpay';
    await order.save();

    res.json({
      success: true,
      paymentUrl: runpayPayment.paymentUrl,
      paymentId: payment._id,
      message: runpayPayment.message
    });

  } catch (error) {
    console.error('Create RunPay payment error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.server_error')
    });
  }
};


// ✅ PayNet створити платіж
export const createPayNetPayment = async (req, res) => {
  try {
    const { orderId, amount, customerInfo } = req.body;
    const userLang = getUserLanguage(req);

    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: t(userLang, 'errors.order.not_found')
      });
    }

    // Створюємо платіж через PayNet
    const paynetPayment = await paynetService.initiatePayment(amount, orderId, customerInfo);

    if (!paynetPayment.success) {
      return res.status(500).json({
        message: t(userLang, 'errors.payment.paynet_creation_failed'),
        error: paynetPayment.error
      });
    }

    // Зберігаємо в БД
    const payment = new PaymentModel({
      orderId,
      userId: req.userId || null,
      amount,
      currency: 'MDL',
      paymentMethod: 'paynet',
      status: 'pending'
    });

    await payment.save();

    order.paymentId = payment._id;
    order.paymentMethod = 'paynet';
    await order.save();

    res.json({
      success: true,
      paymentForm: paynetPayment.paymentForm,
      paymentUrl: paynetPayment.paymentUrl,
      paymentId: payment._id,
      message: paynetPayment.message
    });

  } catch (error) {
    console.error('Create PayNet payment error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.server_error')
    });
  }
};

// ✅ Webhook для RunPay
export const runpayWebhook = async (req, res) => {
  try {
    const signature = req.headers['rp-sign'];
    const webhookData = req.body;

    const result = await runpayService.handleWebhook(webhookData, signature);

    if (!result.success) {
      return res.status(400).json({ message: 'Invalid webhook' });
    }

    // Оновлюємо статус платежу
    const payment = await PaymentModel.findOne({ transactionId: webhookData.externalId });
    if (payment) {
      payment.status = webhookData.status === 'completed' ? 'completed' : 'failed';
      payment.paidAt = webhookData.status === 'completed' ? new Date() : null;
      await payment.save();

      // Оновлюємо замовлення
      if (payment.status === 'completed') {
        const order = await OrderModel.findById(payment.orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          await order.save();
        }
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error('RunPay webhook error:', error);
    res.status(500).json({ message: 'Webhook error' });
  }
};

// ✅ Callback для PayNet
export const paynetCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    
    const result = await paynetService.handleCallback(callbackData);

    if (!result.success) {
      return res.status(400).json({ message: 'Invalid callback' });
    }

    // Оновлюємо платіж
    const payment = await PaymentModel.findOne({ orderId: result.orderId });
    if (payment) {
      payment.status = result.status === '1' ? 'completed' : 'failed';
      payment.transactionId = result.transactionId;
      payment.paidAt = result.status === '1' ? new Date() : null;
      await payment.save();

      // Оновлюємо замовлення
      if (payment.status === 'completed') {
        const order = await OrderModel.findById(payment.orderId);
        if (order) {
          order.paymentStatus = 'paid';
          order.status = 'processing';
          await order.save();
        }
      }
    }

    // Редірект на success сторінку
    res.redirect(`${process.env.FRONTEND_URL}/payment/success?orderId=${result.orderId}`);
  } catch (error) {
    console.error('PayNet callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/payment/cancel`);
  }
};


// ✅ Створити Stripe Payment Intent
export const createStripePaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, currency = 'EUR', customerInfo } = req.body;
    const userLang = getUserLanguage(req);

    // Перевіряємо замовлення
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: t(userLang, 'errors.order.not_found')
      });
    }

    // Створюємо Payment Intent
    const result = await stripeService.createPaymentIntent(
      amount,
      currency,
      orderId,
      customerInfo
    );

    if (!result.success) {
      return res.status(500).json({
        message: t(userLang, 'errors.payment.stripe_creation_failed'),
        error: result.error
      });
    }

    // Зберігаємо в БД
    const payment = new PaymentModel({
      orderId,
      userId: req.userId || null,
      amount,
      currency,
      paymentMethod: 'card',
      transactionId: result.paymentIntentId,
      status: 'pending',
      paymentDetails: {
        clientSecret: result.clientSecret
      }
    });

    await payment.save();

    order.paymentId = payment._id;
    order.paymentMethod = 'card';
    await order.save();

    res.json({
      success: true,
      clientSecret: result.clientSecret,
      paymentId: payment._id
    });

  } catch (error) {
    console.error('Create Stripe payment error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.server_error')
    });
  }
};

// ✅ Підтвердити Stripe платіж
export const confirmStripePayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;
    const userLang = getUserLanguage(req);

    // Знаходимо платіж
    const payment = await PaymentModel.findOne({ transactionId: paymentIntentId });
    if (!payment) {
      return res.status(404).json({
        message: t(userLang, 'errors.payment.not_found')
      });
    }

    // Перевіряємо статус в Stripe
    const result = await stripeService.confirmPayment(paymentIntentId);

    if (!result.success) {
      payment.status = 'failed';
      payment.failureReason = result.error;
      await payment.save();

      return res.status(500).json({
        message: t(userLang, 'errors.payment.stripe_confirmation_failed'),
        error: result.error
      });
    }

    // Оновлюємо платіж
    if (result.status === 'succeeded') {
      payment.status = 'completed';
      payment.paidAt = new Date();
      await payment.save();

      // Оновлюємо замовлення
      const order = await OrderModel.findById(payment.orderId);
      if (order) {
        order.paymentStatus = 'paid';
        order.status = 'processing';
        await order.save();
      }

      res.json({
        success: true,
        message: t(userLang, 'success.payment.completed'),
        payment,
        order
      });
    } else {
      res.json({
        success: false,
        status: result.status,
        message: t(userLang, 'errors.payment.stripe_not_confirmed')
      });
    }

  } catch (error) {
    console.error('Confirm Stripe payment error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, 'errors.server_error')
    });
  }
};

// ✅ Stripe Webhook
export const stripeWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    const payload = req.body;

    const result = await stripeService.handleWebhook(payload, signature);

    if (!result.success) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = result.event;

    // Обробляємо різні типи подій
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        const payment = await PaymentModel.findOne({ 
          transactionId: paymentIntent.id 
        });

        if (payment) {
          payment.status = 'completed';
          payment.paidAt = new Date();
          await payment.save();

          const order = await OrderModel.findById(payment.orderId);
          if (order) {
            order.paymentStatus = 'paid';
            order.status = 'processing';
            await order.save();
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedIntent = event.data.object;
        const failedPayment = await PaymentModel.findOne({ 
          transactionId: failedIntent.id 
        });

        if (failedPayment) {
          failedPayment.status = 'failed';
          failedPayment.failureReason = failedIntent.last_payment_error?.message || 'Payment failed';
          await failedPayment.save();
        }
        break;

      default:
        console.log(`Unhandld event type: ${event.type}`);
    }

    res.json({ received: true });

  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(500).json({ message: 'Webhook error' });
  }
};