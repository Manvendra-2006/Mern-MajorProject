
const nodemailer = require('nodemailer');
const config = require('./environment');

let transporter = null;
let transporterPromise = null;
let etherealFrom = null;

const logMailError = (label, error) => {
  console.error(label, {
    code: error?.code,
    responseCode: error?.responseCode,
    command: error?.command,
    message: error?.message,
  });
};

const initializeEtherealTransporter = async () => {
  try {
    const testAccount = await nodemailer.createTestAccount();

    const testTransporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 20000,
    });

    await testTransporter.verify();

    transporter = testTransporter;
    etherealFrom = testAccount.user;

    console.log('[Mailer] Ethereal transporter verified.');

    return transporter;
  } catch (error) {
    logMailError('[Mailer] Ethereal initialization failed:', error);
    throw new Error('Could not initialize the Ethereal test mailer.');
  }
};

const initializeSmtpTransporter = async () => {
  const { host, port, user, pass } = config.smtp;

  if (!host || !user || !pass) {
    throw new Error(
      'SMTP configuration is incomplete. Check SMTP_HOST, SMTP_USER and SMTP_PASS.'
    );
  }

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('SMTP_PORT must be a valid port number.');
  }

  const isGmail = host.toLowerCase() === 'smtp.gmail.com';

  if (isGmail && port !== 465 && port !== 587) {
    throw new Error('Gmail SMTP requires port 465 or 587.');
  }

  const smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    ...(port === 587 ? { requireTLS: true } : {}),
    auth: { user, pass },

    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
  });

  try {
    await smtpTransporter.verify();

    transporter = smtpTransporter;

    console.log('[Mailer] SMTP transporter verified.');

    return transporter;
  } catch (error) {
    logMailError('[Mailer] SMTP verification failed:', error);
    throw new Error('Could not verify the configured SMTP transport.');
  }
};

const getTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  // Reuse the same initialization promise for concurrent requests.
  if (!transporterPromise) {
    const initializer =
      config.mailMode === 'ethereal'
        ? initializeEtherealTransporter
        : config.mailMode === 'smtp'
          ? initializeSmtpTransporter
          : null;

    if (!initializer) {
      throw new Error('MAIL_MODE must be "smtp" or "ethereal".');
    }

    transporterPromise = initializer().catch((error) => {
      transporter = null;
      transporterPromise = null;
      throw error;
    });
  }

  return transporterPromise;
};

const sendOtpEmail = async (
  email,
  otp,
  purpose = 'verification'
) => {
  try {
    const mailTransporter = await getTransporter();

    const title =
      purpose === 'reset'
        ? 'Password Reset Code'
        : 'Email Verification Code';

    const description =
      purpose === 'reset'
        ? 'Use the 6-digit code below to reset your EcoQuest account password.'
        : 'Welcome to EcoQuest! Use the 6-digit code below to verify your email address.';

    const safeOtp = String(otp).replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[char]);

    const from =
      config.mailMode === 'ethereal'
        ? etherealFrom
        : config.smtp.from;

    const mailOptions = {
      from,
      to: email,
      subject: `EcoQuest - ${title}`,

      text: [
        title,
        '',
        description,
        '',
        `Your 6-digit code is: ${otp}`,
        '',
        'This code expires in 5 minutes.',
        'If you did not request this code, ignore this email.',
      ].join('\n'),

      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;background:#fff;">
          <div style="text-align:center;margin-bottom:24px;">
            <h2 style="color:#15803d;margin:0;font-size:24px;">EcoQuest</h2>
            <p style="color:#64748b;font-size:14px;">Gamified Environmental Education</p>
          </div>

          <div style="padding:20px;background:#f0fdf4;border-radius:8px;border-left:4px solid #16a34a;">
            <h3 style="color:#166534;">${title}</h3>
            <p style="color:#334155;line-height:1.5;">${description}</p>

            <div style="text-align:center;margin:24px 0;">
              <span style="display:inline-block;font-size:32px;font-weight:bold;letter-spacing:8px;color:#15803d;background:#fff;padding:12px 24px;border:2px dashed #86efac;border-radius:8px;">
                ${safeOtp}
              </span>
            </div>

            <p style="color:#64748b;font-size:12px;">
              This code expires in <strong>5 minutes</strong>.
              Never share it with anyone.
            </p>
          </div>

          <p style="color:#94a3b8;font-size:12px;text-align:center;">
            If you did not request this code, ignore this email.
          </p>
        </div>
      `,
    };

    const info = await mailTransporter.sendMail(mailOptions);

    console.log('[Mailer] SMTP server accepted the message.');
    console.log('[Mailer] Message ID:', info.messageId);
    console.log('[Mailer] Accepted recipients:', info.accepted);
    console.log('[Mailer] Rejected recipients:', info.rejected);
    console.log('[Mailer] SMTP response:', info.response);

    const previewUrl =
      config.mailMode === 'ethereal'
        ? nodemailer.getTestMessageUrl(info)
        : undefined;

    if (previewUrl) {
      console.log('[Mailer] Ethereal preview:', previewUrl);
    }

    if (!info.accepted || info.accepted.length === 0) {
      throw new Error('SMTP server did not accept the recipient.');
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl,
    };
  } catch (error) {
    logMailError('[Mailer Error] Email delivery failed:', error);

    throw new Error(
      'Failed to send verification email. Please try again later.'
    );
  }
};

module.exports = {
  getTransporter,
  sendOtpEmail,
};
