const greenGradient = "linear-gradient(135deg, #388e3c, #2e7d32)";

export const verificationCodeTemplates = {
  // --- Російська
  ru: (userName, code) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: ${greenGradient}; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Подтверждение аккаунта</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Здравствуйте, ${userName}!</h2>
        <p style="color: #555; line-height: 1.6;">Ваш код подтверждения аккаунта:</p>
        <div style="font-size: 32px; font-weight: bold; color: #388e3c; margin: 30px 0;">${code}</div>
        <p style="color: #666; font-size: 14px;">
          Введите этот код в форме на сайте для подтверждения аккаунта.<br>
          Код действителен в течение 10 минут.
        </p>
      </div>
    </div>
  `,
  // --- Румунська
  ro: (userName, code) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: ${greenGradient}; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Confirmarea contului</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Bună ziua, ${userName}!</h2>
        <p style="color: #555; line-height: 1.6;">Codul dvs. de confirmare a contului:</p>
        <div style="font-size: 32px; font-weight: bold; color: #388e3c; margin: 30px 0;">${code}</div>
        <p style="color: #666; font-size: 14px;">
          Introduceți acest cod în formularul de pe site pentru a confirma contul.<br>
          Codul este valabil timp de 10 minute.
        </p>
      </div>
    </div>
  `,
};

export const resetCodeTemplates = {
  ru: (userName, code) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: ${greenGradient}; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔒 Сброс пароля</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Здравствуйте, ${userName}!</h2>
        <p style="color: #555; line-height: 1.6;">Ваш код для сброса пароля:</p>
        <div style="font-size: 32px; font-weight: bold; color: #388e3c; margin: 30px 0;">${code}</div>
        <p style="color: #666; font-size: 14px;">
          Введите этот код для сброса пароля.<br>
          Код действителен в течение 10 минут.
        </p>
      </div>
    </div>
  `,
  ro: (userName, code) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: ${greenGradient}; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔒 Resetare parolă</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Bună ziua, ${userName}!</h2>
        <p style="color: #555; line-height: 1.6;">Codul dvs. pentru resetarea parolei:</p>
        <div style="font-size: 32px; font-weight: bold; color: #388e3c; margin: 30px 0;">${code}</div>
        <p style="color: #666; font-size: 14px;">
          Introduceți acest cod pentru a reseta parola.<br>
          Codul este valabil timp de 10 minute.
        </p>
      </div>
    </div>
  `,
};

export const sellerApprovalTemplates = {
  ru: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #059669; border-radius: 4px; }
        .btn { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Ваш аккаунт продавца утвержден!</h1>
        </div>

        <div class="content">
          <h2>Поздравляем, ${data.fullName}!</h2>

          <div class="info-box">
            <p>Ваш аккаунт продавца <strong>${data.nurseryName || 'Garden Market'}</strong> успешно утвержден администрацией.</p>
            <p>Теперь вы можете:</p>
            <ul>
              <li>✅ Добавлять товары на платформу</li>
              <li>✅ Управлять своим каталогом</li>
              <li>✅ Получать заказы от покупателей</li>
              <li>✅ Отслеживать статистику продаж</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">
              Перейти в панель продавца
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Если у вас возникнут вопросы, свяжитесь с нашей службой поддержки.
          </p>
        </div>

        <div class="footer">
          <p>Garden Market - Платформа для продажи растений</p>
          <p>Это автоматическое сообщение. Не отвечайте на этот email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  ro: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #059669; border-radius: 4px; }
        .btn { display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Contul dvs. de vânzător a fost aprobat!</h1>
        </div>

        <div class="content">
          <h2>Felicitări, ${data.fullName}!</h2>

          <div class="info-box">
            <p>Contul dvs. de vânzător <strong>${data.nurseryName || 'Garden Market'}</strong> a fost aprobat cu succes de către administrație.</p>
            <p>Acum puteți:</p>
            <ul>
              <li>✅ Adăuga produse pe platformă</li>
              <li>✅ Gestiona catalogul dvs.</li>
              <li>✅ Primi comenzi de la clienți</li>
              <li>✅ Urmări statisticile vânzărilor</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL}/dashboard" class="btn">
              Accesați panoul vânzătorului
            </a>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Dacă aveți întrebări, contactați serviciul nostru de asistență.
          </p>
        </div>

        <div class="footer">
          <p>Garden Market - Platformă pentru vânzarea plantelor</p>
          <p>Acesta este un mesaj automat. Nu răspundeți la acest email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

export const sellerRejectionTemplates = {
  ru: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
        .footer { background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Заявка на регистрацию отклонена</h1>
        </div>

        <div class="content">
          <h2>Уважаемый(ая) ${data.fullName},</h2>

          <div class="info-box">
            <p>К сожалению, ваша заявка на регистрацию в качестве продавца на платформе <strong>Garden Market</strong> была отклонена администрацией.</p>
            ${data.reason ? `<p><strong>Причина:</strong> ${data.reason}</p>` : ''}
            <p>Ваш аккаунт был удален из системы.</p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Если у вас есть вопросы или вы хотите подать заявку повторно, пожалуйста, свяжитесь с нашей службой поддержки.
          </p>
        </div>

        <div class="footer">
          <p>Garden Market - Платформа для продажи растений</p>
          <p>Это автоматическое сообщение. Не отвечайте на этот email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
  ro: (data) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
        .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
        .footer { background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Cererea de înregistrare a fost respinsă</h1>
        </div>

        <div class="content">
          <h2>Stimate/Stimată ${data.fullName},</h2>

          <div class="info-box">
            <p>Din păcate, cererea dvs. de înregistrare ca vânzător pe platforma <strong>Garden Market</strong> a fost respinsă de către administrație.</p>
            ${data.reason ? `<p><strong>Motiv:</strong> ${data.reason}</p>` : ''}
            <p>Contul dvs. a fost șters din sistem.</p>
          </div>

          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            Dacă aveți întrebări sau doriți să depuneți o nouă cerere, vă rugăm să contactați serviciul nostru de asistență.
          </p>
        </div>

        <div class="footer">
          <p>Garden Market - Platformă pentru vânzarea plantelor</p>
          <p>Acesta este un mesaj automat. Nu răspundeți la acest email.</p>
        </div>
      </div>
    </body>
    </html>
  `,
};

