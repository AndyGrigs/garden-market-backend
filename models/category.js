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
    imageUrl: {
      type: String
    },
  },
  { timestamps: true }
);
CategorySchema.index({ slug: 1 }); 
CategorySchema.index({ 'name.ru': 1 });


CategorySchema.index({ createdAt: -1 }); 
CategorySchema.index({ 'name.en': 1 }); 
CategorySchema.index({ 'name.ro': 1 }); 
export default mongoose.model("Category", CategorySchema);
