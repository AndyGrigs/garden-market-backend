import mongoose from 'mongoose';

const TreeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  imageUrl: String,
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  stock: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Tree', TreeSchema);
