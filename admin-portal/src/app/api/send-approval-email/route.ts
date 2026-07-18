import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(req: Request) {
  try {
    const { id, type, title, description, submittedBy, previewLink } = await req.json();

    const origin = req.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'https://admin.magnevents.in';
    const approveLink = `${origin}/api/action-request?id=${id}&type=${type}&action=approve`;
    const rejectLink = `${origin}/api/action-request?id=${id}&type=${type}&action=reject`;

    if (!resend) {
      console.warn("MOCK EMAIL SENT: No RESEND_API_KEY found in .env.local");
      console.log(`To: Super Admin\nTitle: ${title}\nDesc: ${description}\nPreview: ${previewLink}\nApprove: ${approveLink}\nReject: ${rejectLink}`);
      return NextResponse.json({ success: true, mock: true });
    }

    const superAdminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL;
    if (!superAdminEmail) {
      return NextResponse.json({ error: "No super admin email configured." }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'Admin System <onboarding@resend.dev>',
      to: [superAdminEmail],
      subject: `New Request: ${title}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Action Required: New Request</h2>
          <p><strong>${submittedBy}</strong> has submitted a new request that requires your attention.</p>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0;"><strong>Title:</strong> ${title}</p>
            <p style="margin: 0;"><strong>Description:</strong> ${description}</p>
          </div>
          <div style="margin-top: 24px; display: flex; gap: 12px;">
            <a href="${approveLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #10b981; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Approve</a>
            <a href="${rejectLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #ef4444; color: #ffffff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px;">Reject</a>
            <a href="${previewLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: #f1f5f9; color: #475569; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 14px; border: 1px solid #cbd5e1;">Preview</a>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 32px;">This is an automated notification from Magnevents Admin Portal.</p>
        </div>
      `
    });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
