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


// export const getAllTrees = async (req, res) => {
//     try {
//       const trees = await TreeSchema.find().populate('category');
//       res.json(trees);
//     } catch (err) {
//       console.log(err)
//       res.status(500).json({ message: 'Помилка отримання товарів' });
//     }
//   };

export const getAllTrees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const trees = await TreeSchema
      .find()
      .populate('category')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await TreeSchema.countDocuments();

    res.json({
      trees,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      totalItems: total
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching trees' });
  }
};


  export const updateTree = async (req, res) => {
    try {
      const { id } = req.params;
      const { title, description, price, imageUrl, category, stock } = req.body;
  
      const updatedTree = await TreeSchema.findByIdAndUpdate(
        id,
        { $set: { title, description, price, imageUrl, category, stock } },
        { new: true }
      );
  
      if (!updatedTree) {
        return res.status(404).json({ message: "Tree not found" });
      }
  
      res.status(200).json(updatedTree);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Failed to update tree" });
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
  