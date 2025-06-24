import mongoose from 'mongoose';

const guestReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('GuestReview', guestReviewSchema);

