import nodemailer from "nodemailer";
import dotenv from 'dotenv';
dotenv.config();




class emailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  

  // Тестування підключення
  async testConnection() {
    try {
      await this.transporter.verify();
      console.log("✓ SMTP сервер готовий");
      return true;
    } catch (error) {
      console.error("✗ Помилка SMTP:", error.message);
      return false;
    }
  }

  // Welcome email при реєстрації
  async sendWelcomeEmail(userEmail, userName) {
    try {
      const mailOptions = {
        from: `"Garden Market" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Ласкаво просимо в Garden Market!",
        html: this.getWelcomeTemplate(userName),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✓ Welcome email відправлено:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("✗ Помилка welcome email:", error);
      return { success: false, error: error.message };
    }
  }

  // Email підтвердження
  async sendVerificationEmail(userEmail, userName, verificationToken) {
    try {
      const verificationUrl = `${process.env.BASE_URL}/verify-email?token=${verificationToken}`;

      const mailOptions = {
        from: `"Garden Market" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: "Підтвердіть свій email - Garden Market",
        html: this.getVerificationTemplate(userName, verificationUrl),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✓ Verification email відправлено:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("✗ Помилка verification email:", error);
      return { success: false, error: error.message };
    }
  }

   // Відновлення пароля
  async sendPasswordResetEmail(userEmail, userName, resetToken) {
    try {
      const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Garden Market" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Відновлення пароля - Garden Market',
        html: this.getPasswordResetTemplate(userName, resetUrl)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✓ Password reset email відправлено:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('✗ Помилка password reset email:', error);
      return { success: false, error: error.message };
    }
  }


   async sendPasswordResetEmail(userEmail, userName, resetToken) {
    try {
      const resetUrl = `${process.env.BASE_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: `"Garden Market" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: 'Відновлення пароля - Garden Market',
        html: this.getPasswordResetTemplate(userName, resetUrl)
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✓ Password reset email відправлено:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('✗ Помилка password reset email:', error);
      return { success: false, error: error.message };
    }
  }

    // Шаблон welcome email
  getWelcomeTemplate(userName) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4CAF50, #45a049); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🌱 Garden Market</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px;">Ваш садовий магазин онлайн</p>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Привіт, ${userName}! 👋</h2>
          <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
            Дякуємо за реєстрацію в Garden Market! Тепер ви можете:
          </p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <ul style="color: #333; line-height: 1.8; padding-left: 20px;">
              <li>🛒 Переглядати каталог садових товарів</li>
              <li>🌿 Замовляти рослини та інструменти</li>
              <li>📦 Відстежувати статус замовлень</li>
              <li>💚 Отримувати персональні рекомендації</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.BASE_URL}" 
               style="background-color: #4CAF50; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 25px; display: inline-block; 
                      font-weight: bold; font-size: 16px;">
              Почати покупки
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            Якщо у вас виникли питання, звертайтеся: 
            <a href="mailto:${process.env.EMAIL_USER}" style="color: #4CAF50;">${process.env.EMAIL_USER}</a>
          </p>
        </div>
        
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
          <p>© 2025 Garden Market. Всі права захищені.</p>
        </div>
      </div>
    `;
  }

   // Шаблон verification email
  getVerificationTemplate(userName, verificationUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔐 Підтвердження Email</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">Привіт, ${userName}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Щоб завершити реєстрацію в Garden Market, підтвердьте свій email адрес.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #2196F3; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 25px; display: inline-block; 
                      font-weight: bold; font-size: 16px;">
              ✓ Підтвердити Email
            </a>
          </div>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #856404; margin: 0; font-size: 14px;">
              ⚠️ Посилання дійсне протягом 24 годин
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Якщо кнопка не працює, скопіюйте це посилання:<br>
            <span style="word-break: break-all; color: #2196F3;">${verificationUrl}</span>
          </p>
        </div>
      </div>
    `;
  }

  // Шаблон password reset
  getPasswordResetTemplate(userName, resetUrl) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #FF9800, #F57C00); color: white; padding: 30px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">🔑 Відновлення пароля</h1>
        </div>
        
        <div style="padding: 30px;">
          <h2 style="color: #333;">Привіт, ${userName}!</h2>
          <p style="color: #555; line-height: 1.6;">
            Ви запросили відновлення пароля для вашого акаунта в Garden Market.
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #FF9800; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 25px; display: inline-block; 
                      font-weight: bold; font-size: 16px;">
              🔄 Відновити пароль
            </a>
          </div>
          
          <div style="background-color: #ffebee; border: 1px solid #ffcdd2; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p style="color: #c62828; margin: 0; font-size: 14px;">
              ⚠️ Посилання дійсне протягом 1 години
            </p>
          </div>
          
          <p style="color: #666; font-size: 14px;">
            Якщо ви не запрошували відновлення пароля, просто проігноруйте цей лист.
          </p>
        </div>
      </div>
    `;
  }
}

// ...existing code...
export default emailService;
