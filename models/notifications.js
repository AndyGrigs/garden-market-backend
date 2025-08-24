import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['new_seller_registration', 'new_product_created', 'seller_approved', 'other'],
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  data: {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tree' },
    sellerInfo: {
      nurseryName: String,
      email: String,
      fullName: String,
    },

  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  readAt: {
    type: Date,
  },
}, { timestamps: true });


NotificationSchema.index({ isRead: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });

export default mongoose.model("Notification", NotificationSchema);