import mongoose from 'mongoose';

const TreeSchema = new mongoose.Schema({
  title: {
    ru: { type: String, required: true },
    ro: { type: String, required: true },
    en: { type: String, required: true },
  },
  description: {
    ru: { type: String, required: true },
    ro: { type: String, required: true },
    en: { type: String, required: true },
  },
  price: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  stock: {
    type: Number,
    default: 0
  },
  imageUrl: {type: String},

}, { timestamps: true });

export default mongoose.model('Tree', TreeSchema);
