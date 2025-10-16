import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { verificationCodeTemplates, resetCodeTemplates, sellerApprovalTemplates, sellerRejectionTemplates, adminNotificationTemplates } from "./emailTemplates.js";

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
    const lang = ["ru", "ro"].includes(userLang) ? userLang : "ru";
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

  async sendSellerRejectionEmail(userEmail, data, userLang = "ru") {
    try {
      const lang = ["ru", "ro"].includes(userLang) ? userLang : "ru";
      const mailOptions = {
        from: `"Garden Market" <${process.env.EMAIL_USER}>`,
        to: userEmail,
        subject: {
          ru: "❌ Заявка на регистрацию отклонена - Garden Market",
          ro: "❌ Cererea de înregistrare a fost respinsă - Garden Market",
        }[lang],
        html: sellerRejectionTemplates[lang](data),
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log("✅ Seller rejection email sent:", result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error("❌ Error sending seller rejection email:", error);
      return { success: false, error: error.message };
    }
  }

  async sendAdminNotificationEmail(adminEmail, notificationType, data, adminLang = "ru") {
    try {
      const lang = ["ru", "ro"].includes(adminLang) ? adminLang : "ru";
      let subject, htmlContent;

      // Check if notification type has templates
      if (adminNotificationTemplates[notificationType]) {
        const template = adminNotificationTemplates[notificationType][lang](data);
        subject = template.subject;
        htmlContent = template.html;
      } else {
        // Default notification for unknown types
        const defaultMessages = {
          ru: {
            subject: "🔔 Новое уведомление от Garden Market",
            body: data.message || "У вас есть новое уведомление в админ панели.",
            button: "Перейти в админ панель",
          },
          ro: {
            subject: "🔔 Notificare nouă de la Garden Market",
            body: data.message || "Aveți o notificare nouă în panoul admin.",
            button: "Accesați panoul admin",
          },
        };

        const msg = defaultMessages[lang];
        subject = msg.subject;
        htmlContent = `
          <h2>${msg.subject}</h2>
          <p>${msg.body}</p>
          <p><a href="${process.env.FRONTEND_URL}/admin">${msg.button}</a></p>
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
