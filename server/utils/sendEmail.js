const nodemailer = require('nodemailer');
const { Resend } = require('resend');

let transporter = null;

async function sendEmail({ to, subject, html }) {
  // Use Resend if API key is set (production on Render)
  if (process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'PlaceAI <onboarding@resend.dev>',
      to,
      subject,
      html,
    });
    if (error) {
      console.error('Resend error:', error);
      throw new Error(error.message);
    }
    console.log(`📧 Email sent via Resend to ${to}`);
    return data;
  }

  // Use Gmail if EMAIL_USER is set
  if (process.env.EMAIL_USER) {
    if (!transporter) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.EMAIL_PORT) || 587,
        secure: false,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
    }
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'PlaceAI <noreply@placeai.com>',
      to,
      subject,
      html,
    });
    console.log(`📧 Email sent via Gmail to ${to}`);
    return info;
  }

  // Fallback: Ethereal for local development
  console.log('📧 No email config — using Ethereal test account');
  const testAccount = await nodemailer.createTestAccount();
  const testTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await testTransporter.sendMail({
    from: process.env.EMAIL_FROM || 'PlaceAI <noreply@placeai.com>',
    to,
    subject,
    html,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  console.log('\n📧 ============================================');
  console.log(`📧 EMAIL SENT (Test Mode)`);
  console.log(`📧 To: ${to}`);
  console.log(`📧 Subject: ${subject}`);
  console.log(`📧 Preview URL: ${previewUrl}`);
  console.log('📧 ============================================\n');
  return info;
}

function verificationEmailHTML(name, verifyUrl) {
  return `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
  <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9,#d946ef);padding:32px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:10px;display:inline-block;line-height:36px;text-align:center;font-size:18px;font-weight:bold;color:white;">P</div>
                <span style="color:white;font-size:22px;font-weight:700;letter-spacing:-0.5px;">PlaceAI</span>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 36px;">
              <h1 style="margin:0 0 12px;color:#f1f5f9;font-size:24px;font-weight:700;">Verify your email ✉️</h1>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Hi <strong style="color:#e2e8f0;">${name}</strong>, welcome to PlaceAI! Click the button below to verify your email address and activate your account.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${verifyUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#0ea5e9,#0284c7);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                  ✓ Verify My Email
                </a>
              </div>
              <p style="color:#64748b;font-size:13px;line-height:1.6;margin:0;">
                This link expires in <strong>24 hours</strong>. If you didn't create a PlaceAI account, you can safely ignore this email.
              </p>
              <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:28px 0;">
              <p style="color:#475569;font-size:12px;word-break:break-all;">
                Or copy this URL: <span style="color:#38bdf8;">${verifyUrl}</span>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#0f172a;padding:20px 36px;text-align:center;">
              <p style="color:#334155;font-size:12px;margin:0;">© 2024 PlaceAI · AI-Powered Placement Portal</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}

function resetPasswordEmailHTML(name, resetUrl) {
  return `
  <!DOCTYPE html>
  <html>
  <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,#0ea5e9,#d946ef);padding:32px;text-align:center;">
              <span style="color:white;font-size:22px;font-weight:700;">PlaceAI</span>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 36px;">
              <h1 style="margin:0 0 12px;color:#f1f5f9;font-size:24px;font-weight:700;">Reset your password 🔐</h1>
              <p style="color:#94a3b8;font-size:15px;line-height:1.6;margin:0 0 28px;">
                Hi <strong style="color:#e2e8f0;">${name}</strong>, we received a request to reset your password.
              </p>
              <div style="text-align:center;margin:32px 0;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#d946ef,#a21caf);color:white;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;">
                  Reset Password
                </a>
              </div>
              <p style="color:#64748b;font-size:13px;">This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
  </html>`;
}

module.exports = { sendEmail, verificationEmailHTML, resetPasswordEmailHTML };