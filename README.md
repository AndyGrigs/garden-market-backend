# 🌳 Garden Market Backend API

Backend API для інтернет-магазину садових рослин та дерев.

## 📋 Зміст

- [Особливості](#особливості)
- [Технології](#технології)
- [Встановлення](#встановлення)
- [Налаштування](#налаштування)
- [Запуск](#запуск)
- [Платіжні системи](#платіжні-системи)
- [API Endpoints](#api-endpoints)
- [Структура проекту](#структура-проекту)

## ✨ Особливості

- 🔐 Автентифікація та авторизація (JWT)
- 👥 Система ролей (Admin, Seller, Buyer)
- 🌲 Управління товарами (дерева, рослини)
- 📦 Система замовлень
- 💳 Інтеграція з платіжними системами:
  - Stripe (міжнародні платежі)
  - PayPal
  - RunPay (Молдова)
  - PayNet (Молдова)
- ⭐ Система відгуків
- 📧 Email сповіщення
- 🖼️ Завантаження та обробка зображень
- 🔔 Система сповіщень для адміністраторів
- 🌍 Мультимовність (підтримка української, російської, румунської)

## 🛠 Технології

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT, bcrypt
- **Payment Gateways**: Stripe, PayPal, RunPay, PayNet
- **File Upload**: Multer
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: express-rate-limit, cookie-parser, cors

## 📥 Встановлення

### Вимоги
- Node.js >= 18.0.0
- npm >= 8.0.0
- MongoDB Atlas account або локальна MongoDB

### Кроки встановлення

1. Клонуйте репозиторій:
```bash
git clone <repository-url>
cd garden-market-backend
```

2. Встановіть залежності:
```bash
npm install
```

3. Створіть `.env` файл на основі `.env.example`:
```bash
cp .env.example .env
```

4. Налаштуйте змінні середовища у файлі `.env`

## ⚙️ Налаштування

### 1. MongoDB
Отримайте connection string з MongoDB Atlas та додайте в `.env`:
```env
DATABASE_URL='mongodb+srv://username:password@cluster.mongodb.net/database'
```

### 2. JWT Secret
Згенеруйте секретний ключ для JWT:
```env
JWT_SECRET='your_random_secret_key_here'
```

### 3. Email (SMTP)
Налаштуйте SMTP для відправки email:
```env
EMAIL_USER=your_email@domain.com
EMAIL_PASS=your_email_password
SMTP_HOST=mail.yourdomain.com
SMTP_PORT=465
BASE_URL=https://yourdomain.com
```

### 4. Admin Account
Налаштуйте перший admin акаунт:
```env
ADMIN_NAME='Admin Name'
ADMIN_EMAIL='admin@example.com'
ADMIN_PASSWORD='SecurePassword123!'
```

## 💳 Платіжні системи

### Stripe (рекомендовано)
**Швидкий старт**: [QUICK_START_STRIPE.md](./QUICK_START_STRIPE.md)
**Повна документація**: [STRIPE_SETUP.md](./STRIPE_SETUP.md)

```env
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

### PayPal
```env
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
PAYPAL_MODE=sandbox  # або 'live' для продакшну
```

### RunPay (Молдова)
```env
RUNPAY_API_KEY=your_runpay_api_key
RUNPAY_MERCHANT_ID=your_merchant_id
```

### PayNet (Молдова)
```env
PAYNET_MERCHANT_ID=your_paynet_merchant_id
PAYNET_MERCHANT_KEY=your_paynet_merchant_key
```

## 🚀 Запуск

### Development режим (з hot reload)
```bash
npm run dev
```

### Production режим
```bash
npm start
```

Сервер запуститься на `http://127.0.0.1:4444` (або на порту вказаному в `PORT`)

## 📚 API Endpoints

### Аутентифікація
```
POST   /auth/register          - Реєстрація
POST   /auth/login             - Вхід
POST   /auth/logout            - Вихід
GET    /auth/me                - Отримати поточного користувача
POST   /auth/verify-email      - Підтвердити email
POST   /auth/send-reset-code   - Відправити код скидання пароля
POST   /auth/reset-password    - Скинути пароль
GET    /user/saved-address     - Отримати збережену адресу
```

### Категорії
```
GET    /categories             - Отримати всі категорії
POST   /categories             - Створити категорію (Admin)
PATCH  /categories/:id         - Оновити категорію (Admin)
DELETE /categories/:id         - Видалити категорію (Admin)
```

### Товари (Дерева)
```
GET    /trees                  - Отримати всі дерева

# Admin endpoints
POST   /admin/trees            - Створити дерево (Admin)
PATCH  /admin/trees/:id        - Оновити дерево (Admin)
DELETE /admin/trees/:id        - Видалити дерево (Admin)

# Seller endpoints
GET    /seller/trees           - Отримати дерева продавця (Seller)
POST   /seller/trees           - Створити дерево (Seller)
PATCH  /seller/trees/:id       - Оновити дерево (Seller)
DELETE /seller/trees/:id       - Видалити дерево (Seller)
```

### Замовлення
```
GET    /orders/user/:userId    - Отримати замовлення користувача
POST   /orders                 - Створити замовлення
PATCH  /orders/:id/status      - Оновити статус замовлення (Admin)
```

### Платежі

#### Stripe
```
GET    /payments/stripe/config           - Отримати публічний ключ
POST   /payments/stripe/create-intent    - Створити Payment Intent
POST   /payments/stripe/confirm          - Підтвердити платіж
POST   /payments/stripe/webhook          - Webhook від Stripe
```

#### PayPal
```
POST   /payments/paypal/create-order     - Створити замовлення
POST   /payments/paypal/capture          - Захопити платіж
```

#### RunPay
```
POST   /payments/runpay/create           - Створити платіж
POST   /payments/runpay/webhook          - Webhook від RunPay
```

#### PayNet
```
POST   /payments/paynet/create           - Створити платіж
POST   /payments/paynet/callback         - Callback від PayNet
```

#### Загальні
```
POST   /payments                         - Створити платіж
GET    /payments/:id                     - Отримати платіж
POST   /payments/webhook                 - Загальний webhook
```

### Відгуки
```
GET    /api/reviews                      - Отримати всі відгуки
POST   /api/reviews                      - Створити відгук
GET    /api/reviews/user/:userId         - Отримати відгуки користувача
PATCH  /api/reviews/:id                  - Оновити відгук
DELETE /api/reviews/:id                  - Видалити відгук
```

### Сповіщення (Admin)
```
GET    /admin/notifications              - Отримати всі сповіщення
POST   /admin/notifications              - Створити сповіщення
GET    /admin/notifications/unread-count - Кількість непрочитаних
PATCH  /admin/notifications/:id/read     - Позначити як прочитане
PATCH  /admin/notifications/mark-all-read - Позначити всі як прочитані
DELETE /admin/notifications/:id          - Видалити сповіщення
```

### Управління продавцями (Admin)
```
GET    /admin/sellers/pending            - Отримати запити продавців
PATCH  /admin/sellers/:userId/approve    - Затвердити продавця
DELETE /admin/sellers/:userId/reject     - Відхилити продавця
```

### Завантаження файлів
```
POST   /upload                           - Завантажити зображення
DELETE /delete-image/:filename           - Видалити зображення
GET    /image-info/:filename             - Інформація про зображення
POST   /cleanup-files                    - Очистити старі файли (Admin)
POST   /cleanup-unused-files             - Очистити невикористані (Admin)
```

## 📁 Структура проекту

```
garden-market-backend/
├── controllers/          # Контролери API
│   ├── categoryController.js
│   ├── notificationController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── reviewController.js
│   ├── treeController.js
│   ├── uploadController.js
│   └── userController.js
├── models/              # Mongoose моделі
│   ├── category.js
│   ├── notifications.js
│   ├── order.js
│   ├── payment.js
│   ├── review.js
│   ├── tree.js
│   └── user.js
├── services/            # Бізнес-логіка та сервіси
│   ├── payments/
│   │   ├── paypalService.js
│   │   ├── paynetService.js
│   │   ├── runpayService.js
│   │   └── stripeService.js
│   ├── emailService.js
│   └── emailTemplates.js
├── utils/               # Допоміжні функції
│   ├── checkAdmin.js
│   ├── checkAuth.js
│   ├── checkSeller.js
│   ├── errorHandler.js
│   ├── handleValidationErrors.js
│   └── langDetector.js
├── validations/         # Схеми валідації
│   ├── auth.js
│   ├── login.js
│   └── tree.js
├── uploads/             # Завантажені файли
├── .env                 # Змінні середовища (не в git!)
├── .env.example         # Приклад .env файлу
├── .gitignore          # Git ignore правила
├── index.js            # Точка входу
├── localisation.js     # Мультимовність
├── package.json        # Залежності
├── README.md           # Ця документація
├── STRIPE_SETUP.md     # Детальна документація Stripe
└── QUICK_START_STRIPE.md # Швидкий старт Stripe
```

## 🔒 Безпека

- JWT токени для аутентифікації
- Bcrypt для хешування паролів
- Rate limiting для захисту від brute-force атак
- CORS налаштування
- Валідація всіх вхідних даних
- Перевірка webhook signatures для платіжних систем

## 🌍 Мультимовність

Підтримуються мови:
- Українська (uk)
- Російська (ru)
- Румунська (ro)

Мова визначається автоматично з заголовка `Accept-Language`.

## 📝 Ліцензія

ISC

## 👨‍💻 Автор

Your Name

## 🤝 Підтримка

Якщо у вас виникли питання або проблеми:
1. Перегляньте документацію
2. Перевірте логи сервера
3. Створіть issue у репозиторії

---
