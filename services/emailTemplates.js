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

export const adminNotificationTemplates = {
  new_seller_registration: {
    ru: (data) => ({
      subject: `🔔 Новый продавец зарегистрировался - ${data.fullName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Новый продавец</title>
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
              <h1>🌳 Новый продавец на платформе!</h1>
            </div>

            <div class="content">
              <h2>Детали регистрации:</h2>

              <div class="info-box">
                <p><strong>👤 Имя:</strong> ${data.fullName}</p>
                <p><strong>📧 Email:</strong> ${data.email}</p>
                <p><strong>🏪 Питомник:</strong> ${data.sellerInfo?.nurseryName || "Не указано"}</p>
                <p><strong>📱 Телефон:</strong> ${data.sellerInfo?.phoneNumber || "Не указано"}</p>
                <p><strong>📍 Адрес:</strong> ${data.sellerInfo?.address || "Не указано"}</p>
                <p><strong>📄 Лицензия:</strong> ${data.sellerInfo?.businessLicense || "Не указано"}</p>
                ${data.sellerInfo?.description ? `<p><strong>📝 Описание:</strong> ${data.sellerInfo.description}</p>` : ""}
              </div>

              <div class="info-box urgent">
                <p><strong>⚠️ Требуются действия:</strong></p>
                <ul>
                  <li>Проверить информацию о продавце</li>
                  <li>Утвердить или отклонить заявку</li>
                  <li>При утверждении - активировать аккаунт продавца</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/admin" class="btn">
                  🔗 Перейти в админ панель
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Garden Market Admin System | ${new Date().toLocaleDateString("ru-RU")}</p>
              <p>Это автоматическое сообщение. Не отвечайте на этот email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
    ro: (data) => ({
      subject: `🔔 Un nou vânzător s-a înregistrat - ${data.fullName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Vânzător nou</title>
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
              <h1>🌳 Vânzător nou pe platformă!</h1>
            </div>

            <div class="content">
              <h2>Detalii înregistrare:</h2>

              <div class="info-box">
                <p><strong>👤 Nume:</strong> ${data.fullName}</p>
                <p><strong>📧 Email:</strong> ${data.email}</p>
                <p><strong>🏪 Pepinieră:</strong> ${data.sellerInfo?.nurseryName || "Nespecificat"}</p>
                <p><strong>📱 Telefon:</strong> ${data.sellerInfo?.phoneNumber || "Nespecificat"}</p>
                <p><strong>📍 Adresă:</strong> ${data.sellerInfo?.address || "Nespecificat"}</p>
                <p><strong>📄 Licență:</strong> ${data.sellerInfo?.businessLicense || "Nespecificat"}</p>
                ${data.sellerInfo?.description ? `<p><strong>📝 Descriere:</strong> ${data.sellerInfo.description}</p>` : ""}
              </div>

              <div class="info-box urgent">
                <p><strong>⚠️ Acțiuni necesare:</strong></p>
                <ul>
                  <li>Verificați informațiile despre vânzător</li>
                  <li>Aprobați sau respingeți cererea</li>
                  <li>La aprobare - activați contul vânzătorului</li>
                </ul>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/admin" class="btn">
                  🔗 Accesați panoul admin
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Garden Market Admin System | ${new Date().toLocaleDateString("ro-RO")}</p>
              <p>Acesta este un mesaj automat. Nu răspundeți la acest email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
  },
  new_product_created: {
    ru: (data) => ({
      subject: `🌳 Новый товар требует перевода - ${data.productName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Новый товар</title>
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
              <h1>📝 Требуется перевод товара!</h1>
            </div>

            <div class="content">
              <div class="info-box">
                <p><strong>🌳 Товар:</strong> ${data.productName}</p>
                <p><strong>💰 Цена:</strong> ${data.price} MDL</p>
                <p><strong>👤 Продавец:</strong> ${data.sellerInfo?.fullName}</p>
                <p><strong>🏪 Питомник:</strong> ${data.sellerInfo?.nurseryName}</p>
                <p><strong>📅 Создано:</strong> ${new Date().toLocaleDateString("ru-RU")}</p>
              </div>

              <div class="info-box">
                <p><strong>⚠️ Требуются переводы:</strong></p>
                <ul>
                  <li>🇬🇧 На английский язык</li>
                  <li>🇷🇴 На румынский язык</li>
                </ul>
                <p><em>Товар будет доступен покупателям после добавления переводов.</em></p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.BASE_URL || process.env.FRONTEND_URL}/admin/trees/${data.productId}/translate" class="btn">
                  🔗 Добавить переводы
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Garden Market Admin System | ${new Date().toLocaleDateString("ru-RU")}</p>
              <p>Это автоматическое сообщение. Не отвечайте на этот email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
    ro: (data) => ({
      subject: `🌳 Produs nou necesită traducere - ${data.productName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Produs nou</title>
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
              <h1>📝 Este necesară traducerea produsului!</h1>
            </div>

            <div class="content">
              <div class="info-box">
                <p><strong>🌳 Produs:</strong> ${data.productName}</p>
                <p><strong>💰 Preț:</strong> ${data.price} lei</p>
                <p><strong>👤 Vânzător:</strong> ${data.sellerInfo?.fullName}</p>
                <p><strong>🏪 Pepinieră:</strong> ${data.sellerInfo?.nurseryName}</p>
                <p><strong>📅 Creat:</strong> ${new Date().toLocaleDateString("ro-RO")}</p>
              </div>

              <div class="info-box">
                <p><strong>⚠️ Traduceri necesare:</strong></p>
                <ul>
                  <li>🇬🇧 În limba engleză</li>
                  <li>🇷🇺 În limba rusă</li>
                </ul>
                <p><em>Produsul va fi disponibil pentru cumpărători după adăugarea traducerilor.</em></p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.BASE_URL || process.env.FRONTEND_URL}/admin/trees/${data.productId}/translate" class="btn">
                  🔗 Adăugați traduceri
                </a>
              </div>
            </div>

            <div class="footer">
              <p>Garden Market Admin System | ${new Date().toLocaleDateString("ro-RO")}</p>
              <p>Acesta este un mesaj automat. Nu răspundeți la acest email.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    }),
  },
};

export const productApprovalTemplates = {
  ru: (data) => ({
    subject: `✅ Ваш товар одобрен - ${data.productTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Товар одобрен</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>✅ Ваш товар одобрен!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <p>Здравствуйте, <strong>${data.fullName}</strong>!</p>
            <p>Ваш товар <strong>"${data.productTitle}"</strong> был проверен и одобрен администратором.</p>
            <p>Теперь он доступен покупателям на сайте.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BASE_URL || process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                🛒 Перейти в личный кабинет
              </a>
            </div>
          </div>
          <div style="background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px;">
            <p>Garden Market | ${new Date().toLocaleDateString("ru-RU")}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
  ro: (data) => ({
    subject: `✅ Produsul dvs. a fost aprobat - ${data.productTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Produs aprobat</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1>✅ Produsul dvs. a fost aprobat!</h1>
          </div>
          <div style="background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef;">
            <p>Bună ziua, <strong>${data.fullName}</strong>!</p>
            <p>Produsul dvs. <strong>"${data.productTitle}"</strong> a fost verificat și aprobat de administrator.</p>
            <p>Acum este disponibil pentru cumpărători pe site.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.BASE_URL || process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
                🛒 Accesați contul personal
              </a>
            </div>
          </div>
          <div style="background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px;">
            <p>Garden Market | ${new Date().toLocaleDateString("ro-RO")}</p>
          </div>
        </div>
      </body>
      </html>
    `,
  }),
};

export const invoiceEmailTemplates = {
  ru: (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #388e3c, #2e7d32); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📋 Счёт на оплату</h1>
      </div>

      <div style="padding: 30px;">
        <h2 style="color: #333;">Благодарим за заказ!</h2>

        <p style="color: #555; line-height: 1.6;">
          Ваш заказ <strong>#${order.orderNumber}</strong> успешно оформлен.
        </p>

        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #388e3c;">Детали заказа:</h3>
          ${order.items.map(item => `
            <p style="margin: 5px 0;">
              ${(item.title && item.title.ru) || 'Товар'} × ${item.quantity} = ${item.subtotal.toFixed(2)} MDL
            </p>
          `).join('')}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p style="font-size: 18px; font-weight: bold; color: #388e3c; margin: 10px 0;">
            Всего: ${order.totalAmount.toFixed(2)} MDL
          </p>
        </div>

        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Внимание!</strong> Для завершения заказа необходимо произвести оплату согласно счёту.
          </p>
        </div>

        <h3 style="color: #388e3c;">Реквизиты для оплаты:</h3>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
          <p><strong>Получатель:</strong> Covaci Trees</p>
          <p><strong>Банк:</strong> Moldova Agroindbank</p>
          <p><strong>IBAN:</strong> MD00AG000000000000000000</p>
          <p><strong>SWIFT:</strong> AGRNMD2X</p>
          <p><strong>Назначение платежа:</strong> Счёт ${order.invoice.number}, Заказ ${order.orderNumber}</p>
        </div>


        <p style="color: #666; font-size: 14px;">
          После произведения оплаты, пожалуйста, сообщите нам, и мы сразу начнём обработку вашего заказа.
        </p>

        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; color: #2e7d32;">
            <strong>📞 Есть вопросы?</strong><br>
            Телефон: +373 797 481 311<br>
            Email: info@covacitrees.md
          </p>
        </div>
      </div>

      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>Covaci Trees © ${new Date().getFullYear()}</p>
        <p>с. Ришканы, Каушанский район, Молдова</p>
      </div>
    </div>
  `,
  
  ro: (order) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #388e3c, #2e7d32); color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📋 Factură de plată</h1>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="color: #333;">Mulțumim pentru comandă!</h2>
        
        <p style="color: #555; line-height: 1.6;">
          Comanda dvs. <strong>#${order.orderNumber}</strong> a fost plasată cu succes.
        </p>
        
        <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #388e3c;">Detalii comandă:</h3>
          ${order.items.map(item => `
            <p style="margin: 5px 0;">
              ${(item.title && item.title.ro) || 'Produs'} × ${item.quantity} = ${item.subtotal.toFixed(2)} MDL
            </p>
          `).join('')}
          <hr style="border: none; border-top: 1px solid #ddd; margin: 15px 0;">
          <p style="font-size: 18px; font-weight: bold; color: #388e3c; margin: 10px 0;">
            Total: ${order.totalAmount.toFixed(2)} MDL
          </p>
        </div>
        
        <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
          <p style="margin: 0; color: #856404;">
            <strong>⚠️ Atenție!</strong> Pentru finalizarea comenzii este necesar să efectuați plata conform facturii.
          </p>
        </div>
        
        <h3 style="color: #388e3c;">Detalii de plată:</h3>
        <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; font-family: monospace; font-size: 12px;">
          <p><strong>Beneficiar:</strong> Covaci Trees</p>
          <p><strong>Banca:</strong> Moldova Agroindbank</p>
          <p><strong>IBAN:</strong> MD00AG000000000000000000</p>
          <p><strong>SWIFT:</strong> AGRNMD2X</p>
          <p><strong>Scop plată:</strong> Factură ${order.invoice.number}, Comandă ${order.orderNumber}</p>
        </div>
        
        
        <p style="color: #666; font-size: 14px;">
          După efectuarea plății, vă rugăm să ne informați și vom începe imediat procesarea comenzii.
        </p>
        
        <div style="background: #e8f5e9; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p style="margin: 0; color: #2e7d32;">
            <strong>📞 Aveți întrebări?</strong><br>
            Telefon: +373 797 481 311<br>
            Email: info@covacitrees.md
          </p>
        </div>
      </div>
      
      <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; color: #666;">
        <p>Covaci Trees © ${new Date().getFullYear()}</p>
        <p>s. Rîșcani, raionul Căușeni, Moldova</p>
      </div>
    </div>
  `
};
