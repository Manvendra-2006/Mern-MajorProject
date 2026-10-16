const nodemailer = require('nodemailer');
const config = require('./environment');

let transporter = null;

const initializeEtherealTransporter = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('[Mailer] Initialized explicitly requested Ethereal test mailer.');
    try {
      await transporter.verify();
      console.log('[Mailer] Ethereal transporter verified – ready to send.');
    } catch (e) {
      console.error('[Mailer] Ethereal transporter verification failed:', e);
    }
    return transporter;
  } catch {
    console.error('[Mailer] Could not initialize the explicitly requested Ethereal test mailer.');
    throw new Error('Could not initialize the Ethereal test mailer.');
  }
};

const initializeSmtpTransporter = async () => {
  const { host, port, user, pass } = config.smtp;
  if (!host || !user || !pass) {
    console.error('[Mailer] SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.');
    throw new Error('SMTP configuration is incomplete.');
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    console.error('[Mailer] SMTP_PORT must be a valid port number.');
    throw new Error('SMTP_PORT must be a valid port number.');
  }

  const isGmail = host.toLowerCase() === 'smtp.gmail.com';
  if (isGmail && port !== 465 && port !== 587) {
    console.error('[Mailer] Gmail SMTP requires port 465 or 587.');
    throw new Error('Gmail SMTP requires port 465 or 587.');
  }

  try {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port === 587,
      auth: { user, pass },
    });
    // Verify SMTP transporter
    await transporter.verify();
    console.log('[Mailer] SMTP transporter verified – ready to send.');
    return transporter;
  } catch (e) {
    console.error('[Mailer] Could not initialize the configured SMTP transport or verify it:', e);
    throw new Error('Could not initialize the configured SMTP transport.');
  }
};

const getTransporter = async () => {
  if (transporter) return transporter;

  if (config.mailMode === 'ethereal') {
    return initializeEtherealTransporter();
  }

  if (config.mailMode !== 'smtp') {
    console.error('[Mailer] MAIL_MODE must be either "smtp" or "ethereal".');
    throw new Error('MAIL_MODE must be either "smtp" or "ethereal".');
  }

  return initializeSmtpTransporter();
};

/**
 * Send an OTP Email securely without logging secrets.
 */
const sendOtpEmail = async (email, otp, purpose = 'verification') => {
  const mailTransporter = await getTransporter();

  const title = purpose === 'reset' ? 'Password Reset Code' : 'Email Verification Code';
  const description = purpose === 'reset'
    ? 'Use the 6-digit code below to reset your EcoQuest account password.'
    : 'Welcome to EcoQuest! Use the 6-digit code below to verify your email address.';

  const mailOptions = {
    from: config.smtp.from,
    to: email,
    subject: `EcoQuest — ${title}`,
    text: `${title}\n\n${description}\n\nYour 6-digit code is: ${otp}\n\nThis code will expire in 5 minutes. If you did not request this code, please ignore this email.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h2 style="color: #15803d; margin: 0; font-size: 24px;">🌿 EcoQuest</h2>
          <p style="color: #64748b; font-size: 14px; margin-top: 4px;">Gamified Environmental Education</p>
        </div>
        <div style="padding: 20px; background-color: #f0fdf4; border-radius: 8px; border-left: 4px solid #16a34a; margin-bottom: 20px;">
          <h3 style="margin-top: 0; color: #166534; font-size: 18px;">${title}</h3>
          <p style="color: #334155; font-size: 14px; line-height: 1.5;">${description}</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #15803d; background: #ffffff; padding: 12px 24px; border: 2px dashed #86efac; border-radius: 8px;">
              ${otp}
            </span>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">⏱️ This verification code expires in <strong>5 minutes</strong>. Never share this code with anyone.</p>
        </div>
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">If you did not initiate this request, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    const info = await mailTransporter.sendMail(mailOptions);
    const previewUrl = config.mailMode === 'ethereal' ? nodemailer.getTestMessageUrl(info) : undefined;
    if (previewUrl) {
      console.log(`[Mailer] Development email preview delivered: ${previewUrl}`);
    } else {
      console.log(`[Mailer] Email delivered to recipient safely.`);
    }
    return { success: true, messageId: info.messageId, previewUrl };
  } catch {
    const message = config.mailMode === 'smtp'
      ? '[Mailer Error] SMTP delivery failed. Verify SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.'
      : '[Mailer Error] Failed to send email via the configured mail transport.';
    console.error(message);
    throw new Error('Failed to send verification email. Please try again later.');
  }
};

module.exports = {
  getTransporter,
  sendOtpEmail,
};
