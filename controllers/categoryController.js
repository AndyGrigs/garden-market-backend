import CategorySchema from "../models/category.js";
import slugify from "slugify";
import { getUserLanguage } from "../utils/langDetector.js";
import { t } from '../localisation.js';
import { deleteOldImageFile } from "./uploadController.js";
import logger from '../config/logger.js';

export const createCategory = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;
    const userLang = getUserLanguage(req);
    if (!name || !name.ru) {
      return res
        .status(400)
        .json({ message: t(userLang, "errors.category.ru_required") });
    }

    const existing = await CategorySchema.findOne({ "name.ru": name.ru });
    if (existing) {
      return res
        .status(400)
        .json({ message: t(userLang, "errors.category.already_exists") });
    }

    const slug = slugify(name.ru, { lower: true });

    const doc = new CategorySchema({ name, slug, imageUrl });
    const saved = await doc.save();

    res.status(201).json(saved);
  } catch (error) {
    logger.error("Помилка створення категорії", {
      error: error.message,
      stack: error.stack,
      categoryName: req.body.name?.ru,
      userId: req.userId
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.server_error"),
    });
  }
};

export const getCategories = async (req, res) => {
  try {
   
    const categories = await CategorySchema.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    logger.error("Помилка отримання категорій", {
      error: error.message,
      stack: error.stack
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.category.fetch_failed"),
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, imageUrl } = req.body;
    const userLang = getUserLanguage(req);

    if (!name || !name.ru) {
      return res
        .status(400)
        .json({ message: t(userLang, "errors.category.ru_required") });
    }

    const existing = await CategorySchema.findOne({
      "name.ru": name.ru,
      _id: { $ne: categoryId },
    });

    if (existing) {
      return res.status(400).json({
        message: t(userLang, "errors.category.already_exists"),
      });
    }

    // Get current category to check for old image
    const currentCategory = await CategorySchema.findById(categoryId);
    if (!currentCategory) {
      return res
        .status(404)
        .json({ message: t(userLang, "errors.category.not_found") });
    }

    // If imageUrl is being updated and it's different from current, delete old image
    if (imageUrl !== undefined && imageUrl !== currentCategory.imageUrl) {
      deleteOldImageFile(currentCategory.imageUrl);
    }

    const slug = slugify(name.ru, { lower: true });

    let updateData = { name, slug };
    if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl;
    }

    const updated = await CategorySchema.findByIdAndUpdate(
      categoryId,
      updateData,
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    logger.error("Помилка оновлення категорії", {
      error: err.message,
      stack: err.stack,
      categoryId: req.params.id,
      userId: req.userId
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({ message: t(userLang, "errors.server_error") });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const userLang = getUserLanguage(req);
    
    // ✅ FIX 1: Erst die Kategorie finden um imageUrl zu bekommen
    const categoryToDelete = await CategorySchema.findById(categoryId);
    
    if (!categoryToDelete) {
      return res.status(404).json({ 
        message: t(userLang, "errors.category.not_found") 
      });
    }

    // Видаляємо фото (Cloudinary або локальне)
    await deleteOldImageFile(categoryToDelete.imageUrl);

    // ✅ FIX 3: Kategorie aus Datenbank löschen
    const deleted = await CategorySchema.findByIdAndDelete(categoryId);
    
    
    res.json({ 
      message: t(userLang, "success.category.deleted"),
      deletedCategory: {
        id: deleted._id,
        name: deleted.name,
        imageDeleted: !!categoryToDelete.imageUrl
      }
    });
    
  } catch (err) {
    logger.error("Помилка видалення категорії", {
      error: err.message,
      stack: err.stack,
      categoryId: req.params.id
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.category.delete_failed"),
      error: err.message
    });
  }
};

export const getCategoryBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userLang = getUserLanguage(req);

    const category = await CategorySchema.findOne({ slug });

    if (!category) {
      return res.status(404).json({ 
        message: t(userLang, "errors.category.not_found")
      });
    }

    res.json({
      category,
      message: t(userLang, "success.category.fetched")
    });
  } catch (error) {
    logger.error('Помилка отримання категорії за slug', {
      error: error.message,
      stack: error.stack,
      slug: req.params.slug
    });
    const userLang = getUserLanguage(req);
    res.status(500).json({
      message: t(userLang, "errors.server_error")
    });
  }
};