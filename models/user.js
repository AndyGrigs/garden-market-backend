import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  passwordHash: {
    type: String,
    required: true
  },
  avatarUrl: String,
  role: {
    type: String,
    enum: ['buyer', 'seller', 'admin'],
    default: 'buyer'
  },
  
  sellerInfo: {
    nurseryName: String,
    address: String,
    phoneNumber: String,
    treeVarieties: [{ type: String }] // array of tree varieties sold by the seller
  },
  // Additional fields for buyers
  buyerInfo: {
    purchaseHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }] // array of order IDs
  },
  timestamps: true,
});

export default mongoose.model('User', UserSchema);