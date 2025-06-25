import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { verificationCodeTemplates } from './emailTemplates.js';

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
        html: verificationCodeTemplates[lang](userName, code)
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
      ro: "Cod de resetare a parolei - Garden Market"
    }[lang],
    html: resetCodeTemplates[lang](userName, code)
  };
  return await this.transporter.sendMail(mailOptions);
}



  // Шаблон verification email
  // getVerificationTemplate(userName, verificationUrl) {
  //   return `
  //     <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
  //       <div style="background: linear-gradient(135deg, #2196F3, #1976D2); color: white; padding: 30px; text-align: center;">
  //         <h1 style="margin: 0; font-size: 28px;">🔐 Підтвердження Email</h1>
  //       </div>

  //       <div style="padding: 30px;">
  //         <h2 style="color: #333;">Привіт, ${userName}!</h2>
  //         <p style="color: #555; line-height: 1.6;">
  //           Щоб завершити реєстрацію в Garden Market, підтвердьте свій email адрес.
  //         </p>

  //         <div style="text-align: center; margin: 30px 0;">
  //           <a href="${verificationUrl}"
  //             style="background-color: #2196F3; color: white; padding: 15px 30px;
  //                     text-decoration: none; border-radius: 25px; display: inline-block;
  //                     font-weight: bold; font-size: 16px;">
  //             ✓ Підтвердити Email
  //           </a>
  //         </div>

  //         <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
  //           <p style="color: #856404; margin: 0; font-size: 14px;">
  //             ⚠️ Посилання дійсне протягом 24 годин
  //           </p>
  //         </div>

  //         <p style="color: #666; font-size: 14px;">
  //           Якщо кнопка не працює, скопіюйте це посилання:<br>
  //           <span style="word-break: break-all; color: #2196F3;">${verificationUrl}</span>
  //         </p>
  //       </div>
  //     </div>
  //   `;
  // }

  // ...existing code...

  // Генерація 6-значного коду
  generateVerificationCode() {
    return Math.floor(100 + Math.random() * 900).toString();
  }


}

export default emailService;
