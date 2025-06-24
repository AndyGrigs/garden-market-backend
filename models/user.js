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
  language: { type: String, enum: ["ru", "ro", "en"], default: "en" },
  avatarUrl: String,
  role: {
    type: String,
    enum: ["buyer", "seller", "admin"],
    default: "buyer",
  },

  sellerInfo: {
    nurseryName: String,
    address: String,
    phoneNumber: String,
    treeVarieties: [{ type: String }],
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
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  buyerInfo: {
    purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  },
});

export default mongoose.model("User", UserSchema);
