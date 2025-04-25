import TreeSchema from "../models/tree.js";

export const createTree = async (req, res) => {
  try {
    const { title, description, price, imageUrl, category, stock } = req.body;

    const tree = new TreeSchema({
      title,
      description,
      price,
      imageUrl,
      category,
      stock,
    });

    await tree.save();
    res.status(201).json(tree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Не вдалося створити товар' });
  }
};


export const getAllTrees = async (req, res) => {
    try {
      const trees = await TreeSchema.find().populate('category');
      res.json(trees);
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Помилка отримання товарів' });
    }
  };


  export const deleteTree = async (req, res) => {
    try {
      const treeId = req.params.id;
  
      const deleted = await TreeSchema.findByIdAndDelete(treeId);
  
      if (!deleted) {
        return res.status(404).json({ message: 'Товар не знайдено' });
      }
  
      res.json({ message: 'Товар видалено успішно' });
    } catch (err) {
      console.log(err)
      res.status(500).json({ message: 'Помилка при видаленні товару' });
    }
  };
  