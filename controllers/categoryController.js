import CategorySchema from "../models/category.js";
import slugify from "slugify";
import { getUserLanguage } from "../utils/langDetector.js";
import { t } from '../localisation.js';
import path from "path";
import fs from "fs";

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
    console.error("Create category error:", error);
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
    console.error("Get categories error:", error);
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

    if (!updated) {
      return res
        .status(404)
        .json({ message: t(userLang, "errors.category.not_found") });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: t(userLang, "success.category.updated") });
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

    // ✅ FIX 2: Foto löschen falls vorhanden
    if (categoryToDelete.imageUrl) {
      try {
        // Dateiname aus URL extrahieren
        const filename = categoryToDelete.imageUrl.replace("/uploads/", "");
        const filePath = path.resolve("uploads", filename);
        
        // Prüfen ob Datei existiert und löschen
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Synchron löschen
          console.log(`✅ Kategorie-Foto gelöscht: ${filename}`);
        } else {
          console.log(`⚠️ Foto-Datei nicht gefunden: ${filename}`);
        }
      } catch (imageError) {
        console.error("❌ Fehler beim Löschen des Kategorie-Fotos:", imageError);
        // Weitermachen - Kategorie trotzdem löschen
      }
    }

    // ✅ FIX 3: Kategorie aus Datenbank löschen
    const deleted = await CategorySchema.findByIdAndDelete(categoryId);
    
    console.log(`✅ Kategorie gelöscht: ${categoryId}`);
    
    res.json({ 
      message: t(userLang, "success.category.deleted"),
      deletedCategory: {
        id: deleted._id,
        name: deleted.name,
        imageDeleted: !!categoryToDelete.imageUrl
      }
    });
    
  } catch (err) {
    console.error("❌ Fehler beim Löschen der Kategorie:", err);
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
    console.error('Get category by slug error:', error);
    const userLang = getUserLanguage(req);
    res.status(500).json({ 
      message: t(userLang, "errors.server_error")
    });
  }
};