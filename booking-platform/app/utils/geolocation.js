/**
 * Geolocation utility to detect user's browser location non-intrusively.
 * If permission is already granted, it fetches browser GPS coordinates.
 * Otherwise, it avoids forcing permission popups and lets backend fallback to IP Geolocation.
 */

export async function reverseGeocode(lat, lng) {
  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.address) return null;

    const city = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state_district || '';
    const state = data.address.state || '';
    const country = data.address.country || '';
    const displayName = data.display_name || [city, state, country].filter(Boolean).join(', ');

    return {
      city,
      state,
      country,
      displayName,
      address: data.address
    };
  } catch (err) {
    console.warn('Reverse geocoding error:', err);
    return null;
  }
}

export function getUserGeolocation(options = { timeout: 7000, enableHighAccuracy: false }) {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      resolve({ success: false, error: 'Geolocation not supported by browser' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        const accuracy = position.coords.accuracy;

        let detectedLocation = '';
        let city = '';

        const geocodeResult = await reverseGeocode(latitude, longitude);
        if (geocodeResult) {
          detectedLocation = geocodeResult.displayName;
          city = geocodeResult.city || geocodeResult.state || '';
        } else {
          detectedLocation = `Lat: ${latitude.toFixed(5)}, Lng: ${longitude.toFixed(5)}`;
        }

        const locationData = {
          success: true,
          latitude,
          longitude,
          accuracy,
          detectedLocation,
          city
        };

        try {
          sessionStorage.setItem('magnevents_user_location', JSON.stringify(locationData));
        } catch (e) {}

        resolve(locationData);
      },
      (error) => {
        console.warn('Geolocation access skipped/denied:', error.message);
        resolve({
          success: false,
          error: error.message,
          code: error.code
        });
      },
      options
    );
  });
}

export function getCachedGeolocation() {
  if (typeof window === 'undefined') return null;
  try {
    const cached = sessionStorage.getItem('magnevents_user_location');
    return cached ? JSON.parse(cached) : null;
  } catch (e) {
    return null;
  }
}

/**
 * Checks if geolocation permission is ALREADY granted.
 * If granted, fetches coordinates silently without prompting the user.
 * If prompt/denied, returns cached data or null without forcing a popup prompt.
 */
export async function getSilentLocationIfGranted() {
  if (typeof window === 'undefined') return null;

  const cached = getCachedGeolocation();
  if (cached) return cached;

  // 1. If GPS permission was ALREADY granted previously by user, use it without prompting
  try {
    if (navigator.permissions && navigator.permissions.query) {
      const status = await navigator.permissions.query({ name: 'geolocation' });
      if (status.state === 'granted') {
        const geo = await getUserGeolocation({ timeout: 4000, enableHighAccuracy: false });
        if (geo.success) return geo;
      }
    }
  } catch (e) {}

  // 2. Silent IP Geolocation Fallback (ZERO permission prompts to user)
  try {
    const res = await fetch('https://ipwho.is/', { cache: 'no-store' });
    if (res.ok) {
      const geo = await res.json();
      if (geo && geo.success) {
        const parts = [geo.city, geo.region, geo.country].filter(Boolean);
        const locationData = {
          success: true,
          latitude: geo.latitude,
          longitude: geo.longitude,
          detectedLocation: parts.join(', '),
          city: geo.city || '',
          region: geo.region || '',
          country: geo.country || '',
          isp: geo.connection?.isp || geo.connection?.org || '',
          ip: geo.ip || ''
        };
        try {
          sessionStorage.setItem('magnevents_user_location', JSON.stringify(locationData));
        } catch (e) {}
        return locationData;
      }
    }
  } catch (e) {}

  return null;
}

