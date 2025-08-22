

export const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  // Можна додати більше email адмінів:
  // 'admin2@example.com',
  // 'moderator@example.com'
];

// Функція для отримання всіх адмін email
export const getAdminEmails = () => {
  return ADMIN_EMAILS.filter(email => email && email.includes('@'));
};

// Функція для відправки email всім адмінам
export const notifyAllAdmins = async (emailService, notificationType, data) => {
  const adminEmails = getAdminEmails();
  const results = [];

  for (const email of adminEmails) {
    try {
      const result = await emailService.sendAdminNotificationEmail(
        email, 
        notificationType, 
        data
      );
      results.push({ email, success: true, ...result });
      console.log(`✅ Email надіслано адміну: ${email}`);
    } catch (error) {
      console.error(`❌ Помилка відправки email адміну ${email}:`, error);
      results.push({ email, success: false, error: error.message });
    }
  }

  return results;
};