import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  name: { type: String },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});
reviewSchema.index({ user: 1 });
reviewSchema.index({ createdAt: -1 });
reviewSchema.index({ rating: 1 });
export default mongoose.model("Review", reviewSchema);
