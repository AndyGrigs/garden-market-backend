import PaymentModel from '../models/payment.js';
import OrderModel from '../models/order.js';
import { getUserLanguage } from '../utils/langDetector.js';
import { t } from '../localisation.js';

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