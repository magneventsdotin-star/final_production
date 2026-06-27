import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { bookingId, to, subject, message } = await req.json();

    if (!bookingId || !to || !subject || !message) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    // Fetch booking details for context
    const { data: booking, error: fetchErr } = await supabase
      .from('bookings')
      .select('*, artists(name)')
      .eq('id', bookingId)
      .single();

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

    let contextHtml = '';
    if (booking) {
      contextHtml = `
        <div style="background-color: #f1f5f9; padding: 40px; border-top: 1px solid #e2e8f0;">
          <h3 style="font-size: 13px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 24px 0;">Original Request Details</h3>
          
          <div style="margin-bottom: 32px;">
            <h4 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Client Information</h4>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #475569; line-height: 1.6;">
              <tr><td style="padding: 6px 0; width: 120px;"><strong>Name:</strong></td><td style="padding: 6px 0;">${booking.client_name || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Email:</strong></td><td style="padding: 6px 0;">${booking.client_email || 'N/A'}</td></tr>
              <tr><td style="padding: 6px 0;"><strong>Phone:</strong></td><td style="padding: 6px 0;">${booking.client_phone || 'N/A'}</td></tr>
            </table>
          </div>

          <div>
            <h4 style="font-size: 16px; color: #0f172a; margin: 0 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">Event Specifications</h4>
            <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px; color: #475569; line-height: 1.6;">
              <tr><td style="padding: 6px 0; width: 120px;"><strong>Event Type:</strong></td><td style="padding: 6px 0; font-weight: 600; color: #0f172a;">${booking.event_type || 'N/A'}</td></tr>
              ${booking.artists?.name ? `<tr><td style="padding: 6px 0;"><strong>Artist:</strong></td><td style="padding: 6px 0; color: #3b82f6; font-weight: 700;">${booking.artists.name}</td></tr>` : ''}
              ${booking.event_date ? `<tr><td style="padding: 6px 0;"><strong>Date:</strong></td><td style="padding: 6px 0;">${booking.event_date} ${booking.event_time ? `at ${booking.event_time}` : ''}</td></tr>` : ''}
              ${booking.venue ? `<tr><td style="padding: 6px 0;"><strong>Venue:</strong></td><td style="padding: 6px 0;">${booking.venue}</td></tr>` : ''}
              ${booking.budget ? `<tr><td style="padding: 6px 0;"><strong>Budget:</strong></td><td style="padding: 6px 0; color: #10b981; font-weight: 600;">${booking.budget}</td></tr>` : ''}
            </table>
          </div>
          
          ${booking.notes ? `
            <div style="margin-top: 32px; background-color: #ffffff; padding: 24px; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
              <p style="font-size: 11px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 12px 0;">Client Message</p>
              <p style="font-size: 15px; color: #334155; margin: 0; font-style: italic; line-height: 1.6;">"${booking.notes}"</p>
            </div>
          ` : ''}
        </div>
      `;
    }

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="background-color: #f8fafc; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; color: #0f172a; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px -15px rgba(0,0,0,0.05), 0 0 0 1px rgba(0,0,0,0.05);">
          
          <!-- Header -->
          <div style="background-color: #0f172a; padding: 40px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 28px; font-weight: 900; margin: 0; letter-spacing: -1px;">MAGNEVENTS</h1>
            <p style="color: #94a3b8; font-size: 14px; margin: 8px 0 0 0; font-weight: 500; letter-spacing: 2px; text-transform: uppercase;">Artist Booking Agency</p>
          </div>

          <!-- Body -->
          <div style="padding: 40px;">
            <h2 style="margin-top: 0; font-size: 24px; color: #0f172a; font-weight: 800; letter-spacing: -0.5px;">Hello ${booking ? booking.client_name : 'there'},</h2>
            <p style="font-size: 16px; line-height: 1.7; color: #475569; margin-bottom: 32px; white-space: pre-wrap;">${message}</p>
            
            <div style="margin-top: 40px; border-left: 4px solid #3b82f6; padding-left: 16px;">
              <p style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">Best regards,</p>
              <p style="font-size: 16px; font-weight: 700; color: #3b82f6; margin: 4px 0 0 0;">The Magnevents Team</p>
            </div>
          </div>

          <!-- Context Block -->
          ${contextHtml}

          <!-- Footer -->
          <div style="background-color: #f8fafc; padding: 32px 40px; text-align: center; border-top: 1px solid #e2e8f0;">
            <p style="font-size: 13px; color: #94a3b8; margin: 0; font-weight: 500;">© ${new Date().getFullYear()} Magnevents. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
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
