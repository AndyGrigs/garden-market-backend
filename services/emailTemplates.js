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
  // --- Англійська
  en: (userName, code) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
      <div style="background: ${greenGradient}; color: white; padding: 30px; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">🔐 Account Verification</h1>
      </div>
      <div style="padding: 30px;">
        <h2 style="color: #333;">Hello, ${userName}!</h2>
        <p style="color: #555; line-height: 1.6;">Your account verification code:</p>
        <div style="font-size: 32px; font-weight: bold; color: #388e3c; margin: 30px 0;">${code}</div>
        <p style="color: #666; font-size: 14px;">
          Enter this code on the website form to verify your account.<br>
          The code is valid for 10 minutes.
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
  en: (userName, code) =>
    ` <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #388e3c, #2e7d32); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🔑 Password Reset</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #333;">Hello, ${userName}!</h2>
      <p style="color: #555; line-height: 1.6;">
        You have requested to reset your password for your Garden Market account.
      </p>
      <div style="color: #2e7d32; font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0;">
        Your reset code: <span>${code}</span>
      </div>
      <p style="color: #666; font-size: 14px;">
        Please enter this code on the website to set a new password.<br>
        The code is valid for 10 minutes.
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        If you did not request a password reset, simply ignore this email.
      </p>
    </div>
  </div>`,
  ru: (userName, code) =>
    `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #388e3c, #2e7d32); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🔑 Восстановление пароля</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #333;">Здравствуйте, ${userName}!</h2>
      <p style="color: #555; line-height: 1.6;">
        Вы запросили восстановление пароля для вашего аккаунта Garden Market.
      </p>
      <div style="color: #2e7d32; font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0;">
        Ваш код для сброса пароля: <span>${code}</span>
      </div>
      <p style="color: #666; font-size: 14px;">
        Пожалуйста, введите этот код на сайте, чтобы задать новый пароль.<br>
        Код действителен в течение 10 минут.
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
      </p>
    </div>
  </div>
`,
  ro: (userName, code) =>`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background: linear-gradient(135deg, #388e3c, #2e7d32); color: white; padding: 30px; text-align: center;">
      <h1 style="margin: 0; font-size: 28px;">🔑 Resetare parolă</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #333;">Bună ziua, ${userName}!</h2>
      <p style="color: #555; line-height: 1.6;">
        Ați solicitat resetarea parolei pentru contul dumneavoastră Garden Market.
      </p>
      <div style="color: #2e7d32; font-size: 28px; font-weight: bold; text-align: center; margin: 30px 0;">
        Codul dvs. de resetare: <span>${code}</span>
      </div>
      <p style="color: #666; font-size: 14px;">
        Introduceți acest cod pe site pentru a seta o nouă parolă.<br>
        Codul este valabil timp de 10 minute.
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 30px;">
        Dacă nu ați solicitat resetarea parolei, ignorați acest email.
      </p>
    </div>
  </div>,
`};
