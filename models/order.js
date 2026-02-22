import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  // Базова інформація
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  guestEmail: String,
  guestName: String,
  
  // Товари
  items: [{
    treeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tree'
    },
    title: {
      ru: String,
      ro: String,
    },
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  
  // Фінанси
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'MDL'
  },
  
  // Статуси
  status: {
    type: String,
    enum: [
      'awaiting_payment',  // Очікує оплати
      'paid',              // Оплачено
      'processing',        // Обробляється
      'shipped',           // Відправлено
      'delivered',         // Доставлено
      'cancelled'          // Скасовано
    ],
    default: 'awaiting_payment'
  },
  
  paymentStatus: {
    type: String,
    enum: ['unpaid', 'paid', 'partial', 'refunded'],
    default: 'unpaid'
  },
  
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash', 'card'],
    default: 'bank_transfer'
  },
  
  // Адреса доставки
  shippingAddress: {
    name: String,
    email: String,
    phone: String,
    address: String,
    city: String,
    country: String,
    postalCode: String
  },
  
  // Рахунок
  invoice: {
    number: String,
    pdfUrl: String,
    sentAt: Date,
    sentTo: String
  },
  
  // Нотатки
  customerNotes: String,
  adminNotes: String,
  
  // Дати
  paidAt: Date,
  shippedAt: Date,
  deliveredAt: Date
  
}, {
  timestamps: true
});

// Генерація номера замовлення
OrderSchema.pre('validate', async function(next) {
  if (!this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const lastOrder = await mongoose.model('Order').findOne().sort({ orderNumber: -1 }).select('orderNumber');
    let nextNum = 1;
    if (lastOrder?.orderNumber) {
      const lastNum = parseInt(lastOrder.orderNumber.split('-').pop(), 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }
    this.orderNumber = `ORD-${year}${month}-${String(nextNum).padStart(4, '0')}`;
  }
  next();
});

export default mongoose.model('Order', OrderSchema);