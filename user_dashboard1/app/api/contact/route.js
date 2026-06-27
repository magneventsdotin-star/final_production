import nodemailer from 'nodemailer';

export async function POST(req) {
  try {
    const data = await req.json();


    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });


    const isRegister = data.type === 'register' || data.formType === 'register' || data.type === 'artist_registration';
    const isCallRequest = data.type === 'call_request';
    const artistName = typeof data.selectedArtist === 'object' && data.selectedArtist !== null ? data.selectedArtist.name : (data.selectedArtist || '');

    let subjectPrefix = "New Booking Inquiry";
    if (isRegister) subjectPrefix = "Artist Registration";
    else if (isCallRequest) subjectPrefix = "Call Request";

        let emailBody = '';
    const row = (label, value, isLink = false, href = '') => {
      if (!value || value === 'N/A') return '';
      const displayValue = isLink ? `<a href="${href}" style="color: #3b82f6; text-decoration: none; font-weight: 600;">${value}</a>` : `<strong style="color: #0f172a;">${value}</strong>`;
      return `<tr><td style="padding: 8px 0; width: 140px; color: #64748b; font-weight: 500;">${label}</td><td style="padding: 8px 0;">${displayValue}</td></tr>`;
    };

    const buildSection = (title, contentHTML) => {
      if (!contentHTML || contentHTML.trim() === '') return '';
      return `
        <div style="margin-bottom: 32px;">
          <h4 style="font-size: 13px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px; margin: 0 0 12px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px;">${title}</h4>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 15px; color: #334155; line-height: 1.6;">
            ${contentHTML}
          </table>
        </div>
      `;
    };

    let contentSections = '';

    if (isRegister) {
      emailBody = `New Artist Registration from ${data.name || 'Unknown'}\nPhone: ${data.phone || 'N/A'}\nEmail: ${data.email || 'N/A'}`;
      contentSections += buildSection('👤 Artist Details', 
        row('Name', data.name) +
        row('Email', data.email, true, `mailto:${data.email}`) +
        row('Phone', data.phone, true, `tel:${data.phone}`) +
        row('Category', data.category)
      );
      contentSections += buildSection('🔗 Portfolio & Socials', row('Link', data.portfolio, true, data.portfolio));
      contentSections += buildSection('📝 Bio & Experience', `<tr><td style="padding: 8px 0; color: #0f172a;">${data.bio || 'No bio provided.'}</td></tr>`);
    } else {
      emailBody = `New Inquiry from ${data.name || 'Unknown'}\nPhone: ${data.phone || 'N/A'}\nEmail: ${data.email || 'N/A'}`;
      contentSections += buildSection('👤 User & Contact Details', 
        row('Name', data.name) +
        row('Email', data.email, true, `mailto:${data.email}`) +
        row('Phone', data.phone, true, `tel:${data.phone}`)
      );

      contentSections += buildSection('📅 Event Details', 
        row('Event Type', data.eventType) +
        row('Event Date', data.date) +
        row('Location', data.location) +
        row('Requested Type', data.artistType && data.artistType.length > 0 ? data.artistType.join(', ') : '') +
        row('Budget', data.budget)
      );

      contentSections += buildSection('📝 Additional Message', `<tr><td style="padding: 16px; background-color: #f8fafc; border-radius: 8px; font-style: italic; color: #475569; border: 1px solid #e2e8f0;">"${data.message || 'No additional message provided.'}"</td></tr>`);

      if (data.selectedArtist && typeof data.selectedArtist === 'object') {
        const a = data.selectedArtist;
        const price = a.priceMin && a.priceMax ? `₹${a.priceMin} - ₹${a.priceMax}` : (a.priceMin ? `Starting at ₹${a.priceMin}` : '');
        contentSections += buildSection('✨ Requested Artist Details', 
          row('Artist Name', a.name) +
          row('Category', a.subCategory || a.category) +
          row('Location', [a.city, a.state].filter(Boolean).join(', ') || a.location) +
          row('Languages', a.languages) +
          row('Price Range', price)
        );
      } else if (artistName) {
        contentSections += buildSection('✨ Requested Artist Details', row('Artist Name', artistName));
      }

      if (data.selectedPlan && typeof data.selectedPlan === 'object') {
        const p = data.selectedPlan;
        contentSections += buildSection('📦 Selected Pricing Package', 
          row('Package Name', p.name) +
          row('Starts From', p.price) +
          row('Tagline', p.tagline) +
          row('Features', p.features && p.features.length > 0 ? p.features.join(', ') : '')
        );
      }
      if (data.selectedService && typeof data.selectedService === 'object') {
        const s = data.selectedService;
        contentSections += buildSection('🛠️ Selected Service Details', 
          row('Service Title', s.title) +
          row('Description', s.desc)
        );
      }
    }

    let bookingId = null;

    // 1. Insert ALL requests into Supabase to track them and enable buttons
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      
      let numericBudget = 0;
      if (data.budget) {
        if (data.budget.includes('5k_10k')) numericBudget = 10000;
        else if (data.budget.includes('10k_20k')) numericBudget = 20000;
        else if (data.budget.includes('20k_35k')) numericBudget = 35000;
        else if (data.budget.includes('35k_50k')) numericBudget = 50000;
        else if (data.budget.includes('50k_80k')) numericBudget = 80000;
        else if (data.budget.includes('80k_1.2L')) numericBudget = 120000;
        else if (data.budget.includes('1.2L_1.5L')) numericBudget = 150000;
        else if (data.budget.includes('1.5L_2L')) numericBudget = 200000;
        else if (data.budget.includes('2L_3L')) numericBudget = 300000;
        else if (data.budget.includes('3L_5L')) numericBudget = 500000;
        else if (data.budget.includes('5L_plus')) numericBudget = 500000;
        else numericBudget = 5000;
      }

      let evType = data.eventType || 'N/A';
      let extraNotes = data.message || (data.artistType ? `Requested Types: ${data.artistType.join(', ')}` : '');

      if (isRegister) {
        evType = 'Artist Registration';
        extraNotes = `Category: ${data.category || 'N/A'}\nPortfolio: ${data.portfolio || 'N/A'}\nBio: ${data.bio || 'N/A'}`;
      } else if (isCallRequest) {
        evType = 'Call Request';
      }

      const bookingData = {
        client_name: data.name || 'Unknown',
        client_email: data.email || 'N/A',
        client_phone: data.phone || 'N/A',
        event_type: evType,
        event_date: data.date || null,
        venue: data.location || 'TBD',
        budget: numericBudget,
        notes: extraNotes,
        status: 'pending',
        booking_source: 'client',
      };

      if (data.selectedArtist && data.selectedArtist.id) {
        bookingData.fk_artist_id = data.selectedArtist.id;
      }

      const { data: insertedData, error } = await supabase.from('bookings').insert([bookingData]).select().single();
      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        console.log("Successfully saved booking to Supabase");
        bookingId = insertedData.id;
      }
    } catch (dbErr) {
      console.error("Failed to connect to Supabase:", dbErr);
    }

    // 2. Prepare HTML Email body with action buttons if bookingId exists
        let htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
      </head>
      <body style="background-color: #f1f5f9; font-family: 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 40px 20px; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);">
          
          <div style="background-color: #0f172a; padding: 32px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">MAGNEVENTS</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0 0; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">${subjectPrefix}</p>
          </div>

          <div style="padding: 40px;">
            <h2 style="margin-top: 0; font-size: 20px; color: #0f172a; font-weight: 800; margin-bottom: 32px;">You have received a new inquiry!</h2>
            ${contentSections}
          </div>
    `;

    if (bookingId) {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.magnevents.in';
      const btnBase = "display: inline-block; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; margin-right: 8px; margin-bottom: 8px;";
      
      const confirmLink = `${adminUrl}/api/action-request?id=${bookingId}&type=client_request&action=confirm`;
      const approveLink = `${adminUrl}/api/action-request?id=${bookingId}&type=client_request&action=approve`;
      const moreInfoLink = `${adminUrl}/api/action-request?id=${bookingId}&type=client_request&action=more_info`;
      const unavailableLink = `${adminUrl}/api/action-request?id=${bookingId}&type=client_request&action=unavailable`;
      const rejectLink = `${adminUrl}/api/action-request?id=${bookingId}&type=client_request&action=reject`;
      const customReplyLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=custom`;
      const previewLink = `${adminUrl}/dashboard/requests`;

      htmlBody += `
        <div style="background-color: #f8fafc; padding: 32px 40px; border-top: 1px solid #e2e8f0;">
          <h3 style="margin-top: 0; color: #334155; font-size: 16px;">Quick Replies</h3>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 16px;">Clicking these buttons will <b>instantly</b> send a standard email to the client. Use Custom Reply to write your own message.</p>
          <div style="display: flex; flex-wrap: wrap;">
            <a href="${confirmLink}" style="${btnBase} background-color: #10b981;">✅ Confirm Booking</a>
            <a href="${approveLink}" style="${btnBase} background-color: #059669;">👍 Approve Booking</a>
            <a href="${moreInfoLink}" style="${btnBase} background-color: #3b82f6;">📞 Request More Info</a>
            <a href="${customReplyLink}" style="${btnBase} background-color: #8b5cf6;">✍️ Custom Reply</a>
            <a href="${unavailableLink}" style="${btnBase} background-color: #f59e0b;">🗓️ Artist Unavailable</a>
            <a href="${rejectLink}" style="${btnBase} background-color: #ef4444;">❌ Reject / Not Possible</a>
          </div>
          <div style="margin-top: 16px;">
            <a href="${previewLink}" style="display: inline-block; background-color: #e2e8f0; color: #334155; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">Preview in Dashboard</a>
          </div>
        </div>
      `;
    }

    htmlBody += `
        </div>
      </body>
      </html>
    `;
    

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `${subjectPrefix} - ${data.name}`,
      text: emailBody,
      html: htmlBody,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log("Email dispatched successfully.");
    } catch (err) {
      console.error("Email sending error:", err);
    }

    return new Response(JSON.stringify({ success: true, message: 'Request processed successfully!' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error("Email send error:", error);
    return new Response(JSON.stringify({ error: "Failed to send email" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
