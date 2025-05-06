import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema(
  {
    name: {
      ru: { type: String, required: true },
      en: { type: String },
      ro: { type: String },
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Category", CategorySchema);
