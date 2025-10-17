import PaymentModel from '../models/payment.js';
import OrderModel from '../models/order.js';
import { getUserLanguage } from '../utils/langDetector.js';
import { t } from '../localisation.js';
import paypalService from '../services/payments/paypalService.js';

// ✅ НОВИЙ: Створити PayPal замовлення
export const createPayPalOrder = async (req, res) => {
  try {
    const { orderId, amount, currency = 'MDL' } = req.body;
    const userLang = getUserLanguage(req);

    // Перевіряємо чи існує замовлення
    const order = await OrderModel.findById(orderId);
    if (!order) {
      return res.status(404).json({
        message: t(userLang, 'errors.order.not_found', { defaultValue: 'Заказ не найден' })
      });
    }

    // Створюємо замовлення в PayPal
    const paypalOrder = await paypalService.createOrder(amount, currency, orderId);

    if (!paypalOrder.success) {
      return res.status(500).json({
        message: 'Помилка створення PayPal замовлення',
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
        message: 'Платіж не знайдено'
      });
    }

    // Захоплюємо платіж через PayPal
    const captureResult = await paypalService.capturePayment(paypalOrderId);

    if (!captureResult.success) {
      payment.status = 'failed';
      payment.failureReason = captureResult.error;
      await payment.save();

      return res.status(500).json({
        message: 'Помилка захоплення платежу',
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
      message: t(userLang, 'success.payment.completed', { defaultValue: 'Оплата успешна' }),
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
        message: t(userLang, 'errors.order.not_found', { defaultValue: 'Заказ не найден' })
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
  createPayment,
  getPayment,
  updatePaymentStatus
};