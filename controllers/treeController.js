import fs from "fs";
import path from "path";
import TreeSchema from "../models/tree.js";
import UserSchema from "../models/user.js";
import emailService from "../services/emailService.js";
import { t } from "../localisation.js";
import { getUserLanguage } from "../utils/langDetector.js";
import { createNotification } from "./notificationController.js";
import { notifyAllAdmins } from "../config/adminConfig.js";

export const createTree = async (req, res) => {
  try {
    const { title, description, price, imageUrl, category, stock } = req.body;
    const userLang = getUserLanguage(req);

    // Валідація для адмінів (всі мови обов'язкові)
    if (req.userRole === "admin") {
      if (!title || !title.ru || !title.en || !title.ro) {
        return res.status(400).json({
          message: t(userLang, "errors.tree.title_required"),
        });
      }
      if (
        !description ||
        !description.ru ||
        !description.en ||
        !description.ro
      ) {
        return res.status(400).json({
          message: t(userLang, "errors.tree.description_required"),
        });
      }
    }

    // Валідація для продавців (тільки російська обов'язкова)
    if (req.userRole === "seller") {
      if (!title || !title.ru) {
        return res.status(400).json({
          message: t(userLang, "errors.tree.title_ru_required"),
        });
      }
      if (!description || !description.ru) {
        return res.status(400).json({
          message: t(userLang, "errors.tree.description_ru_required"),
        });
      }
    }

    if (!price || price <= 0) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.invalid_price"),
      });
    }

    if (!category) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.category_required"),
      });
    }

    if (stock && stock < 0) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.invalid_stock"),
      });
    }

    // Для продавців - автоматично додаємо їх ID
    // Для адмінів - можна вказати конкретного продавця
    let sellerId = req.userId; // За замовчуванням - поточний користувач

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
    });

    await tree.save();

    // ⬇️ СПОВІЩЕННЯ ЯКЩО ПРОДАВЕЦЬ СТВОРЮЄ ТОВАР
    if (req.userRole === "seller") {
      try {
        const sellerData = await UserSchema.findById(req.userId).select(
          "fullName sellerInfo email"
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
          price: price,
          sellerInfo: {
            fullName: sellerData?.fullName,
            nurseryName: sellerData?.sellerInfo?.nurseryName,
            email: sellerData?.email,
          },
          createdTime: new Date().toLocaleString("uk-UA"),
        });

        console.log("✅ Сповіщення про новий товар створено:", title.ru);
      } catch (notificationError) {
        console.error("❌ Помилка створення сповіщення:", notificationError);
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
    console.error("Error creating tree:", error); // ⬅️ ДОДАНО логування помилки
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.create_failed"),
    });
  }
};

export const getAllTrees = async (req, res) => {
  try {
    const trees = await TreeSchema.find({ isActive: true })
      .populate("category")
      .populate("seller", "fullName sellerInfo.nurseryName");

    res.json(trees);
  } catch (err) {
    console.error("Error fetching trees:", err);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.fetch_failed"),
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

    const updatedTree = await TreeSchema.findByIdAndUpdate(
      id,
      { $set: { title, description, price, imageUrl, category, stock } },
      { new: true }
    ).populate("category");

    if (!updatedTree) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    res.status(200).json({
      ...updatedTree.toObject(),
      message: t(userLang, "success.tree.updated"),
    });
  } catch (error) {
    console.error(error);
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

    // ✅ FIX 2: Видаляємо фото якщо воно є
    if (treeToDelete.imageUrl) {
      try {
        // Отримуємо ім'я файлу з URL
        const filename = treeToDelete.imageUrl.replace("/uploads/", "");
        const filePath = path.resolve("uploads", filename);

        // Перевіряємо чи існує файл
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Синхронно видаляємо файл
          console.log(`✅ Фото видалено: ${filename}`);
        } else {
          console.log(`⚠️ Файл не знайдено: ${filename}`);
        }
      } catch (imageError) {
        console.error("❌ Помилка видалення фото:", imageError);
        // Не зупиняємо процес - продовжуємо видаляти дерево
      }
    }

    // ✅ FIX 3: Тепер видаляємо дерево з бази
    const deleted = await TreeSchema.findByIdAndDelete(treeId);

    console.log(`✅ Дерево видалено з бази: ${treeId}`);

    res.json({
      message: t(userLang, "success.tree.deleted"),
      deletedTree: {
        id: deleted._id,
        title: deleted.title,
        imageDeleted: !!treeToDelete.imageUrl,
      },
    });
  } catch (err) {
    console.error("❌ Помилка видалення дерева:", err);
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
    console.error("Error fetching seller trees:", error);
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

    // Знаходимо та оновлюємо тільки товари поточного продавця
    const updatedTree = await TreeSchema.findOneAndUpdate(
      {
        _id: id,
        seller: req.userId, // ⬅️ ВАЖЛИВО: тільки свої товари
      },
      { $set: { title, description, price, imageUrl, category, stock } },
      { new: true }
    )
      .populate("category")
      .populate("seller", "fullName sellerInfo.nurseryName");

    if (!updatedTree) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    res.status(200).json({
      ...updatedTree.toObject(),
      message: t(userLang, "success.tree.updated"),
    });
  } catch (error) {
    console.error(error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.update_failed"),
    });
  }
};

/*
    const deletedTree = await TreeSchema.findOneAndDelete({
  _id: id, 
  seller: req.userId 
});
    */
export const deleteSellerTree = async (req, res) => {
  try {
    const { id } = req.params;
    const userLang = getUserLanguage(req);

    // Знаходимо та видаляємо тільки товари поточного продавця
    const deletedTree = await TreeSchema.findOneAndUpdate({
      _id: id,
      seller: req.userId,
    });

    if (!deletedTree) {
      return res.status(404).json({
        message: t(userLang, "errors.tree.not_found"),
      });
    }

    if (treeToDelete.imageUrl) {
        try {
        const filename = treeToDelete.imageUrl.replace("/uploads/", "");
        const filePath = path.resolve("uploads", filename);

        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          console.log(`✅ Фото видалено: ${filename}`);
        } else {
          console.log(`⚠️ Файл не знайдено: ${filename}`);
        }
      } catch (imageError) {
        console.error("❌ Помилка видалення фото:", imageError);
      }
    }

    res.json({
      message: t(userLang, "success.tree.deleted"),
    });
  } catch (error) {
    console.error(error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.delete_failed"),
    });
  }
};
