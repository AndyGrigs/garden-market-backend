import TreeSchema from "../models/tree.js";
import { t } from "../localisation.js";
import { getUserLanguage } from "../utils/langDetector.js";
import fs from "fs";
import path from "path";
import { createNotification } from "./notificationController.js";
import { notifyAllAdmins } from "../config/adminConfig.js"; 


export const createTree = async (req, res) => {
  try {
    const { title, description, price, imageUrl, category, stock } = req.body;
    const userLang = getUserLanguage(req);

    if (!title || !title.ru || !title.en || !title.ro) {
      return res.status(400).json({
        message: t(userLang, "errors.tree.title_required"),
      });
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

    // ⬇️ СПОВІЩЕННЯ ЯКЩО ПРОДАВЕЦЬ СТВОРЮЄ ТОВАР
    if (req.userRole === 'seller') {
      try {
        const sellerData = await UserModel.findById(req.userId).select('fullName sellerInfo email');
        
        // Створюємо сповіщення в базі
        await createNotification({
          type: 'new_product_created',
          title: 'Новьій товар от продавца',
          message: `Продавец ${sellerData?.fullName} Добавил товар: "${title.ru}". Нужно добавить перевод.`,
          data: {
            userId: req.userId,
            productId: tree._id,
            sellerInfo: {
              nurseryName: sellerData?.sellerInfo?.nurseryName,
              fullName: sellerData?.fullName,
            }
          }
        });

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
    const populatedTree = await TreeSchema.findById(tree._id)
      .populate("category")
      .populate("seller", "fullName sellerInfo.nurseryName");

    res.status(201).json({
      ...populatedTree.toObt(),
      message: t(userLang, "success.tree.created"),
    });
  } catch (error) {
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

// Додай в кінець файлу controllers/treeController.js

// Отримати товари конкретного продавця
export const getSellerTrees = async (req, res) => {
  try {
    const userLang = getUserLanguage(req);
    
    const trees = await TreeSchema.find({ 
      seller: req.userId,
      isActive: true 
    })
    .populate("category")
    .populate("seller", "fullName sellerInfo.nurseryName")
    .sort({ createdAt: -1 });

    res.json({
      trees,
      message: t(userLang, "success.tree.fetched")
    });
  } catch (error) {
    console.error("Error fetching seller trees:", error);
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.tree.fetch_failed"),
    });
  }
};

// Оновити товар (тільки власні)
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
        seller: req.userId // ⬅️ ВАЖЛИВО: тільки свої товари
      },
      { $set: { title, description, price, imageUrl, category, stock } },
      { new: true }
    )
    .populate("category")
    .populate("seller", "fullName sellerInfo.nurseryName");

    if (!updatedTree) {
      return res.status(404).json({ 
        message: t(userLang, "errors.tree.not_found") 
      });
    }

    res.status(200).json({
      ...updatedTree.toObject(),
      message: t(userLang, "success.tree.updated")
    });
  } catch (error) {
    console.error(error);
    const userLang = getUserLanguage(req);
    res.status(500).json({ 
      message: t(userLang, "errors.tree.update_failed") 
    });
  }
};

// Видалити товар (тільки свій)
export const deleteSellerTree = async (req, res) => {
  try {
    const { id } = req.params;
    const userLang = getUserLanguage(req);
    
    // Знаходимо та видаляємо тільки товари поточного продавця
    const deletedTree = await TreeSchema.findOneAndUpdate(
      { 
        _id: id, 
        seller: req.userId // ⬅️ ВАЖЛИВО: тільки свої товари
      },
      { isActive: false }, // М'яке видалення
      { new: true }
    );
    
    if (!deletedTree) {
      return res.status(404).json({ 
        message: t(userLang, "errors.tree.not_found") 
      });
    }
    
    res.json({
      message: t(userLang, "success.tree.deleted")
    });
  } catch (error) {
    console.error(error);
    const userLang = getUserLanguage(req);
    res.status(500).json({ 
      message: t(userLang, "errors.tree.delete_failed") 
    });
  }
};
