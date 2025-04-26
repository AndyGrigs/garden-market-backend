import CategorySchema from "../models/category.js";
import slugify from "slugify";

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const existing = await CategorySchema.findOne({ name });
    if (existing) {
      return res.stasus(400).json({ message: "Категория уже есть" });
    }
    const slug = slugify(name, { lower: true });

    const category = new CategorySchema({ name, slug });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "ошибка!" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const categories = await CategorySchema.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Помилка отримання категорій' });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { name } = req.body;

    const updated = await CategorySchema.findByIdAndUpdate(
      categoryId,
      { name, slug: slugify(name, { lower: true }) },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Помилка оновлення категорії' });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    const deleted = await CategorySchema.findByIdAndDelete(categoryId);

    if (!deleted) {
      return res.status(404).json({ message: 'Категорію не знайдено' });
    }

    res.json({ message: 'Категорія видалена успішно' });
  } catch (err) {
    res.status(500).json({ message: 'Помилка при видаленні категорії' });
  }
};

