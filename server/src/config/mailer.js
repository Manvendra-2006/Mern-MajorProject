
const { Resend } = require('resend');
const config = require('./environment');

const resend = new Resend(process.env.RESEND_API_KEY);

const escapeHtml = (value) =>
  String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]);

const sendOtpEmail = async (
  email,
  otp,
  purpose = 'verification'
) => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured.');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('A valid recipient email is required.');
  }

  if (!/^\d{6}$/.test(String(otp))) {
    throw new Error('OTP must be a 6-digit code.');
  }

  const isReset = purpose === 'reset';

  const title = isReset
    ? 'Password Reset Code'
    : 'Email Verification Code';

  const description = isReset
    ? 'Use this code to reset your EcoQuest password.'
    : 'Use this code to verify your EcoQuest email address.';

  const safeOtp = escapeHtml(otp);

  try {
    const { data, error } = await resend.emails.send({
      from:
        process.env.RESEND_FROM ||
        'EcoQuest <onboarding@resend.dev>',

      to: [email],

      subject: `EcoQuest - ${title}`,

      text: [
        title,
        '',
        description,
        '',
        `Your verification code is: ${otp}`,
        'This code expires in 5 minutes.',
        'If you did not request this code, ignore this email.',
      ].join('\n'),

      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;border:1px solid #e2e8f0;border-radius:12px;">
          <h2 style="color:#15803d;text-align:center;">EcoQuest</h2>
          <h3>${title}</h3>
          <p>${description}</p>

          <div style="padding:20px;text-align:center;background:#f0fdf4;border-radius:8px;">
            <span style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#15803d;">
              ${safeOtp}
            </span>
          </div>

          <p>This code expires in 5 minutes. Never share it with anyone.</p>
          <p>If you did not request this code, ignore this email.</p>
        </div>
      `,
    });

    if (error) {
      console.error('[Mailer] Resend API error:', {
        name: error.name,
        message: error.message,
        statusCode: error.statusCode,
      });

      throw new Error('Email provider rejected the request.');
    }

    console.log('[Mailer] Resend accepted the email request:', {
      id: data?.id,
      recipient: email,
    });

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error('[Mailer] Email API request failed:', {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
    });

    throw new Error(
      'Failed to send verification email. Please try again later.'
    );
  }
};

module.exports = {
  sendOtpEmail,
};
