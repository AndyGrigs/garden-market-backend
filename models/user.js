import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  language: { type: String, enum: ["ru", "ro", "en"], default: "ru" },
  avatarUrl: String,
  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    default: "buyer",
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  verificationCode: String,
  verificationCodeExpires: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  resetCode: String,
  resetCodeExpires: Date,
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
  buyerInfo: {
    purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
  sellerInfo: {
    nurseryName: String,
    address: String,
    phoneNumber: String,

    isApproved: {
      type: Boolean,
      default: false,
    },
    businessLicense: String,
    description: String,
    registrationDate: {
      type: Date,
      default: Date.now,
    },
  },
});

export default mongoose.model("User", UserSchema);
