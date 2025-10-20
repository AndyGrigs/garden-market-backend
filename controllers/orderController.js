import { t } from "../localisation.js";
import { getUserLanguage } from "../utils/langDetector.js";
import OrderSchema from "../models/order.js";
import UserSchema from '../models/user.js';

export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const userLang = getUserLanguage(req);

    const orders = await OrderSchema.find({ userId }).sort({ createdAt: -1 });

    res.json(orders);
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
