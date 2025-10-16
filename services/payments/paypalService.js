// Поки що базова структура, детальну інтеграцію додамо пізніше
export class PayPalService {
  constructor() {
    this.clientId = process.env.PAYPAL_CLIENT_ID;
    this.clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    this.mode = process.env.PAYPAL_MODE || 'sandbox'; // sandbox або live
  }

  async createOrder(amount, currency = 'MDL') {
    // Тут буде логіка створення замовлення в PayPal
    console.log('Creating PayPal order:', amount, currency);
  }

  async capturePayment(orderId) {
    // Тут буде логіка захоплення платежу
    console.log('Capturing PayPal payment:', orderId);
  }
}

export default new PayPalService();