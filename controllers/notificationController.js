import NotificationModel from "../models/notifications.js";
import UserModel from "../models/user.js";
import { t } from "../localisation.js";
import { getUserLanguage } from "../utils/langDetector.js";
import EmailService from '../services/emailService.js';
import { notifyAllAdmins } from '../config/adminConfig.js';
import logger from '../config/logger.js';

const emailService = new EmailService();

// Створити сповіщення
export const createNotification = async (notificationData) => {
  try {
    const notification = new NotificationModel(notificationData);
    await notification.save();
    return notification;
  } catch (error) {
    logger.error("Помилка створення сповіщення", {
      error: error.message,
      stack: error.stack,
      notificationType: notificationData?.type,
      notificationTitle: notificationData?.title
    });
    throw error;
  }
};

export const createNotificationRoute = async (req, res) => {
  try {
    const userLang = getUserLanguage(req);
    const notificationData = req.body;

    const notification = await createNotification(notificationData);

    res.status(201).json({
      notification,
      message: t(userLang, "success.notifications.created", {
        defaultValue: "Уведомление создано"
      }),
    });
  } catch (error) {
    logger.error("Помилка створення сповіщення через API", {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
      notificationType: req.body?.type
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.create_failed", {
        defaultValue: "Ошибка создания уведомления("
      }),
    });
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
        defaultValue: "Уведомления загружены"
      }),
    });
  } catch (error) {
    logger.error("Помилка отримання сповіщень", {
      error: error.message,
      stack: error.stack,
      page: req.query.page,
      limit: req.query.limit
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.fetch_failed", {
        defaultValue: "Ошибка загрузки уведомлений"
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
          defaultValue: "Уведомление не найдено"
        }),
      });
    }

    res.json({
      notification,
      message: t(userLang, "success.notifications.marked_read", {
        defaultValue: "Уведомление отмечено как прочитанное"
      }),
    });
  } catch (error) {
    logger.error("Помилка відмітки сповіщення як прочитане", {
      error: error.message,
      stack: error.stack,
      notificationId: req.params.id
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.mark_read_failed", {
        defaultValue: "Ошибка отметки как прочитанное"
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
        defaultValue: "Все уведомления отмечены как прочитанные"
      }),
    });
  } catch (error) {
    logger.error("Помилка відмітки всіх сповіщень як прочитані", {
      error: error.message,
      stack: error.stack,
      userId: req.userId
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.mark_all_read_failed", {
        defaultValue: "Ошибка отметки всех как прочитанные"
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
          defaultValue: "Уведомление не найдено"
        }),
      });
    }

    res.json({
      message: t(userLang, "success.notifications.deleted", {
        defaultValue: "Уведомление удалено"
      }),
    });
  } catch (error) {
    logger.error("Помилка видалення сповіщення", {
      error: error.message,
      stack: error.stack,
      notificationId: req.params.id
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.notifications.delete_failed", {
        defaultValue: "Ошибка удаления уведомления"
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
    logger.error("Помилка отримання кількості непрочитаних сповіщень", {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({
      unreadCount: 0,
    });
  }
};

// Схвалити продавця
export const approveSeller = async (req, res) => {
  try {
    const { userId } = req.params;
    const userLang = getUserLanguage(req);


    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        message: t(userLang, "errors.invalid_user_id", {
          defaultValue: "Неверный ID пользователя"
        }),
      });
    }

    // Знайти користувача
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: t(userLang, "errors.user_not_found", {
          defaultValue: "Пользователь не найден"
        }),
      });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({
        message: t(userLang, "errors.not_seller", {
          defaultValue: "Этот пользователь не является продавцом"
        }),
      });
    }

    // Оновити статус продавця на активний
    user.isActive = true;
    if (!user.sellerInfo) {
      user.sellerInfo = {};
    }
    user.sellerInfo.isApproved = true;
    await user.save();

    // Створити сповіщення
    try {
      await createNotification({
        type: 'seller_approved',
        title: t(userLang, 'success.notifications.seller_approved_title'),
        message: t(userLang, 'success.notifications.seller_approved_message', {
          fullName: user.fullName,
          nurseryName: user.sellerInfo?.nurseryName
        }),
        data: {
          userId: user._id,
          sellerInfo: {
            nurseryName: user.sellerInfo?.nurseryName,
            email: user.email,
            fullName: user.fullName,
          }
        }
      });

      // Відправити email всім адмінам
      await notifyAllAdmins(emailService, 'seller_approved', {
        fullName: user.fullName,
        email: user.email,
        nurseryName: user.sellerInfo?.nurseryName,
        approvedTime: new Date().toLocaleString('uk-UA')
      });

    } catch (notificationError) {
      logger.error("Помилка створення сповіщення про схвалення продавця", {
        error: notificationError.message,
        stack: notificationError.stack,
        userId: userId,
        sellerEmail: user?.email
      });
      // Не блокуємо схвалення через помилку сповіщення
    }

    // Відправити email самому продавцю
    try {
      await emailService.sendSellerApprovalEmail(
        user.email,
        {
          fullName: user.fullName,
          nurseryName: user.sellerInfo?.nurseryName,
        },
        userLang
      );
    } catch (emailError) {
      logger.error("Помилка відправки email про схвалення продавцю", {
        error: emailError.message,
        stack: emailError.stack,
        userId: userId,
        sellerEmail: user?.email
      });
    }

    res.json({
      message: t(userLang, "success.seller_approved", {
        defaultValue: "Продавец успешно утвержден"
      }),
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        isActive: user.isActive,
      }
    });
  } catch (error) {
    logger.error("Помилка схвалення продавця", {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
      adminId: req.userId
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.approve_seller_failed", {
        defaultValue: "Ошибка утверждения продавца"
      }),
    });
  }
};

// Відхилити продавця
export const rejectSeller = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body; // Optional rejection reason
    const userLang = getUserLanguage(req);


    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        message: t(userLang, "errors.invalid_user_id", {
          defaultValue: "Неверный ID пользователя"
        }),
      });
    }

    // Знайти користувача
    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: t(userLang, "errors.user_not_found", {
          defaultValue: "Пользователь не найден"
        }),
      });
    }

    if (user.role !== 'seller') {
      return res.status(400).json({
        message: t(userLang, "errors.not_seller", {
          defaultValue: "Этот пользователь не является продавцом"
        }),
      });
    }

    // Зберігаємо дані користувача перед видаленням
    const userData = {
      fullName: user.fullName,
      email: user.email,
      nurseryName: user.sellerInfo?.nurseryName,
      reason: reason || null
    };

    // Відправити email про відхилення
    try {
      await emailService.sendSellerRejectionEmail(
        user.email,
        userData,
        user.language || userLang
      );
    } catch (emailError) {
      logger.error("Помилка відправки email про відхилення продавця", {
        error: emailError.message,
        stack: emailError.stack,
        userId: userId,
        sellerEmail: user?.email
      });

    }

    // Створити сповіщення для адміна про відхилення
    try {
      await createNotification({
        type: 'seller_rejected',
        title: t(userLang, 'success.notifications.seller_rejected_title'),
        message: t(userLang, 'success.notifications.seller_rejected_message', {
          fullName: user.fullName,
          nurseryName: user.sellerInfo?.nurseryName
        }),
        data: {
          userId: user._id,
          sellerInfo: {
            nurseryName: user.sellerInfo?.nurseryName,
            email: user.email,
            fullName: user.fullName,
            reason: reason
          }
        }
      });
    } catch (notificationError) {
      logger.error("Помилка створення сповіщення про відхилення продавця", {
        error: notificationError.message,
        stack: notificationError.stack,
        userId: userId,
        sellerEmail: user?.email
      });
    }

    // Видалити користувача з бази даних
    await UserModel.findByIdAndDelete(userId);

    res.json({
      message: t(userLang, "success.seller_rejected", {
        defaultValue: "Продавец отклонен и удален"
      }),
      deletedUser: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
      }
    });
  } catch (error) {
    logger.error("Помилка відхилення продавця", {
      error: error.message,
      stack: error.stack,
      userId: req.params.userId,
      adminId: req.userId,
      reason: req.body?.reason
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.reject_seller_failed", {
        defaultValue: "Ошибка отклонения продавца"
      }),
    });
  }
};