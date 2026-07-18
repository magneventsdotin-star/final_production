import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { to, subject, message, actionLink, actionText } = await req.json();

    if (!to || !subject || !message) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 40px 10px; -webkit-font-smoothing: antialiased;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f1f5f9; width: 100%;">
          <tr>
            <td align="center">
              <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden; text-align: left;">
                
                <div style="background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%); padding: 40px 20px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: 1px;">MAGNEVENTS</h1>
                </div>

                <div style="padding: 40px 32px; background-color: #ffffff;">
                  <h2 style="margin-top: 0; font-size: 20px; color: #0f172a; font-weight: 800; margin-bottom: 24px;">Action Required</h2>
                  <p style="color: #475569; font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                  
                  ${actionLink ? `
                    <div style="margin-top: 40px; text-align: center;">
                      <a href="${actionLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #4f46e5; color: #ffffff; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 15px; letter-spacing: 0.5px; box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.3);">
                        ${actionText || 'Click Here'}
                      </a>
                    </div>
                  ` : ''}
                </div>
              </div>
              <div style="text-align: center; margin-top: 24px;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0;">Sent securely by Magnevents</p>
              </div>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email send error:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
