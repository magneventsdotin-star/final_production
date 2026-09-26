import { getCachedGeolocation } from '@/app/utils/geolocation';

export const bookingService = {

  submitRequest: async (formData) => {
    // 1. Enrich with cached silent geolocation data if missing
    const cachedGeo = getCachedGeolocation();

    // 2. Auto-detect endpoint, referrer, and keywords in browser
    let pageUrl = formData?.pageUrl || '';
    let pagePath = formData?.pagePath || '';
    let formLink = formData?.formLink || '';
    let referrer = formData?.referrer || '';
    let keywords = formData?.keywords || '';

    if (typeof window !== 'undefined') {
      if (!pageUrl) pageUrl = window.location.href;
      if (!pagePath) pagePath = window.location.pathname;
      if (!formLink) formLink = window.location.href;
      if (!referrer) {
        referrer = document.referrer ? (document.referrer.includes(window.location.hostname) ? 'Internal Site' : document.referrer) : 'Direct Visit';
      }

      if (!keywords) {
        try {
          const urlParams = new URLSearchParams(window.location.search);
          const searchQ = urlParams.get('q') || urlParams.get('query') || urlParams.get('keyword') || urlParams.get('utm_term') || urlParams.get('vibe');
          if (searchQ) keywords = searchQ;
        } catch (e) {}
      }
    }

    // 3. If still no explicit keywords, intelligently extract key intent keywords from user's message/requirement
    if (!keywords && (formData?.message || formData?.requirement)) {
      const text = (formData.message || formData.requirement || '').toLowerCase();
      const matched = [];
      const KNOWN_KEYWORDS = [
        'live band', 'singer', 'ghazal', 'sufi', 'bollywood', 'wedding', 'sangeet', 
        'acoustic', 'dj', 'rock band', 'qawwali', 'cocktail', 'reception', 'house party',
        'punjabi', 'corporate', 'celebrity', 'classical', 'flute', 'violin', 'dhol'
      ];
      for (const kw of KNOWN_KEYWORDS) {
        if (text.includes(kw)) {
          matched.push(kw.charAt(0).toUpperCase() + kw.slice(1));
        }
      }
      if (matched.length > 0) {
        keywords = matched.slice(0, 3).join(', ');
      }
    }

    const enrichedData = {
      ...formData,
      pageUrl,
      pagePath,
      formLink: formLink || pageUrl,
      referrer,
      keywords: keywords || formData?.eventType || 'Live Artist Booking',
      latitude: formData?.latitude || cachedGeo?.latitude || null,
      longitude: formData?.longitude || cachedGeo?.longitude || null,
      detectedLocation: formData?.detectedLocation || cachedGeo?.detectedLocation || null,
      city: formData?.city || cachedGeo?.city || null,
      region: formData?.region || cachedGeo?.region || null,
      country: formData?.country || cachedGeo?.country || null,
      isp: formData?.isp || cachedGeo?.isp || null,
    };

    console.log("Submitting form data to server:", enrichedData);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(enrichedData),
        keepalive: true,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || `Server error: ${res.status}`);
      }

      return {
        success: true,
        message: data.message || "Submission received successfully.",
        ...data
      };
    } catch (error) {
      console.error("Booking service submission error:", error);
      throw error;
    }
  }
};

