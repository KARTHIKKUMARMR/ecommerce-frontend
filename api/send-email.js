const nodemailer = require('nodemailer');

export default async function handler(req, res) {
  // CORS configuration to allow your Render backend to call this Vercel function
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { to, otp, name, secret } = req.body;

  // Security check to ensure only our Render backend can trigger this email
  if (secret !== 'hashthakala_internal_secret_2024') {
    return res.status(401).json({ error: 'Unauthorized request' });
  }

  if (!to || !otp) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Vercel (unlike Render) allows Gmail SMTP on port 465!
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: 'srihasthikala@gmail.com',
        pass: 'otufvwtkyehnzzaa', // App Password we confirmed works
      },
    });

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:20px;background:#f4f0e8;font-family:Georgia,serif;">
  <div style="max-width:500px;margin:0 auto;background:#1a0a0a;border-radius:16px;overflow:hidden;">
    <div style="background:#2a1010;padding:32px 40px;text-align:center;border-bottom:2px solid #c9a84c;">
      <h1 style="color:#c9a84c;font-size:24px;letter-spacing:4px;margin:0;">⚜ HASHTHAKALA ⚜</h1>
      <p style="color:#8b6914;font-size:10px;margin:6px 0 0;letter-spacing:3px;">HERITAGE FASHION</p>
    </div>
    <div style="padding:36px 40px;">
      <p style="color:#d4c4a0;font-size:15px;margin:0 0 8px;">Hello <strong>${name || 'Customer'}</strong>,</p>
      <p style="color:#9a8060;line-height:1.7;font-size:13px;margin:0 0 28px;">
        Your verification code for HASHTHAKALA account registration is below.
      </p>
      <div style="background:#2a1010;border:2px solid #c9a84c;border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
        <p style="color:#8b7040;font-size:10px;letter-spacing:2px;text-transform:uppercase;margin:0 0 12px;">Verification Code</p>
        <div style="font-size:48px;font-weight:900;letter-spacing:14px;color:#c9a84c;font-family:Courier,monospace;">${otp}</div>
        <p style="color:#c9a84c;font-size:11px;margin:12px 0 0;">⏱ Valid for 10 minutes only</p>
      </div>
      <p style="color:#6b5030;font-size:12px;line-height:1.6;">
        If you didn't register on HASHTHAKALA, please ignore this email.
        Never share this code with anyone.
      </p>
    </div>
    <div style="background:#0f0505;padding:16px 40px;text-align:center;">
      <p style="color:#5a4030;font-size:11px;margin:0;">© HASHTHAKALA Heritage Fashion · Automated email, do not reply</p>
    </div>
  </div>
</body>
</html>`;

    await transporter.sendMail({
      from: '"HASHTHAKALA" <srihasthikala@gmail.com>',
      to,
      subject: `${otp} is your HASHTHAKALA verification code`,
      html,
    });

    return res.status(200).json({ success: true, message: 'Email delivered via Vercel!' });
  } catch (error) {
    console.error('Vercel Email Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
