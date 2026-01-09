import OrderSchema from '../models/order.js';
import { t } from '../localisation.js';
import { getUserLanguage } from '../utils/langDetector.js';
import invoiceService from '../services/invoiceService.js';
import EmailService from '../services/emailService.js';
import { invoiceEmailTemplates } from '../services/emailTemplates.js';
import logger from '../config/logger.js';

const emailService = new EmailService();

export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, shippingAddress, customerNotes, language = 'ru' } = req.body;
    const userLang = getUserLanguage(req);

    // Валидация
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: t(userLang, "errors.order.empty_cart", { defaultValue: "Корзина пуста" })
      });
    }

    // Расчет итогов для каждого товара
    const itemsWithSubtotal = items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));

    // Создание заказа
    const newOrder = new OrderSchema({
      userId: userId || null,
      guestEmail: shippingAddress.email || req.body.email,
      guestName: shippingAddress.name,
      items: itemsWithSubtotal,
      totalAmount,
      currency: 'MDL',
      status: 'awaiting_payment',
      paymentStatus: 'unpaid',
      paymentMethod: 'bank_transfer',
      shippingAddress,
      customerNotes
    });

    await newOrder.save();

    // Генерируем счет (PDF)
    try {
      const invoiceResult = await invoiceService.generateInvoice(newOrder, language);
      
      newOrder.invoice = {
        number: `INV-${newOrder.orderNumber}`,
        pdfUrl: invoiceResult.relativePath,
        sentAt: new Date(),
        sentTo: newOrder.guestEmail
      };
      
      await newOrder.save();

      // Отправляем email со счетом
      const invoiceUrl = `${process.env.FRONTEND_URL || 'http://localhost:4000'}${invoiceResult.relativePath}`;
      const emailTemplate = invoiceEmailTemplates[language] || invoiceEmailTemplates.ru;

      await emailService.sendEmail(
        newOrder.guestEmail,
        language === 'ro' ? 'Factura pentru comanda dvs.' : 'Счет на оплату заказа',
        emailTemplate(newOrder, invoiceUrl),
        [{ 
          filename: invoiceResult.fileName, 
          path: invoiceResult.filePath 
        }]
      );

      // Отправляем уведомление администратору
      await emailService.sendEmail(
        process.env.ADMIN_EMAIL || 'info@covacitrees.md',
        `Новый заказ #${newOrder.orderNumber}`,
        `
          <h2>Новый заказ #${newOrder.orderNumber}</h2>
          <p>Клиент: ${shippingAddress.name}</p>
          <p>Email: ${newOrder.guestEmail}</p>
          <p>Телефон: ${shippingAddress.phone}</p>
          <p>Сумма: ${totalAmount} MDL</p>
          <p>Статус: Ожидает оплаты</p>
        `
      );

      res.status(201).json({
        success: true,
        order: newOrder,
        message: language === 'ro'
          ? 'Comanda a fost plasată cu succes. Verificați emailul pentru factura de plată.'
          : 'Заказ успешно создан. Проверьте email для получения счета на оплату.'
      });

    } catch (invoiceError) {
      logger.error('Помилка генерації рахунку', {
        error: invoiceError.message,
        stack: invoiceError.stack,
        orderId: newOrder._id,
        orderNumber: newOrder.orderNumber,
        email: newOrder.guestEmail
      });
      // Заказ создан, но счет не сгенерирован
      res.status(201).json({
        success: true,
        order: newOrder,
        warning: 'Заказ создан, но возникла ошибка при генерации счета. Свяжитесь с нами.'
      });
    }

  } catch (error) {
    logger.error("Помилка створення замовлення", {
      error: error.message,
      stack: error.stack,
      userId: req.body.userId,
      email: req.body.email || req.body.shippingAddress?.email,
      totalAmount: req.body.totalAmount
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.order.create_failed", { defaultValue: "Ошибка создания заказа" })
    });
  }
};

// Получить заказы пользователя
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const userLang = getUserLanguage(req);

    const orders = await OrderSchema.find({ userId })
      .sort({ createdAt: -1 })
      .populate('items.treeId');

    res.json(orders);
  } catch (error) {
    logger.error("Помилка отримання замовлень користувача", {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.order.fetch_failed", { defaultValue: "Ошибка загрузки заказов" })
    });
  }
};

// Обновить статус заказа (АДМИНИСТРАТОР)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus, adminNotes } = req.body;
    const userLang = getUserLanguage(req);

    const order = await OrderSchema.findById(id);

    if (!order) {
      return res.status(404).json({
        message: t(userLang, "errors.order.not_found", { defaultValue: "Заказ не найден" })
      });
    }

    // Обновляем статусы
    if (status) order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'paid' && !order.paidAt) {
        order.paidAt = new Date();
      }
    }
    if (adminNotes) order.adminNotes = adminNotes;

    await order.save();

    // Отправляем email клиенту об изменении статуса
    if (status === 'paid' || paymentStatus === 'paid') {
      await emailService.sendEmail(
        order.guestEmail,
        'Оплата подтверждена',
        `
          <h2>Оплата подтверждена!</h2>
          <p>Ваш заказ #${order.orderNumber} оплачен.</p>
          <p>Мы начали обработку вашего заказа.</p>
        `
      );
    }

    res.json({
      success: true,
      order,
      message: 'Статус заказа обновлен'
    });

  } catch (error) {
    logger.error("Помилка оновлення статусу замовлення", {
      error: error.message,
      stack: error.stack,
      orderId: req.params.id,
      status: req.body.status,
      paymentStatus: req.body.paymentStatus
    });
    res.status(500).json({
      message: "Ошибка обновления заказа"
    });
  }
};

// Получить все заказы (АДМИНИСТРАТОР)
export const getAllOrders = async (req, res) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const orders = await OrderSchema.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('userId', 'fullName email');

    const count = await OrderSchema.countDocuments(query);

    res.json({
      orders,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    logger.error("Помилка отримання всіх замовлень (admin)", {
      error: error.message,
      stack: error.stack,
      filters: {
        status: req.query.status,
        paymentStatus: req.query.paymentStatus,
        page: req.query.page
      }
    });
    res.status(500).json({
      message: "Ошибка загрузки заказов"
    });
  }
};