import mongoose from "mongoose";

const TreeSchema = new mongoose.Schema(
  {
    title: {
      ru: { type: String },
      ro: { type: String},
      // en: { type: String },
    },
    description: {
      ru: { type: String },
      ro: { type: String },
      // en: { type: String },
    },
    price: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    stock: {
      type: Number,
      default: 0,
    },
    imageUrl: { type: String },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Tree", TreeSchema);
