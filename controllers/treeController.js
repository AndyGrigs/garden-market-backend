import TreeSchema from "../models/tree.js";
import { t } from "../localisation.js";

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

    const tree = new TreeSchema({
      title,
      description,
      price,
      imageUrl,
      category,
      stock,
    });

    await tree.save();
    const populatedTree = await TreeSchema.findById(tree._id).populate(
      "category"
    );

    res.status(201).json({
      ...populatedTree.toObject(),
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
    console.log("Fetching trees with categories...");
    const userLang = getUserLanguage(req);

    const trees = await TreeSchema.find().populate("category");

    console.log("Found trees:", trees.length);
    console.log("Sample tree with category:", trees[0]);

    // Перевіримо кожне дерево на наявність категорії
    trees.forEach((tree, index) => {
      console.log(`Tree ${index}:`, {
        id: tree._id,
        title: tree.title?.ru || "No title",
        category: tree.category
          ? {
              id: tree.category._id,
              name: tree.category.name,
            }
          : "No category",
      });
    });

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

    console.log("Updating tree with category:", category);

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
        message: t(userLang, "errors.tree.not_found") 
      });
    }

    console.log('Updated tree with category:', updatedTree.category);
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

export const deleteTree = async (req, res) => {
  try {
    const treeId = req.params.id;
    const userLang = getUserLanguage(req);
    
    const deleted = await TreeSchema.findByIdAndDelete(treeId);
    
    if (!deleted) {
      return res.status(404).json({ message: t(userLang, "errors.tree.not_found") });
    }
    
    res.json({message: t(userLang, "success.tree.deleted") });
  } catch (err) {
    console.log(err);
    const userLang = getUserLanguage(req);
    res.status(500).json({ message: t(userLang, "errors.tree.delete_failed") });
  }
};
