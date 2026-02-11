import EmailService from '../services/emailService.js';

const emailService = new EmailService();

// Contact form submission handler
export const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email format'
      });
    }

    // Prepare admin email content
    const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
    const subject = `New Contact Message from ${name}`;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>New Contact Message</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border: 1px solid #e9ecef; }
          .info-box { background: white; padding: 20px; margin: 20px 0; border-left: 4px solid #059669; border-radius: 4px; }
          .footer { background: #6b7280; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📞 New Contact Message</h1>
          </div>

          <div class="content">
            <h2>You have received a new message from your website contact form:</h2>

            <div class="info-box">
              <p><strong>👤 Name:</strong> ${name}</p>
              <p><strong>📧 Email:</strong> ${email}</p>
              <p><strong>💬 Message:</strong></p>
              <p style="white-space: pre-line;">${message}</p>
            </div>

            <p style="color: #666; font-size: 14px; margin-top: 20px;">
              This is an automated message from your Garden Market website contact form.
            </p>
          </div>

          <div class="footer">
            <p>Garden Market Contact System | ${new Date().toLocaleDateString()}</p>
            <p>This is an automatic message. Do not reply to this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    const emailResult = await emailService.sendEmail(
      adminEmail,
      subject,
      htmlContent
    );

    if (emailResult.success) {
      res.status(200).json({
        success: true,
        message: 'Message sent successfully'
      });
    } else {
      console.error('Failed to send contact email:', emailResult.error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  } catch (error) {
    console.error('Error in sendContactMessage:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};