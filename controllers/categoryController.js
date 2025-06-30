import CategorySchema from "../models/category.js";
import slugify from "slugify";

export const createCategory = async (req, res) => {
  try {
    const { name, imageUrl } = req.body;

    if (!name || !name.ru) {
      return res.status(400).json({ message: "Поле ru обязательно" });
    }

    const existing = await CategorySchema.findOne({ "name.ru": name.ru });
    if (existing) {
      return res.status(400).json({ message: "Категория уже есть" });
    }

    const slug = slugify(name.ru, { lower: true });

    const doc = new CategorySchema({ name, slug, imageUrl });
    const saved = await doc.save();

    res.status(201).json(saved);
  } catch (error) {
    res.status(500).json({ message: "ошибка!" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await CategorySchema.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Помилка отримання категорій" });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name, imageUrl } = req.body;

    if (!name || !name.ru) {
      return res.status(400).json({ message: "Поле ru обязательно" });
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
      return res.status(404).json({ message: "Категорію не знайдено" });
    }
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Помилка оновлення категорії" });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const deleted = await CategorySchema.findByIdAndDelete(categoryId);

    if (!deleted) {
      return res.status(404).json({ message: "Категорію не знайдено" });
    }

    res.json({ message: "Категорія видалена успішно" });
  } catch (err) {
    res.status(500).json({ message: "Помилка при видаленні категорії" });
  }
};
