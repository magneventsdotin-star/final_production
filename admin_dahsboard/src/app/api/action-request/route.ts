import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import nodemailer from 'nodemailer';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const type = searchParams.get('type');
    const action = searchParams.get('action');

    if (!id || !type || !action) {
      return new NextResponse('Missing required parameters', { status: 400 });
    }

    let error = null;

    if (type === 'duplicate_approval') {
      const { error: err } = await supabase
        .from('duplicate_approvals')
        .update({
          status: action === 'approve' ? 'approved' : 'rejected',
          approved_by: 'Email Action',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      error = err;
    } else if (type === 'pricing_plan') {
      const { error: err } = await supabase
        .from('pricing_plans')
        .update({
          is_live: action === 'approve',
          pending_approval: false
        })
        .eq('id', id);
      error = err;
    } else if (type === 'client_request') {
      const { data: booking, error: fetchErr } = await supabase
        .from('bookings')
        .select('*, artists(name)')
        .eq('id', id)
        .single();
      
      if (fetchErr) {
        error = fetchErr;
      } else {
        let newStatus = 'cancelled';
        if (action === 'confirm' || action === 'approve') newStatus = 'confirmed';
        else if (action === 'more_info' || action === 'unavailable') newStatus = 'pending';

        const { error: err } = await supabase
          .from('bookings')
          .update({ status: newStatus })
          .eq('id', id);
        error = err;

        // Send confirmation email to client
        if (!error && booking && booking.client_email && booking.client_email !== 'N/A') {
          try {
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
              },
            });

            let clientMessage = '';
            let subject = 'Update on your Magnevents Request';
            const artistName = booking.artists?.name ? ` for ${booking.artists.name}` : '';

            if (action === 'confirm' || action === 'approve') {
              subject = 'Your Magnevents Booking is Confirmed!';
              clientMessage = `Great news! Your booking request${artistName} has been approved and confirmed by our team. We will reach out shortly with the final contract and next steps.`;
              if (booking.event_type === 'Artist Registration') {
                subject = 'Welcome to Magnevents!';
                clientMessage = `Your artist registration has been reviewed and approved by our team. Welcome aboard!`;
              }
            } else if (action === 'more_info') {
              subject = 'Magnevents - Action Required for your Request';
              clientMessage = `Thank you for reaching out to Magnevents! We are reviewing your request, but we need a few more details to proceed. One of our specialists will call you shortly to discuss your specific needs.`;
            } else if (action === 'unavailable') {
              subject = 'Update regarding your Magnevents Booking';
              clientMessage = `Thank you for your interest! Unfortunately, the requested artist is unavailable on your selected dates. However, we have several amazing alternative artists that fit your vibe and budget. Let us know when is a good time to call you to discuss options!`;
            } else if (action === 'reject') {
              subject = 'Update regarding your Magnevents Request';
              clientMessage = `Thank you for reaching out to Magnevents. Unfortunately, we are unable to fulfill your request at this time. We apologize for the inconvenience and wish you the best for your event.`;
            }

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
                    <p style="font-size: 16px; line-height: 1.7; color: #475569; margin-bottom: 32px; white-space: pre-wrap;">${clientMessage}</p>
                    
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
              to: booking.client_email,
              subject: subject,
              html: htmlBody,
            });
            console.log(`Client email sent successfully for action: ${action}`);
          } catch (mailErr) {
            console.error("Failed to send client email:", mailErr);
          }
        }
      }
    } else {
      return new NextResponse('Invalid request type', { status: 400 });
    }

    if (error) throw error;

    // Return a simple success page
    let bgColor = '#10b981'; // default green
    let text = 'Action Processed Successfully!';
    let titleStr = 'Success';
    let icon = '✓';

    if (action === 'approve' || action === 'confirm') {
      bgColor = '#10b981';
      text = 'Request Approved Successfully!';
      titleStr = 'Approved';
      icon = '✓';
    } else if (action === 'more_info') {
      bgColor = '#3b82f6'; // blue
      text = 'Client Notified for More Info!';
      titleStr = 'More Info';
      icon = '📞';
    } else if (action === 'unavailable') {
      bgColor = '#f59e0b'; // orange
      text = 'Client Notified: Artist Unavailable';
      titleStr = 'Unavailable';
      icon = '🗓️';
    } else if (action === 'reject') {
      bgColor = '#ef4444'; // red
      text = 'Request Rejected Successfully!';
      titleStr = 'Rejected';
      icon = '✕';
    }
    
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${titleStr} - Magnevents</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&display=swap');
            
            body {
              font-family: 'Inter', sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #0B0E14; /* Dark sleek background */
              background-image: radial-gradient(circle at top right, rgba(91, 90, 247, 0.1), transparent 400px), 
                                radial-gradient(circle at bottom left, rgba(91, 90, 247, 0.05), transparent 400px);
            }
            .card {
              text-align: center;
              background: #141824;
              padding: 48px 40px;
              border-radius: 24px;
              box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
              border: 1px solid rgba(255, 255, 255, 0.05);
              max-width: 400px;
              width: 90%;
              animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
            }
            .logo-container {
              margin-bottom: 32px;
            }
            .logo-container img {
              height: 48px;
              width: auto;
            }
            .icon-circle {
              background-color: ${bgColor};
              color: white;
              width: 72px;
              height: 72px;
              border-radius: 50%;
              display: flex;
              justify-content: center;
              align-items: center;
              margin: 0 auto 24px auto;
              font-size: 36px;
              box-shadow: 0 0 24px ${bgColor}66;
              animation: scaleIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.2s both;
            }
            h1 {
              color: #ffffff;
              margin: 0 0 12px 0;
              font-size: 24px;
              font-weight: 800;
              letter-spacing: -0.02em;
            }
            p {
              color: #94a3b8;
              font-size: 15px;
              line-height: 1.6;
              margin: 0;
            }
            .button {
              display: inline-block;
              margin-top: 32px;
              padding: 12px 24px;
              background-color: rgba(255, 255, 255, 0.05);
              color: #ffffff;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 14px;
              transition: all 0.2s;
              border: 1px solid rgba(255, 255, 255, 0.1);
            }
            .button:hover {
              background-color: rgba(255, 255, 255, 0.1);
            }
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes scaleIn {
              from { opacity: 0; transform: scale(0.5); }
              to { opacity: 1; transform: scale(1); }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo-container">
              <!-- Using the same logo as the dashboard -->
              <img src="/logo.webp" alt="Magnevents Logo" onerror="this.src='https://ui-avatars.com/api/?name=Magnevents&background=0D8ABC&color=fff&rounded=true'"/>
            </div>
            <div class="icon-circle">
              ${icon}
            </div>
            <h1>${text}</h1>
            <p>Your action has been recorded in the database and confirmation emails have been dispatched.</p>
            <a href="javascript:window.close();" class="button">Close Window</a>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    });
  } catch (err: any) {
    console.error("Action error:", err);
    return new NextResponse('Internal Server Error: ' + err.message, { status: 500 });
  }
}
