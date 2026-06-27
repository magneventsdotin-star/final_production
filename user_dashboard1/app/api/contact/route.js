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

    if (isRegister) {
      emailBody = `
You have received a new Artist Registration from Magnevents!

========================================
👤 ARTIST DETAILS
========================================
Name:           ${data.name || 'N/A'}
Email:          ${data.email || 'N/A'}
Phone:          ${data.phone || 'N/A'}
Category:       ${data.category || 'N/A'}

========================================
🔗 PORTFOLIO & SOCIALS
========================================
Link:           ${data.portfolio || 'N/A'}

========================================
📝 BIO & EXPERIENCE
========================================
${data.bio || 'No bio provided.'}
      `;
    } else {
      let artistDetailsString = '';
      if (data.selectedArtist && typeof data.selectedArtist === 'object') {
        const a = data.selectedArtist;
        artistDetailsString = `
========================================
✨ REQUESTED ARTIST DETAILS
========================================
Artist Name:    ${a.name || 'N/A'}
Category:       ${a.subCategory || a.category || 'N/A'}
Location:       ${[a.city, a.state].filter(Boolean).join(', ') || a.location || 'N/A'}
Languages:      ${a.languages || 'N/A'}
Price Range:    ${a.priceMin && a.priceMax ? `₹${a.priceMin} - ₹${a.priceMax}` : (a.priceMin ? `Starting at ₹${a.priceMin}` : 'N/A')}
`;
      } else if (artistName) {
        artistDetailsString = `
========================================
✨ REQUESTED ARTIST DETAILS
========================================
Artist Name:    ${artistName}
`;
      }

      let planDetailsString = '';
      if (data.selectedPlan && typeof data.selectedPlan === 'object') {
        const p = data.selectedPlan;
        planDetailsString = `
========================================
📦 SELECTED PRICING PACKAGE
========================================
Package Name:   ${p.name || 'N/A'}
Starts From:    ${p.price || 'N/A'}
Tagline:        ${p.tagline || 'N/A'}
Features:       ${p.features && p.features.length > 0 ? p.features.join(', ') : 'N/A'}
`;
      }
      let serviceDetailsString = '';
      if (data.selectedService && typeof data.selectedService === 'object') {
        const s = data.selectedService;
        serviceDetailsString = `
========================================
🛠️ SELECTED SERVICE DETAILS
========================================
Service Title:  ${s.title || 'N/A'}
Description:    ${s.desc || 'N/A'}
`;
      }

      emailBody = `
You have received a new inquiry from Magnevents!

========================================
👤 USER & CONTACT DETAILS
========================================
Name:           ${data.name || 'N/A'}
Email:          ${data.email || 'N/A'}
Phone:          ${data.phone || 'N/A'}

========================================
📅 EVENT DETAILS
========================================
Event Type:     ${data.eventType || 'N/A'}
Event Date:     ${data.date || 'N/A'}
Location:       ${data.location || 'N/A'}
Requested Type: ${data.artistType && data.artistType.length > 0 ? data.artistType.join(', ') : 'N/A'}
Budget:         ${data.budget || 'N/A'}

========================================
📝 ADDITIONAL MESSAGE
========================================
${data.message || 'No additional message provided.'}
${artistDetailsString}${planDetailsString}${serviceDetailsString}
      `;
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
    let htmlBody = `<div style="font-family: sans-serif; white-space: pre-wrap;">${emailBody}</div>`;
    if (bookingId) {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.magnevents.in';
      const btnBase = "display: inline-block; color: #ffffff; padding: 10px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; margin-right: 8px; margin-bottom: 8px;";
      
      const confirmLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=confirm`;
      const moreInfoLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=more_info`;
      const unavailableLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=unavailable`;
      const rejectLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=reject`;
      const customReplyLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=custom`;
      const previewLink = `${adminUrl}/dashboard/requests`;

      htmlBody += `
        <div style="margin-top: 24px; font-family: sans-serif; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          <h3 style="margin-top: 0; color: #334155; font-size: 16px;">Quick Replies</h3>
          <p style="font-size: 13px; color: #64748b; margin-bottom: 12px;">Click a button below to open the dashboard and review your email response before sending.</p>
          <div style="display: flex; flex-wrap: wrap;">
            <a href="${confirmLink}" style="${btnBase} background-color: #10b981;">✅ Confirm Booking</a>
            <a href="${moreInfoLink}" style="${btnBase} background-color: #3b82f6;">📞 Request More Info</a>
            <a href="${unavailableLink}" style="${btnBase} background-color: #f59e0b;">🗓️ Artist Unavailable</a>
            <a href="${rejectLink}" style="${btnBase} background-color: #ef4444;">❌ Reject / Not Possible</a>
            <a href="${customReplyLink}" style="${btnBase} background-color: #8b5cf6;">✍️ Custom Reply</a>
          </div>
          <div style="margin-top: 12px;">
            <a href="${previewLink}" style="display: inline-block; background-color: #f1f5f9; color: #475569; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px; border: 1px solid #cbd5e1;">Preview in Dashboard</a>
          </div>
        </div>
      `;
    }

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
