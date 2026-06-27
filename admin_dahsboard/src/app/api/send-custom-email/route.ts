import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { bookingId, to, subject, message } = await req.json();

    if (!bookingId || !to || !subject || !message) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Update booking status to pending as we are starting a dialogue
    const { error: err } = await supabase
      .from('bookings')
      .update({ status: 'pending' })
      .eq('id', bookingId);

    if (err) throw err;

    // Send custom email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const htmlBody = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <p style="font-size: 16px; color: #334155; line-height: 1.6; white-space: pre-wrap;">${message}</p>
        <br/>
        <p style="font-size: 14px; color: #64748b;">Best regards,<br/><strong>The Magnevents Team</strong></p>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html: htmlBody,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Custom email error:", err);
    return new NextResponse('Failed to send email', { status: 500 });
  }
}
