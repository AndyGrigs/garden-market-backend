import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // може бути гість
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'MDL' // Молдавський лей
  },
  paymentMethod: {
    type: String,
    enum: ['paypal', 'runpay', 'paynet', 'card'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: {
    type: String, // ID з платіжної системи
    unique: true,
    sparse: true
  },
  paymentDetails: {
    type: mongoose.Schema.Types.Mixed, // Деталі з платіжної системи
  },
  failureReason: String,
  paidAt: Date
}, {
  timestamps: true
});

export default mongoose.model('Payment', PaymentSchema);