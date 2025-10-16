import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // для гостей
  },
  guestEmail: String, // для гостей
  items: [{
    treeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tree'
    },
    title: String,
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  // ⬇️ ДОДАЙ ЦЕ:
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment'
  },
  paymentMethod: String,
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'failed'],
    default: 'unpaid'
  },
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String,
    country: String,
    postalCode: String
  }
}, {
  timestamps: true
});

export default mongoose.model('Order', OrderSchema);