import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { verificationCodeTemplates, resetCodeTemplates, sellerApprovalTemplates } from "./emailTemplates.js";

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
  // Надіслати email з кодом підтвердження
  async sendVerificationCodeEmail(userEmail, userName, code, userLang = "ru") {
    try {
      const lang = ["ru", "en", "ro"].includes(userLang) ? userLang : "ru";
      const mailOptions = {
        from: `"Garden Market" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: {
          ru: "Ваш код подтверждения - Garden Market",
          en: "Your verification code - Garden Market",
          ro: "Codul dvs. de verificare - Garden Market",
        }[lang],
        html: verificationCodeTemplates[lang](userName, code),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✓ Verification code email відправлено:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("✗ Помилка verification code email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendResetCodeEmail(userEmail, userName, code, userLang = "ru") {
    const lang = ["ru", "ro", "en"].includes(userLang) ? userLang : "ru";
    const mailOptions = {
      from: `"Garden Market" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: {
        en: "Password reset code - Garden Market",
        ru: "Код для сброса пароля - Garden Market",
        ro: "Cod de resetare a parolei - Garden Market",
      }[lang],
      html: resetCodeTemplates[lang](userName, code),
    };
    return await this.transporter.sendMail(mailOptions);
  }

  async sendSellerApprovalEmail(userEmail, data, userLang = "ru") {
    try {
      const lang = ["ru", "ro"].includes(userLang) ? userLang : "ru";
      const mailOptions = {
        from: `"Garden Market" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: {
          ru: "✅ Ваш аккаунт продавца утвержден - Garden Market",
          ro: "✅ Contul dvs. de vânzător a fost aprobat - Garden Market",
        }[lang],
        html: sellerApprovalTemplates[lang](data),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Seller approval email sent:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("❌ Error sending seller approval email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendAdminNotificationEmail(adminEmail, notificationType, data) {
    try {
      let subject, htmlContent;

      switch (notificationType) {
        case "new_seller_registration":
          subject = `🔔 Новий продавець зареєструвався - ${data.fullName}`;
          htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Новий продавець</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #059669; border-radius: 4px; }
              .btn { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
              .footer { background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
              .urgent { color: #dc2626; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🌳 Новий продавець на платформі!</h1>
              </div>
              
              <div class="content">
                <h2>Деталі реєстрації:</h2>
                
                <div class="info-box">
                  <p><strong>👤 Ім'я:</strong> ${data.fullName}</p>
                  <p><strong>📧 Email:</strong> ${data.email}</p>
                  <p><strong>🏪 Розсадник:</strong> ${
                    data.sellerInfo?.nurseryName || "Не вказано"
                  }</p>
                  <p><strong>📱 Телефон:</strong> ${
                    data.sellerInfo?.phoneNumber || "Не вказано"
                  }</p>
                  <p><strong>📍 Адреса:</strong> ${
                    data.sellerInfo?.address || "Не вказано"
                  }</p>
                  <p><strong>📄 Ліцензія:</strong> ${
                    data.sellerInfo?.businessLicense || "Не вказано"
                  }</p>
                  ${
                    data.sellerInfo?.description
                      ? `<p><strong>📝 Опис:</strong> ${data.sellerInfo.description}</p>`
                      : ""
                  }
                </div>

                <div class="info-box urgent">
                  <p><strong>⚠️ Потрібні дії:</strong></p>
                  <ul>
                    <li>Перевірити інформацію про продавця</li>
                    <li>Схвалити або відхилити заявку</li>
                    <li>При схваленні - активувати акаунт продавця</li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL}/admin" class="btn">
                    🔗 Перейти в адмін панель
                  </a>
                </div>
              </div>

              <div class="footer">
                <p>Garden Market Admin System | ${new Date().toLocaleDateString(
                  "uk-UA"
                )}</p>
                <p>Це автоматичне повідомлення. Не відповідайте на цей email.</p>
              </div>
            </div>
          </body>
          </html>
        `;
          break;

        case "new_product_created":
          subject = `🌳 Новий товар потребує перекладу - ${data.productName}`;
          htmlContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Новий товар</title>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
              .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
              .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #f59e0b; border-radius: 4px; }
              .btn { display: inline-block; background: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
              .footer { background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📝 Потрібен переклад товару!</h1>
              </div>
              
              <div class="content">
                <div class="info-box">
                  <p><strong>🌳 Товар:</strong> ${data.productName}</p>
                  <p><strong>💰 Ціна:</strong> ${data.price} грн</p>
                  <p><strong>👤 Продавець:</strong> ${
                    data.sellerInfo?.fullName
                  }</p>
                  <p><strong>🏪 Розсадник:</strong> ${
                    data.sellerInfo?.nurseryName
                  }</p>
                  <p><strong>📅 Створено:</strong> ${new Date().toLocaleDateString(
                    "uk-UA"
                  )}</p>
                </div>

                <div class="info-box">
                  <p><strong>⚠️ Потрібні переклади:</strong></p>
                  <ul>
                    <li>🇬🇧 Англійською мовою</li>
                    <li>🇷🇴 Румунською мовою</li>
                  </ul>
                  <p><em>Товар буде доступний покупцям після додавання перекладів.</em></p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL}/admin" class="btn">
                    🔗 Додати переклади
                  </a>
                </div>
              </div>

              <div class="footer">
                <p>Garden Market Admin System | ${new Date().toLocaleDateString(
                  "uk-UA"
                )}</p>
                <p>Це автоматичне повідомлення. Не відповідайте на цей email.</p>
              </div>
            </div>
          </body>
          </html>
        `;
          break;

        default:
          subject = "🔔 Нове сповіщення з Garden Market";
          htmlContent = `
          <h2>Нове сповіщення</h2>
          <p>${data.message || "У вас є нове сповіщення в адмін панелі."}</p>
          <p><a href="${
            process.env.FRONTEND_URL
          }/admin">Перейти в адмін панель</a></p>
        `;
      }

      const mailOptions = {
        from: {
          name: "Garden Market System",
          address: this.transporter.options.auth.user,
        },
        to: adminEmail,
        subject: subject,
        html: htmlContent,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log("✅ Admin notification email sent:", info.messageId);

      return {
        success: true,
        messageId: info.messageId,
        to: adminEmail,
        subject: subject,
      };
    } catch (error) {
      console.error("❌ Error sending admin notification email:", error);
      throw error;
    }
  }

  generateVerificationCode() {
    return Math.floor(100 + Math.random() * 900).toString();
  }
}

export default emailService;
