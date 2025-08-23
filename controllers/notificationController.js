import NotificationModel from "../models/notifications.js";
import { t } from "../localisation.js";
import { getUserLanguage } from "../utils/langDetector.js";

// Створити сповіщення
export const createNotification = async (notificationData) => {
  try {
    const notification = new NotificationModel(notificationData);
    await notification.save();
    console.log("✅ Сповіщення створено:", notification.title);
    return notification;
  } catch (error) {
    console.error("❌ Помилка створення сповіщення:", error);
    throw error;
  }
};

// Отримати всі сповіщення для адміна
export const getNotifications = async (req, res) => {
  try {
    const userLang = getUserLanguage(req);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const notifications = await NotificationModel.find()
      .populate('data.userId', 'fullName email')
      .populate('data.productId', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await NotificationModel.countDocuments();
    const unreadCount = await NotificationModel.countDocuments({ isRead: false });

    res.json({
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      unreadCount,
      message: t(userLang, "success.notifications.fetched", { 
        defaultValue: "Сповіщення завантажено" 
      }),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.fetch_failed", {
        defaultValue: "Помилка завантаження сповіщень"
      }),
    });
  }
};

// Відмітити сповіщення як прочитане
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userLang = getUserLanguage(req);

    const notification = await NotificationModel.findByIdAndUpdate(
      id,
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        message: t(userLang, "errors.notifications.not_found", {
          defaultValue: "Сповіщення не знайдено"
        }),
      });
    }

    res.json({
      notification,
      message: t(userLang, "success.notifications.marked_read", {
        defaultValue: "Сповіщення відмічено як прочитане"
      }),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.mark_read_failed", {
        defaultValue: "Помилка позначення як прочитане"
      }),
    });
  }
};

// Відмітити всі сповіщення як прочитані
export const markAllAsRead = async (req, res) => {
  try {
    const userLang = getUserLanguage(req);

    await NotificationModel.updateMany(
      { isRead: false },
      { 
        isRead: true,
        readAt: new Date()
      }
    );

    res.json({
      message: t(userLang, "success.notifications.all_marked_read", {
        defaultValue: "Всі сповіщення відмічено як прочитані"
      }),
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.mark_all_read_failed", {
        defaultValue: "Помилка позначення всіх як прочитані"
      }),
    });
  }
};

// Видалити сповіщення
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userLang = getUserLanguage(req);

    const notification = await NotificationModel.findByIdAndDelete(id);

    if (!notification) {
      return res.status(404).json({
        message: t(userLang, "errors.notifications.not_found", {
          defaultValue: "Сповіщення не знайдено"
        }),
      });
    }

    res.json({
      message: t(userLang, "success.notifications.deleted", {
        defaultValue: "Сповіщення видалено"
      }),
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.delete_failed", {
        defaultValue: "Помилка видалення сповіщення"
      }),
    });
  }
};

// Отримати кількість непрочитаних сповіщень
export const getUnreadCount = async (req, res) => {
  try {
    const unreadCount = await NotificationModel.countDocuments({ isRead: false });
    
    res.json({
      unreadCount,
    });
  } catch (error) {
    console.error("Error getting unread count:", error);
    res.status(500).json({
      unreadCount: 0,
    });
  }
};