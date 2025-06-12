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
  verificationToken: String,
  verificationTokenExpires: Date,
  isActive: {
    type: Boolean,
    default: true,
  },
  resetToken: String,
  resetTokenExpires: Date,
  buyerInfo: {
    purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }], // array of order IDs
  },
});

export default mongoose.model("User", UserSchema);
