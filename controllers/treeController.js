import TreeSchema from "../models/tree.js";
import UserSchema from "../models/user.js";
import EmailService from "../services/emailService.js";
import { t } from "../localisation.js";
import { getUserLanguage } from "../utils/langDetector.js";
import { createNotification } from "./notificationController.js";
import { notifyAllAdmins } from "../config/adminConfig.js";
import { deleteOldImageFile } from "./uploadController.js";
import logger from "../config/logger.js";
import user from "../models/user.js";

const emailService = new EmailService();

export const createTree = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      imageUrl,
      category,
      stock
    } = req.body;
    const userLang = getUserLanguage(req);

    if (req.userRole === "admin") {
      if (!title || !title.ru || !title.ro) {
        return res.status(400).json({
          message: t(userLang, "errors.title_required"),
        });
      }
      if (!description || !description.ru || !description.ro) {
        return res.status(400).json({
          message: t(userLang, "errors.description_required"),
        });
      }
    }

    // Валідація для продавців (тільки російська обов'язкова)
    if (req.userRole === "seller") {
      if (!title || !title.ru) {
        return res.status(400).json({
          message: t(userLang, "errors.title_ru_required"),
        });
      }
      if (!description || !description.ru) {
        return res.status(400).json({
          message: t(userLang, "errors.description_ru_required"),
        });
      }
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        message: t(userLang, "errors.invalid_price"),
      });
    }

    if (!category) {
      return res.status(400).json({
        message: t(userLang, "errors.category_required"),
      });
    }

    if (stock && stock < 0) {
      return res.status(400).json({
        message: t(userLang, "errors.invalid_stock"),
      });
    }

    let sellerId = req.userId;

    if (req.userRole === "admin" && req.body.seller) {
      sellerId = req.body.seller;
    }

    // Створюємо товар
    const tree = new TreeSchema({
      title,
      description,
      price,
      imageUrl,
      category,
      stock,
      seller: sellerId,
      isApproved: req.userRole === "admin" ? true : false
    });

    await tree.save();

    // ⬇️ СПОВІЩЕННЯ ЯКЩО ПРОДАВЕЦЬ СТВОРЮЄ ТОВАР
    if (req.userRole === "seller") {
      try {
        const sellerData = await UserSchema.findById(req.userId).select(
          "fullName sellerInfo email",
        );

        // Створюємо сповіщення в базі
        await createNotification({
          type: "new_product_created",
          title: "Новый товар от продавца",
          message: `Продавец ${sellerData?.fullName} добавил товар: "${title.ru}". Нужно добавить переводы.`,
          data: {
            userId: req.userId,
            productId: tree._id,
            sellerInfo: {
              nurseryName: sellerData?.sellerInfo?.nurseryName,
              fullName: sellerData?.fullName,
            },
          },
        });

        // ⬇️ ВІДПРАВЛЯЄМО EMAIL АДМІНАМ
        await notifyAllAdmins(emailService, "new_product_created", {
          productName: title.ru,
          productId: tree._id,
          price: price,
          sellerInfo: {
            fullName: sellerData?.fullName,
            nurseryName: sellerData?.sellerInfo?.nurseryName,
            email: sellerData?.email,
          },
          createdTime: new Date().toLocaleString("uk-UA"),
        });
      } catch (notificationError) {
        logger.error("Помилка створення сповіщення про новий товар", {
          error: notificationError.message,
          stack: notificationError.stack,
          userId: req.userId,
          productId: tree._id,
          productTitle: title.ru,
        });
        // Не блокуємо створення товару через помилку сповіщення
      }
    }

    // Отримуємо повні дані товару з populate
    const populatedTree = await TreeSchema.findById(tree._id)
      .populate("category")
      .populate("seller", "fullName sellerInfo.nurseryName");

    res.status(201).json({
      ...populatedTree.toObject(), // ⬅️ ВИПРАВЛЕНО: toObject() замість toObt()
      message: t(userLang, "success.tree.created"),
    });
  } catch (error) {
    logger.error("Помилка створення товару", {
      error: error.message,
      stack: error.stack,
      userId: req.userId,
      userRole: req.userRole,
      title: req.body.title?.ru,
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.create_failed"),
    });
  }
};

export const getAllTrees = async (req, res) => {
  try {
    const trees = await TreeSchema.find({ isActive: true, isApproved: true })
      .populate("category")
      .populate("seller", "fullName sellerInfo.nurseryName");

    res.json(trees);
  } catch (err) {
    logger.error("Помилка отримання всіх товарів", {
      error: err.message,
      stack: err.stack,
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.fetch_failed"),
    });
  }
};

export const getPendingTrees = async (req, res) => {
  try {
    const userLang = getUserLanguage(req);
    
    const trees = await TreeSchema.find({ 
      isApproved: false,
      isActive: true
    })
      .populate("category")
      .populate("seller", "fullName email sellerInfo.nurseryName")
      .sort({ createdAt: -1 });

    res.json({
      trees,
      message: t(userLang, "success.tree.fetched"),
    });
  } catch (error) {
    logger.error("Помилка отримання товарів на модерації", {
      error: error.message,
      stack: error.stack
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.fetch_failed"),
    });
  }
};

export const approveTree = async (req, res) => {
  try {
    const { id } = req.params;
    const userLang = getUserLanguage(req);

    const tree = await TreeSchema.findById(id).populate("seller", "fullName email sellerInfo.nurseryName");

    if (!tree) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    if (tree.isApproved) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.already_approved", {
          defaultValue: "Товар уже одобрен"
        }),
      });
    }

    // Схвалюємо товар
    tree.isApproved = true;
    tree.approvedBy = req.userId;
    tree.approvedAt = new Date();
    await tree.save();

    // Створюємо сповіщення
    try {
      await createNotification({
        type: "product_approved",
        title: "Товар схвалено",
        message: `Товар "${tree.title.ru}" від продавця ${tree.seller.fullName} було схвалено`,
        data: {
          productId: tree._id,
          userId: tree.seller._id,
          sellerInfo: {
            nurseryName: tree.seller.sellerInfo?.nurseryName,
            email: tree.seller.email,
            fullName: tree.seller.fullName,
          }
        }
      });
    } catch (notificationError) {
      logger.error("Помилка створення сповіщення про схвалення товару", {
        error: notificationError.message,
        stack: notificationError.stack,
        treeId: id
      });
    }

    // Відправляємо email продавцю
    try {
      await emailService.sendProductApprovalEmail(
        tree.seller.email,
        {
          fullName: tree.seller.fullName,
          productTitle: tree.title.ru,
          nurseryName: tree.seller.sellerInfo?.nurseryName,
        },
        tree.seller.language || 'ru'
      );
    } catch (emailError) {
      logger.error("Помилка відправки email про схвалення товару", {
        error: emailError.message,
        stack: emailError.stack,
        sellerEmail: tree.seller.email
      });
    }

    res.json({
      message: t(userLang, "success.tree.approved", {
        defaultValue: "Товар успешно одобрен"
      }),
      tree,
    });
  } catch (error) {
    logger.error("Помилка схвалення товару", {
      error: error.message,
      stack: error.stack,
      treeId: req.params.id
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.approve_failed", {
        defaultValue: "Ошибка одобрения товара"
      }),
    });
  }
};

export const updateTree = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, imageUrl, category, stock } = req.body;
    const userLang = getUserLanguage(req);

    // Валідація
    if (price && price <= 0) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.invalid_price"),
      });
    }

    if (stock && stock < 0) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.invalid_stock"),
      });
    }

    // Get current tree to check for old image
    const currentTree = await TreeSchema.findById(id);
    if (!currentTree) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    // If imageUrl is being updated and it's different from current, delete old image
    if (imageUrl !== undefined && imageUrl !== currentTree.imageUrl) {
      deleteOldImageFile(currentTree.imageUrl);
    }

    const updatedTree = await TreeSchema.findByIdAndUpdate(
      id,
      { $set: { title, description, price, imageUrl, category, stock } },
      { new: true },
    ).populate("category");

    res.status(200).json({
      ...updatedTree.toObject(),
      message: t(userLang, "success.tree.updated"),
    });
  } catch (error) {
    logger.error("Помилка оновлення товару (admin)", {
      error: error.message,
      stack: error.stack,
      treeId: req.params.id,
      userId: req.userId,
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.update_failed"),
    });
  }
};

export const deleteTree = async (req, res) => {
  try {
    const treeId = req.params.id;
    const userLang = getUserLanguage(req);

    // ✅ FIX 1: Спочатку знаходимо дерево щоб отримати imageUrl
    const treeToDelete = await TreeSchema.findById(treeId);

    if (!treeToDelete) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    // Видаляємо фото (Cloudinary або локальне)
    await deleteOldImageFile(treeToDelete.imageUrl);

    // ✅ FIX 3: Тепер видаляємо дерево з бази
    const deleted = await TreeSchema.findByIdAndDelete(treeId);

    res.json({
      message: t(userLang, "success.tree.deleted"),
      deletedTree: {
        id: deleted._id,
        title: deleted.title,
        imageDeleted: !!treeToDelete.imageUrl,
      },
    });
  } catch (err) {
    logger.error("Помилка видалення товару", {
      error: err.message,
      stack: err.stack,
      treeId: req.params.id,
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.delete_failed"),
      error: err.message,
    });
  }
};

export const getSellerTrees = async (req, res) => {
  try {
    const userLang = getUserLanguage(req);

    const trees = await TreeSchema.find({
      seller: req.userId,
      isActive: true,
    })
      .populate("category")
      .populate("seller", "fullName sellerInfo.nurseryName")
      .sort({ createdAt: -1 });

    res.json({
      trees,
      message: t(userLang, "success.tree.fetched"),
    });
  } catch (error) {
    logger.error("Помилка отримання товарів продавця", {
      error: error.message,
      stack: error.stack,
      sellerId: req.userId,
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.fetch_failed"),
    });
  }
};

export const updateSellerTree = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, imageUrl, category, stock } = req.body;
    const userLang = getUserLanguage(req);

    // Валідація ціни
    if (price && price <= 0) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.invalid_price"),
      });
    }

    // Валідація кількості
    if (stock && stock < 0) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.invalid_stock"),
      });
    }

    // Get current tree to check for old image
    const currentTree = await TreeSchema.findOne({
      _id: id,
      seller: req.userId,
    });

    if (!currentTree) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    // If imageUrl is being updated and it's different from current, delete old image
    if (imageUrl !== undefined && imageUrl !== currentTree.imageUrl) {
      deleteOldImageFile(currentTree.imageUrl);
    }

    // Знаходимо та оновлюємо тільки товари поточного продавця
    const updatedTree = await TreeSchema.findOneAndUpdate(
      {
        _id: id,
        seller: req.userId, // ⬅️ ВАЖЛИВО: тільки свої товари
      },
      { $set: { title, description, price, imageUrl, category, stock } },
      { new: true },
    )
      .populate("category")
      .populate("seller", "fullName sellerInfo.nurseryName");

    res.status(200).json({
      ...updatedTree.toObject(),
      message: t(userLang, "success.tree.updated"),
    });
  } catch (error) {
    logger.error("Помилка оновлення товару продавцем", {
      error: error.message,
      stack: error.stack,
      treeId: req.params.id,
      sellerId: req.userId,
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.update_failed"),
    });
  }
};

export const deleteSellerTree = async (req, res) => {
  try {
    const { id } = req.params;
    const userLang = getUserLanguage(req);

    // ✅ Спочатку знаходимо товар щоб отримати imageUrl
    const treeToDelete = await TreeSchema.findOne({
      _id: id,
      seller: req.userId,
    });

    if (!treeToDelete) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    // Видаляємо фото (Cloudinary або локальне)
    await deleteOldImageFile(treeToDelete.imageUrl);

    // Видаляємо товар з бази
    await TreeSchema.findByIdAndDelete(id);

    res.json({
      message: t(userLang, "success.tree.deleted"),
    });
  } catch (error) {
    logger.error("Помилка видалення товару продавця", {
      error: error.message,
      stack: error.stack,
      treeId: req.params.id,
      sellerId: req.userId,
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.delete_failed"),
    });
  }
};

export const getTreeById = async (req, res) => {
  try {
    const { id } = req.params;
    const userLang = getUserLanguage(req);

    const tree = await TreeSchema.findById(id)
      .populate("category")
      .populate("seller", "fullName sellerInfo.nurseryName");

    if (!tree) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    res.json(tree);
  } catch (err) {
    logger.error("Помилка отримання дерева за ID", {
      error: err.message,
      stack: err.stack,
      treeId: req.params.id,
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.fetch_failed"),
    });
  }
};
