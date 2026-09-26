// Contact Service to handle DB operations and Email building

export const row = (label, value, isLink = false, href = '') => {
  if (!value || value === 'N/A') return '';
  const displayValue = isLink ? `<a href="${href}" style="color: #fbbf24; text-decoration: none; font-weight: 600; word-break: break-word;">${value}</a>` : `<span style="color: #f8fafc; font-weight: 500; word-break: break-word; font-size: 15px;">${value}</span>`;
  return `<tr>
    <td style="padding: 16px 0; width: 35%; max-width: 140px; color: #94a3b8; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.05);">${label}</td>
    <td style="padding: 16px 0; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.05);">${displayValue}</td>
  </tr>`;
};

export const buildSection = (title, contentHTML) => {
    if (!contentHTML || contentHTML.trim() === '') return '';
    return `
      <div style="margin-bottom: 32px; background-color: #1e293b; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3);">
        <div style="background: linear-gradient(90deg, rgba(251, 191, 36, 0.1) 0%, transparent 100%); padding: 18px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); border-top-left-radius: 16px; border-top-right-radius: 16px;">
          <h4 style="font-size: 12px; font-weight: 700; color: #fbbf24; text-transform: uppercase; letter-spacing: 2px; margin: 0;">${title}</h4>
        </div>
        <div style="padding: 8px 24px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse;">
            ${contentHTML}
          </table>
        </div>
    </div>
  `;
};

export const buildEmailTemplate = (data, isRegister, isCallRequest, dbArtistInfo, coverPhotoHtml) => {
  let contentSections = '';
  
  if (isRegister) {
    contentSections += buildSection('🎤 Artist Details', 
      row('Artist Name', data.name) +
      row('Email', data.email, true, `mailto:${data.email}`) +
      row('Phone', data.phone, true, `tel:${data.phone}`) +
      row('Category', data.category) +
      row('City', data.city) +
      row('Price', data.price ? '₹' + data.price : 'N/A')
    );
    contentSections += buildSection('🎵 Portfolio & Socials', row('Portfolio', data.portfolio, true, data.portfolio));
    
    const formUrl = data.formLink || data.pageUrl || '';
    if (formUrl || data.formName || data.formNumber) {
      if (formUrl) {
        const extraLabel = data.formName ? `<div style="margin-top: 4px; font-size: 12px; color: #94a3b8; font-weight: 400;">(${data.formName})</div>` : '';
        const linkDisplay = `<a href="${formUrl}" target="_blank" style="color: #fbbf24; text-decoration: underline; font-weight: 600; word-break: break-all;">${formUrl} ↗</a>${extraLabel}`;
        contentSections += buildSection('📋 Source Form', `<tr>
          <td style="padding: 16px 0; width: 35%; max-width: 140px; color: #94a3b8; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.05);">Form Link</td>
          <td style="padding: 16px 0; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.05);">${linkDisplay}</td>
        </tr>`);
      } else {
        contentSections += buildSection('📋 Source Form', row('Form Link', (data.formName || data.formNumber)));
      }
    }

    contentSections += buildSection('🎭 Bio & Experience', `<tr><td style="padding: 8px 0; color: #fbbf24;">${data.bio || 'No bio provided.'}</td></tr>`);
  } else {
    const nameWithDevice = data.deviceType ? `${data.name} [${data.deviceType}]` : data.name;
    contentSections += buildSection('👤 User & Contact Details', 
      row('Name', nameWithDevice) +
      row('Email', data.email, true, `mailto:${data.email}`) +
      row('Phone', data.phone, true, `tel:${data.phone}`) +
      (data.ipAddress ? row('IP Address', data.ipAddress) : '')
    );
    contentSections += buildSection('📅 Event Details', 
      row('Event Type', data.eventType) +
      row('Event Date', data.date) +
      row('Event Location', data.location) +
      row('Requested Type', data.artistType && data.artistType.length > 0 ? (Array.isArray(data.artistType) ? data.artistType.join(', ') : data.artistType) : '') +
      row('Budget', data.budget)
    );

    // 🌐 User Endpoint & Search Context
    let contextHtml = '';
    if (data.pageUrl) {
      contextHtml += row('Page URL / Endpoint', data.pageUrl, true, data.pageUrl);
    } else if (data.pagePath) {
      contextHtml += row('Page Endpoint', data.pagePath);
    }
    if (data.keywords) {
      const kwFormatted = `<span style="display: inline-block; background: rgba(251, 191, 36, 0.15); color: #fbbf24; padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 13px; border: 1px solid rgba(251, 191, 36, 0.35); letter-spacing: 0.5px;">🔍 ${data.keywords}</span>`;
      contextHtml += `<tr>
        <td style="padding: 16px 0; width: 35%; max-width: 140px; color: #94a3b8; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.05);">Keywords Used</td>
        <td style="padding: 16px 0; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.05);">${kwFormatted}</td>
      </tr>`;
    }
    if (data.referrer) {
      contextHtml += row('Traffic Source', data.referrer);
    }
    if (contextHtml) {
      contentSections += buildSection('🌐 User Endpoint & Search Context', contextHtml);
    }

    // 📍 User Location & Geolocation (Silent IP-Based, No Permission Prompt)
    let geoHtml = '';
    if (data.detectedLocation) geoHtml += row('Detected Location', data.detectedLocation);
    if (data.city) geoHtml += row('City', data.city);
    if (data.region || data.state) geoHtml += row('State / Region', data.region || data.state);
    if (data.country) geoHtml += row('Country', data.country);
    if (data.isp) geoHtml += row('ISP / Network', data.isp);
    if (data.ipAddress) geoHtml += row('Client IP', data.ipAddress);
    if (data.latitude && data.longitude) {
      geoHtml += row('Coordinates', `${data.latitude}, ${data.longitude}`);
      const mapsUrl = `https://www.google.com/maps?q=${data.latitude},${data.longitude}`;
      geoHtml += row('Google Maps', 'View on Google Maps 🗺️', true, mapsUrl);
    }
    if (geoHtml) {
      contentSections += buildSection('📍 User Location & Geolocation', geoHtml);
    }

    if (coverPhotoHtml) {
      contentSections += coverPhotoHtml;
    }

    const formUrl = data.formLink || data.pageUrl || '';
    if (formUrl || data.formName || data.formNumber) {
      if (formUrl) {
        const extraLabel = data.formName ? `<div style="margin-top: 4px; font-size: 12px; color: #94a3b8; font-weight: 400;">(${data.formName})</div>` : '';
        const linkDisplay = `<a href="${formUrl}" target="_blank" style="color: #fbbf24; text-decoration: underline; font-weight: 600; word-break: break-all;">${formUrl} ↗</a>${extraLabel}`;
        contentSections += buildSection('📋 Source Form', `<tr>
          <td style="padding: 16px 0; width: 35%; max-width: 140px; color: #94a3b8; font-weight: 600; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.05);">Form Link</td>
          <td style="padding: 16px 0; vertical-align: top; border-bottom: 1px solid rgba(255,255,255,0.05);">${linkDisplay}</td>
        </tr>`);
      } else {
        contentSections += buildSection('📋 Source Form', row('Form Link', (data.formName || data.formNumber)));
      }
    }

    contentSections += buildSection('📝 Additional Message', `<tr><td style="padding: 16px; background-color: #f8fafc; border-radius: 8px; font-style: italic; color: #475569; border: 1px solid #e2e8f0;">"${data.message || 'No additional message provided.'}"</td></tr>`);

    if (dbArtistInfo) {
      let details = '';
      const keys = Object.keys(dbArtistInfo);
      for (const key of keys) {
          if (['id', 'created_at', 'updated_at', 'artist_images', 'images', 'bio', 'cover_image_url', 'created_by', 'adminProfile'].includes(key)) continue;
          if (dbArtistInfo[key] === null || dbArtistInfo[key] === undefined || dbArtistInfo[key] === '') continue;
          
          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          let valStr = String(dbArtistInfo[key]);
          if (valStr.length > 200) valStr = valStr.substring(0, 200) + '...';
          details += row(label, valStr);
      }
      contentSections += buildSection('✨ Requested Artist Details', details);
      
      if (dbArtistInfo.adminProfile) {
        const ap = dbArtistInfo.adminProfile;
        let adminDetails = '';
        if (ap.avatar_url) {
          adminDetails += `<tr><td colspan="2" style="text-align: center; padding-bottom: 24px;"><img src="${ap.avatar_url}" alt="Admin Avatar" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #3b82f6; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" /></td></tr>`;
        }
        adminDetails += row('Admin Name', ap.full_name || ap.username || 'Admin');
        adminDetails += row('Admin Email', ap.email, true, `mailto:${ap.email}`);
        adminDetails += row('Admin Phone', ap.phone_no, true, `tel:${ap.phone_no}`);
        contentSections += buildSection('👑 Artist Manager / Agent Details', adminDetails);
      }
    }
  }

  return contentSections;
};
