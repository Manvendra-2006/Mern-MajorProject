const nodemailer = require('nodemailer');

const smtpEnvironmentKeys = ['MAIL_MODE', 'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'MAIL_FROM'];
let originalEnvironment;

const loadMailer = () => {
  delete require.cache[require.resolve('../config/environment')];
  delete require.cache[require.resolve('../config/mailer')];
  return require('../config/mailer');
};

describe('mailer configuration', () => {
  beforeEach(() => {
    originalEnvironment = Object.fromEntries(
      smtpEnvironmentKeys.map((key) => [key, process.env[key]])
    );
    smtpEnvironmentKeys.forEach((key) => { process.env[key] = ''; });
  });

  afterEach(() => {
    smtpEnvironmentKeys.forEach((key) => {
      if (originalEnvironment[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnvironment[key];
    });
    vi.restoreAllMocks();
    delete require.cache[require.resolve('../config/environment')];
    delete require.cache[require.resolve('../config/mailer')];
  });

  it.each([
    [465, true, false],
    [587, false, true],
  ])('configures Gmail SMTP on port %i with the expected TLS settings', async (port, secure, requireTLS) => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = String(port);
    process.env.SMTP_USER = 'mailer@example.com';
    process.env.SMTP_PASS = 'test-only-password';

    vi.spyOn(nodemailer, 'createTestAccount').mockResolvedValue({});
    const createTransport = vi.spyOn(nodemailer, 'createTransport').mockReturnValue({});
    const mailer = loadMailer();
    await mailer.getTransporter();

    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.gmail.com',
      port,
      secure,
      requireTLS,
      auth: { user: 'mailer@example.com', pass: 'test-only-password' },
    }));
    expect(nodemailer.createTestAccount).not.toHaveBeenCalled();
  });

  it('does not fall back to Ethereal when SMTP credentials are missing', async () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_USER = 'mailer@example.com';
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(nodemailer, 'createTestAccount').mockResolvedValue({});

    await expect(loadMailer().getTransporter()).rejects.toThrow('SMTP configuration is incomplete.');
    expect(nodemailer.createTestAccount).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalledWith(
      '[Mailer] SMTP configuration is incomplete. Set SMTP_HOST, SMTP_USER, and SMTP_PASS.'
    );
  });

  it('uses Ethereal only when MAIL_MODE explicitly requests it', async () => {
    process.env.MAIL_MODE = 'ethereal';
    vi.spyOn(nodemailer, 'createTestAccount').mockResolvedValue({
      smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
      user: 'ethereal-user',
      pass: 'ethereal-password',
    });
    const createTransport = vi.spyOn(nodemailer, 'createTransport').mockReturnValue({});

    await loadMailer().getTransporter();

    expect(nodemailer.createTestAccount).toHaveBeenCalledOnce();
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({
      host: 'smtp.ethereal.email',
      auth: { user: 'ethereal-user', pass: 'ethereal-password' },
    }));
  });

  it('logs a safe message when SMTP delivery fails', async () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_USER = 'mailer@example.com';
    process.env.SMTP_PASS = 'test-only-password';
    const errorLog = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({
      sendMail: vi.fn().mockRejectedValue(new Error('authentication failed: test-only-password')),
    });

    await expect(loadMailer().sendOtpEmail('recipient@example.com', '123456'))
      .rejects.toThrow('Failed to send verification email. Please try again later.');
    expect(errorLog).toHaveBeenCalledWith(
      '[Mailer Error] SMTP delivery failed. Verify SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS.'
    );
    expect(errorLog.mock.calls.flat().join(' ')).not.toContain('test-only-password');
  });

  it('uses MAIL_FROM for OTP messages', async () => {
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_USER = 'mailer@example.com';
    process.env.SMTP_PASS = 'test-only-password';
    process.env.MAIL_FROM = '"EcoQuest" <verified@example.com>';
    const sendMail = vi.fn().mockResolvedValue({ messageId: 'message-id' });
    vi.spyOn(nodemailer, 'createTransport').mockReturnValue({ sendMail });
    vi.spyOn(console, 'log').mockImplementation(() => {});

    await loadMailer().sendOtpEmail('recipient@example.com', '123456');

    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({
      from: '"EcoQuest" <verified@example.com>',
      to: 'recipient@example.com',
    }));
  });
});
