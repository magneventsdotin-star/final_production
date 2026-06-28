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
      const displayValue = isLink ? `<a href="${href}" style="color: #2563eb; text-decoration: none; font-weight: 600; word-break: break-word;">${value}</a>` : `<span style="color: #0f172a; font-weight: 500; word-break: break-word;">${value}</span>`;
      return `<tr>
        <td style="padding: 10px 0; width: 35%; max-width: 130px; color: #64748b; font-weight: 600; font-size: 13px; vertical-align: top; border-bottom: 1px solid #f1f5f9;">${label}</td>
        <td style="padding: 10px 0; vertical-align: top; font-size: 14px; border-bottom: 1px solid #f1f5f9;">${displayValue}</td>
      </tr>`;
    };

    const buildSection = (title, contentHTML) => {
      if (!contentHTML || contentHTML.trim() === '') return '';
      return `
        <div style="margin-bottom: 24px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
          <div style="background-color: #f8fafc; padding: 14px 20px; border-bottom: 1px solid #e2e8f0;">
            <h4 style="font-size: 13px; font-weight: 800; color: #334155; text-transform: uppercase; letter-spacing: 1px; margin: 0;">${title}</h4>
          </div>
          <div style="padding: 10px 20px;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
              ${contentHTML}
            </table>
          </div>
        </div>
      `;
    };

    // Start background processing so we can return immediately
    const processRequestInBackground = async () => {
      let bookingId = null;
      let dbArtistInfo = null;
      let dbUserProfile = null;
    // 1. Insert ALL requests into Supabase to track them and enable buttons
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
      
      if (data.email) {
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

      if (!bookingData.fk_artist_id && artistName) {
        const { data: artistDataList } = await supabase.from('artists').select('*').or(`name.ilike.${artistName},alias.ilike.${artistName}`).limit(1);
        if (artistDataList && artistDataList.length > 0) {
          dbArtistInfo = artistDataList[0];
          bookingData.fk_artist_id = dbArtistInfo.id;
        }
      }

      const { data: insertedData, error } = await supabase.from('bookings').insert([bookingData]).select().single();
      if (error) {
        console.error("Supabase insert error:", error);
      } else {
        console.log("Successfully saved booking to Supabase");
        bookingId = insertedData.id;
      }
      
      if (!dbArtistInfo && bookingData.fk_artist_id) {
        const { data: artistData } = await supabase.from('artists').select('*').eq('id', bookingData.fk_artist_id).single();
        if (artistData) dbArtistInfo = artistData;
      }

    } catch (dbErr) {
      console.error("Failed to connect to Supabase:", dbErr);
    }

    let contentSections = '';    if (isRegister) {
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

      const renderArtistDetails = (a) => {
        const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.magnevents.in';
        let profileLink = '';
        if (a.id) {
          profileLink = `${adminUrl}/dashboard/artists?id=${a.id}`;
        }
        
        let details = '';
        const keys = Object.keys(a);
        for (const key of keys) {
            if (['id', 'created_at', 'updated_at', 'artist_images', 'images', 'bio'].includes(key)) continue;
            if (a[key] === null || a[key] === undefined || a[key] === '') continue;
            
            const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            let valStr = String(a[key]);
            if (valStr.length > 200) valStr = valStr.substring(0, 200) + '...';
            details += row(label, valStr);
        }
        
        if (profileLink) {
           details += `<tr><td colspan="2" style="padding: 16px 0 10px 0; text-align: center;"><a href="${profileLink}" target="_blank" style="display: inline-block; background-color: #0284c7; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);">Tap to Open Full Artist Profile</a></td></tr>`;
        }
        return buildSection('✨ Requested Artist Details', details);
      };

      if (dbArtistInfo) {
        contentSections += renderArtistDetails(dbArtistInfo);
      } else if (data.selectedArtist && typeof data.selectedArtist === 'object') {
        contentSections += renderArtistDetails(data.selectedArtist);
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



    // 2. Prepare HTML Email body with action buttons if bookingId exists
        let htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="background-color: #f1f5f9; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 20px 10px; -webkit-font-smoothing: antialiased;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01); border: 1px solid #e2e8f0;">
          
          <div style="background-color: #020617; padding: 40px 20px; text-align: center;">
            <h1 style="color: #ffffff; font-size: 26px; font-weight: 900; margin: 0; letter-spacing: -0.5px;">MAGNEVENTS</h1>
            <p style="color: #94a3b8; font-size: 13px; margin: 8px 0 0 0; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">${subjectPrefix}</p>
          </div>

          <div style="padding: 30px 20px;">
            <h2 style="margin-top: 0; font-size: 20px; color: #0f172a; font-weight: 800; margin-bottom: 24px; text-align: center;">You have a new inquiry!</h2>
            ${contentSections}
          </div>
    `;

    if (bookingId) {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.magnevents.in';
      const btnBase = "display: block; width: 100%; box-sizing: border-box; color: #ffffff; padding: 14px 16px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; margin-bottom: 12px; text-align: center; border: 1px solid rgba(0,0,0,0.1);";
      
      const confirmLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=confirm`;
      const approveLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=approve`;
      const moreInfoLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=more_info`;
      const unavailableLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=unavailable`;
      const rejectLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=reject`;
      const customReplyLink = `${adminUrl}/dashboard/requests?reply=${bookingId}&action=custom`;
      const previewLink = `${adminUrl}/dashboard/requests?reply=${bookingId}`;

      htmlBody += `
        <div style="background-color: #f8fafc; padding: 30px 20px; border-top: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h3 style="margin: 0 0 8px 0; color: #0f172a; font-size: 18px; font-weight: 800;">Quick Actions</h3>
            <p style="font-size: 13px; color: #64748b; margin: 0; line-height: 1.5;">Click a button below to review and instantly respond to the client from the dashboard.</p>
          </div>
          
          <div style="max-width: 320px; margin: 0 auto;">
            <a href="${confirmLink}" style="${btnBase} background-color: #10b981; box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);">✅ Confirm Booking</a>
            <a href="${approveLink}" style="${btnBase} background-color: #059669; box-shadow: 0 4px 6px -1px rgba(5, 150, 105, 0.2);">👍 Approve Booking</a>
            
            <div style="height: 1px; background-color: #e2e8f0; margin: 20px 0;"></div>
            
            <a href="${moreInfoLink}" style="${btnBase} background-color: #2563eb; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">📞 Request More Info</a>
            <a href="${customReplyLink}" style="${btnBase} background-color: #7c3aed; box-shadow: 0 4px 6px -1px rgba(124, 58, 237, 0.2);">✍️ Custom Reply</a>
            
            <div style="height: 1px; background-color: #e2e8f0; margin: 20px 0;"></div>
            
            <a href="${unavailableLink}" style="${btnBase} background-color: #ea580c; box-shadow: 0 4px 6px -1px rgba(234, 88, 12, 0.2);">🗓️ Artist Unavailable</a>
            <a href="${rejectLink}" style="${btnBase} background-color: #dc2626; box-shadow: 0 4px 6px -1px rgba(220, 38, 38, 0.2);">❌ Reject / Not Possible</a>
          </div>
          
          <div style="margin-top: 32px; text-align: center;">
            <a href="${previewLink}" style="display: inline-block; background-color: #ffffff; color: #475569; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 13px; border: 1px solid #cbd5e1; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">Open Request in Dashboard</a>
          </div>
        </div>
      `;
    }

    htmlBody += `
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <p style="color: #94a3b8; font-size: 12px; margin: 0;">Sent securely by Magnevents Admin System</p>
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
    }; // End of processRequestInBackground

    // Execute background process without awaiting it
    processRequestInBackground().catch(console.error);

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
