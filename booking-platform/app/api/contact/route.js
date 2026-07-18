import nodemailer from 'nodemailer';
import { buildEmailTemplate, row, buildSection } from '@/app/services/api/contact.service.js';

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

    let subjectPrefix = "Client Booking Requests";
    if (isRegister) subjectPrefix = "🎤 New Artist Registration";
    else if (isCallRequest) subjectPrefix = "Event Inquiries";

    let emailBody = '';

    // Start background processing so we can return immediately
    const processRequestInBackground = async () => {
      let bookingId = null;
      let dbArtistInfo = null;
      let dbUserProfile = null;
    // 1. Insert ALL requests into Supabase to track them and enable buttons
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // Track API hit asynchronously
      const reqUrl = new URL(req.url);
      const origin = reqUrl.origin;
      fetch(`${origin}/api/analytics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          path: '/api/contact',
          type: 'api_call',
          userAgent: req.headers.get('user-agent') || 'unknown',
          sessionId: 'api-call'
        })
      }).catch(() => {});

      if (!data.name || !data.email) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('email', data.email).maybeSingle();
        if (profileData) {
          dbUserProfile = profileData;
        }
      }

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
        extraNotes = `Category: ${data.category || 'N/A'}\nCity: ${data.city || 'N/A'}\nPortfolio: ${data.portfolio || 'N/A'}\nPerformance Price: ${data.price ? '₹' + data.price : 'N/A'}\nBio: ${data.bio || 'N/A'}`;
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
        bookingData.artist_id = data.selectedArtist.id;
      }

      if (!bookingData.artist_id && artistName) {
        const { data: artistDataList } = await supabase.from('artists').select('*').or(`name.ilike.${artistName},alias.ilike.${artistName}`).limit(1);
        if (artistDataList && artistDataList.length > 0) {
          dbArtistInfo = artistDataList[0];
          bookingData.artist_id = dbArtistInfo.id;
        }
      }

      const { data: insertedData, error } = await supabase.from('bookings').insert([bookingData]).select().single();
      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        console.log("Successfully saved booking to Supabase");
        bookingId = insertedData.id;
      }
      
      if (!dbArtistInfo && bookingData.artist_id) {
        const { data: artistData } = await supabase.from('artists').select('*').eq('id', bookingData.artist_id).single();
        if (artistData) dbArtistInfo = artistData;
      }
      
      // Fallback: If cover_image_url is missing, grab the first image from artist_images
      if (dbArtistInfo && !dbArtistInfo.cover_image_url) {
        const { data: artistImages } = await supabase.from('artist_images').select('image_url').eq('artist_id', dbArtistInfo.id).limit(1);
        if (artistImages && artistImages.length > 0) {
          dbArtistInfo.cover_image_url = artistImages[0].image_url;
        }
      }

      // Fetch the admin who created the artist profile
      if (dbArtistInfo && dbArtistInfo.created_by) {
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', dbArtistInfo.created_by).single();
        if (profileData) dbArtistInfo.adminProfile = profileData;
      }

    } catch (dbErr) {
      console.error("Failed to connect to Supabase:", dbErr);
    }

    let coverPhotoHtml = '';
    if (dbArtistInfo && dbArtistInfo.cover_image_url) {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.magnevents.in';
      const profileLink = dbArtistInfo.id ? `${adminUrl}/dashboard/artists?id=${dbArtistInfo.id}` : '#';
      
      let extraInfoHtml = '';
      if (dbArtistInfo.email) extraInfoHtml += `<span style="display: block; color: #94a3b8; font-size: 13px; margin-bottom: 4px;">📧 ${dbArtistInfo.email}</span>`;
      if (dbArtistInfo.phone_no) extraInfoHtml += `<span style="display: block; color: #94a3b8; font-size: 13px; margin-bottom: 4px;">📞 ${dbArtistInfo.phone_no}</span>`;
      if (dbArtistInfo.available_bookings !== undefined && dbArtistInfo.available_bookings !== null) extraInfoHtml += `<span style="display: block; color: #10b981; font-size: 13px; font-weight: 600; margin-top: 8px;">📅 ${dbArtistInfo.available_bookings} Bookings Available</span>`;

      coverPhotoHtml = `
        <div style="margin-bottom: 32px; border-radius: 16px; overflow: hidden; background-color: #1e293b; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);">
          <img src="${dbArtistInfo.cover_image_url}" alt="${dbArtistInfo.name || dbArtistInfo.alias}" style="width: 100%; max-height: 250px; object-fit: cover; display: block;" />
          <div style="padding: 24px 20px; text-align: center;">
            <h3 style="margin: 0 0 12px 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">${dbArtistInfo.name || dbArtistInfo.alias}</h3>
            <div style="margin: 0 0 16px 0;">
              <span style="display: inline-block; background: rgba(251, 191, 36, 0.1); color: #fbbf24; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; margin: 4px;">${dbArtistInfo.category || 'Artist'}</span>
              ${dbArtistInfo.city ? `<span style="display: inline-block; background: rgba(255, 255, 255, 0.1); color: #cbd5e1; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 12px; margin: 4px;">📍 ${dbArtistInfo.city}</span>` : ''}
            </div>
            <div style="margin-bottom: 20px;">
              ${extraInfoHtml}
            </div>
            <a href="${profileLink}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);">Open Full Artist Profile</a>
          </div>
        </div>
      `;
    }

    if (isRegister) {
      emailBody = `New Artist Registration from ${data.name || 'Unknown'}\nPhone: ${data.phone || 'N/A'}\nEmail: ${data.email || 'N/A'}`;
    } else {
      emailBody = `New Inquiry from ${data.name || 'Unknown'}\nPhone: ${data.phone || 'N/A'}\nEmail: ${data.email || 'N/A'}`;
    }

    let contentSections = buildEmailTemplate(data, isRegister, isCallRequest, dbArtistInfo, coverPhotoHtml);

    if (data.selectedArtist && typeof data.selectedArtist === 'object') {
        // contentSections += renderArtistDetails(data.selectedArtist);
      } else if (artistName) {
        // contentSections += buildSection('✨ Requested Artist Details', row('Artist Name', artistName));
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



    // 2. Prepare HTML Email body with action buttons
    
    let htmlBody = `
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
              <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #0f172a; border-radius: 20px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden; text-align: left;">
                
                <div style="background: url('https://www.transparenttextures.com/patterns/stardust.png'), linear-gradient(135deg, #020617 0%, #0f172a 100%); padding: 50px 20px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                  <h1 style="color: #ffffff; font-size: 32px; font-weight: 900; margin: 0; letter-spacing: 2px;">MAGNEVENTS</h1>
                  <p style="color: #fbbf24; font-size: 12px; margin: 16px 0 0 0; font-weight: 700; letter-spacing: 4px; text-transform: uppercase;">${subjectPrefix}</p>
                </div>

                <div style="padding: 40px 24px; background-color: #0f172a;">
                  <h2 style="margin-top: 0; font-size: 24px; color: #ffffff; font-weight: 700; margin-bottom: 32px; text-align: center;">You have a new inquiry!</h2>
                  ${contentSections}
                </div>
      `;

      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.magnevents.in';
      const btnBase = "display: block; width: 100%; box-sizing: border-box; color: #ffffff; padding: 14px 16px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-bottom: 12px; text-align: center; border: 1px solid rgba(0,0,0,0.1);";
      
      const bId = bookingId || 'unknown';
      const confirmLink = `${adminUrl}/dashboard/requests?reply=${bId}&action=confirm`;
      const approveLink = `${adminUrl}/dashboard/requests?reply=${bId}&action=approve`;
      const moreInfoLink = `${adminUrl}/dashboard/requests?reply=${bId}&action=more_info`;
      const unavailableLink = `${adminUrl}/dashboard/requests?reply=${bId}&action=unavailable`;
      const rejectLink = `${adminUrl}/dashboard/requests?reply=${bId}&action=reject`;
      const customReplyLink = `${adminUrl}/dashboard/requests?reply=${bId}&action=custom`;
      const previewLink = `${adminUrl}/dashboard/requests?reply=${bId}`;

      const premiumBtnBase = "display: block; width: 100%; box-sizing: border-box; color: #ffffff; padding: 14px 16px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin-bottom: 12px; text-align: center; border: 1px solid rgba(255,255,255,0.1);";
      
      let buttonsHtml = '';
      const whatsappLink = data.phone ? `https://wa.me/${data.phone.replace(/[^0-9]/g, '')}` : '#';

      if (isRegister) {
        const approveArtistLink = `${adminUrl}/dashboard/artist-requests?reply=${bId}&action=approve_artist`;
        const morePortfolioLink = `${adminUrl}/dashboard/artist-requests?reply=${bId}&action=more_portfolio`;
        const rejectArtistLink = `${adminUrl}/dashboard/artist-requests?reply=${bId}&action=reject_artist`;
        
        buttonsHtml = `
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #25D366; box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.2);">💬 Direct Connect on WhatsApp</a>
            
            <div style="height: 1px; background-color: rgba(255,255,255,0.05); margin: 24px 0;"></div>

            <a href="${approveArtistLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #7c3aed; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">✅ Approve Artist</a>
            
            <div style="height: 1px; background-color: rgba(255,255,255,0.05); margin: 24px 0;"></div>
            
            <a href="${morePortfolioLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #2563eb; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">📂 Request Portfolio</a>
            <a href="${customReplyLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #9333ea; box-shadow: 0 4px 6px -1px rgba(147, 51, 234, 0.2);">✉️ Send Custom Reply</a>
            
            <div style="height: 1px; background-color: rgba(255,255,255,0.05); margin: 24px 0;"></div>
            
            <a href="${rejectArtistLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #dc2626; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);">❌ Reject Artist</a>
        `;
      } else {
        buttonsHtml = `
            <a href="${whatsappLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #25D366; box-shadow: 0 4px 6px -1px rgba(37, 211, 102, 0.2);">💬 Direct Connect on WhatsApp</a>
            
            <div style="height: 1px; background-color: rgba(255,255,255,0.05); margin: 24px 0;"></div>

            <a href="${confirmLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #10b981; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">✅ Confirm Booking</a>
            <a href="${approveLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #059669; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">👍 Approve Booking</a>
            
            <div style="height: 1px; background-color: rgba(255,255,255,0.05); margin: 24px 0;"></div>
            
            <a href="${moreInfoLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #2563eb; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">📞 Request More Info</a>
            <a href="${customReplyLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #7c3aed; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">✍️ Custom Reply</a>
            
            <div style="height: 1px; background-color: rgba(255,255,255,0.05); margin: 24px 0;"></div>
            
            <a href="${unavailableLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #ea580c; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.2);">🗓️ Artist Unavailable</a>
            <a href="${rejectLink}" target="_blank" rel="noopener noreferrer" style="${premiumBtnBase} background-color: #dc2626; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);">❌ Reject / Not Possible</a>
        `;
      }

      htmlBody += `
        <div style="background-color: #020617; padding: 40px 24px; border-top: 1px solid rgba(255,255,255,0.05); border-bottom-left-radius: 24px; border-bottom-right-radius: 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h3 style="margin: 0 0 8px 0; color: ${isRegister ? '#c084fc' : '#ffffff'}; font-size: 20px; font-weight: 700; letter-spacing: 1px;">${isRegister ? 'ARTIST REVIEW' : 'QUICK ACTIONS'}</h3>
            <p style="font-size: 13px; color: #94a3b8; margin: 0; line-height: 1.6;">${isRegister ? 'Review the artist profile and decide whether to approve, request more information, or reject the application.' : 'Review and respond to the client instantly.'}</p>
          </div>
          
          <div style="max-width: 320px; margin: 0 auto;">
            ${buttonsHtml}
          </div>
          
          <div style="margin-top: 40px; text-align: center;">
            <a href="${isRegister ? `${adminUrl}/dashboard/artist-requests?reply=${bId}` : previewLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; background-color: transparent; color: ${isRegister ? '#c084fc' : '#fbbf24'}; padding: 14px 28px; border-radius: 12px; text-decoration: none; font-weight: 700; font-size: 13px; border: 1px solid ${isRegister ? '#c084fc' : '#fbbf24'}; letter-spacing: 1px; text-transform: uppercase;">Open in Dashboard</a>
          </div>
        </div>
              </div>
            </td>
          </tr>
        </table>
      `;
    
    htmlBody += `
        <div style="text-align: center; margin-top: 24px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">${isRegister ? 'This email was generated from a new Artist Registration submission.' : 'Sent securely by Magnevents Admin System'}</p>
        </div>
      </body>
      </html>
    `;
    

    const mailOptions = {
      from: `"${subjectPrefix} - Magnevents" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: `${subjectPrefix} - ${data.name}`,
      text: emailBody,
      html: htmlBody,
    };

    let emailStatus = 'sent';
    try {
      await transporter.sendMail(mailOptions);
      console.log("Email dispatched successfully.");
    } catch (err) {
      console.error("Email sending error:", err);
      emailStatus = 'failed';
    }
    
    // Log email to database
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      // Use service role key if available for server-side insertions, else anon key
      const supabaseClient = createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseKey);
      
      await supabaseClient.from('emails').insert([{
        booking_id: bookingId,
        recipient_email: process.env.EMAIL_USER,
        subject: `${subjectPrefix} - ${data.name}`,
        body: emailBody + '\\n\\n' + htmlBody, // simplified storage
        email_type: isRegister ? 'artist_registration_inquiry' : 'client_inquiry',
        status: emailStatus
      }]);
    } catch (dbErr) {
      console.error("Failed to log email to database:", dbErr);
    }
    }; // End of processRequestInBackground

    // Execute process and await it so Vercel doesn't kill the serverless function prematurely
    await processRequestInBackground();

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
