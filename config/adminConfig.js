   

export const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  // Додайте інші email адмінів за потреби:
  // 'admin2@example.com',
  // 'moderator@example.com'
];

// Функція для отримання всіх адмін email
export const getAdminEmails = () => {
  return ADMIN_EMAILS.filter(email => email && email.includes('@'));
};

export const notifyAllAdmins = async (emailServiceInstance, notificationType, data) => {
  const adminEmails = getAdminEmails();
  const results = [];

  for (const email of adminEmails) {
    try {
      // ⬇️ ВИКОРИСТОВУЙ СПЕЦІАЛЬНИЙ МЕТОД з HTML форматуванням
      const result = await emailServiceInstance.sendAdminNotificationEmail(
        email, 
        notificationType, 
        data
      );
      
      results.push({ email, success: true, ...result });
    } catch (error) {
      console.error(`❌ Помилка відправки email адміну ${email}:`, error);
      results.push({ email, success: false, error: error.message });
    }
  }

  return results;
};