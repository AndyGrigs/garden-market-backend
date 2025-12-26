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
    

    //...to finish 
  } catch (error) {
    console.error("Error fetching orders:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message:
        t(userLang, "errors.order.fetch_failed") || "Failed to fetch orders",
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
