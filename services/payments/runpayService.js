// Базова структура для RunPay
export class RunPayService {
  constructor() {
    this.apiKey = process.env.RUNPAY_API_KEY;
    this.merchantId = process.env.RUNPAY_MERCHANT_ID;
  }

  async initiatePayment(amount, orderId) {
    console.log('Initiating RunPay payment:', amount, orderId);
    // Логіка буде додана після отримання API ключів
  }
}

export default new RunPayService();