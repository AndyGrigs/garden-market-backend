import { t } from "../localisation.js";
import { getUserLanguage } from "../utils/langDetector.js";
import OrderSchema from "../models/order.js";
import UserSchema from '../models/user.js';
import invoiceService from '../services/invoiceService.js';
import EmailService from '../services/emailService.js';
import { invoiceEmailTemplates } from '../services/emailTemplates.js';

const emailService = new EmailService();

export const getUserOrders = async (req, res) => {
  try {
    const { userId, items, totalAmount, shippingAddress, customerNotes, language = 'ru' } = req.body;
    const userLang = getUserLanguage(req);
    
    // Валідація
    if (!items || items.length === 0) {
      return res.status(400).json({
        message: t(userLang, "errors.order.empty_cart", { defaultValue: "Кошик порожній" })
      });
    }

    // Розрахунок підсумків для кожного товару
    const itemsWithSubtotal = items.map(item => ({
      ...item,
      subtotal: item.price * item.quantity
    }));

    // Створення замовлення
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

    // Генеруємо рахунок (PDF)
    try{
      const invoiceResult = await invoiceService.generateInvoice(newOrder, language);
      
      newOrder.invoice = {
        number: `INV-${newOrder.orderNumber}`,
        pdfUrl: invoiceResult.relativePath,
        sentAt: new Date(),
        sentTo: newOrder.guestEmail
      };
      await newOrder.save();

      // Відправляємо email з рахунком
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

      // Відправляємо сповіщення адміну
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
          : 'Заказ успешно создан. В электронном почтовом ящике пришёл счёт на оплату.'
      });
        } catch (invoiceError) {
      console.error('Invoice generation error:', invoiceError);
      // Замовлення створено, але рахунок не згенеровано
      res.status(201).json({
        success: true,
        order: newOrder,
        warning: 'Заказ успешно создан. Если возникла ошибка, пожалуйста, свяжитесь с нами.'
      });
    }

  } catch (error) {
    console.error("Error creating order:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.order.create_failed", { defaultValue: "Помилка створення замовлення" })
    });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { userId, items, totalAmount, shippingAddress } = req.body;
    const userLang = getUserLanguage(req);

    // Validierung
    if (!userId || !items || !totalAmount || !shippingAddress) {
      return res.status(400).json({
        message:
          t(userLang, "errors.order.missing_fields") ||
          "Missing required fields",
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        message:
          t(userLang, "errors.order.empty_cart") || "Cart cannot be empty",
      });
    }

    // Berechne totalAmount zur Sicherheit neu
    const calculatedTotal = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const newOrder = new OrderSchema({
      userId,
      items,
      totalAmount: calculatedTotal,
      shippingAddress,
      status: "pending",
    });

    const savedOrder = await newOrder.save();
    const user = await UserSchema.findById(userId);
    if (
      user &&
      (!user.buyerInfo.savedAddress || !user.buyerInfo.savedAddress.street)
    ) {
      user.buyerInfo.savedAddress = shippingAddress;
      await user.save();
    }

    res.status(201).json(savedOrder);
  } catch (error) {
    console.error("Error creating order:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message:
        t(userLang, "errors.order.create_failed") || "Failed to create order",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userLang = getUserLanguage(req);

    const validStatuses = [
      "pending",
      "confirmed",
      "shipped",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: t(userLang, "errors.order.invalid_status") || "Invalid status",
      });
    }

    const updatedOrder = await OrderSchema.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        message: t(userLang, "errors.order.not_found") || "Order not found",
      });
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message:
        t(userLang, "errors.order.update_failed") || "Failed to update order",
    });
  }
};
