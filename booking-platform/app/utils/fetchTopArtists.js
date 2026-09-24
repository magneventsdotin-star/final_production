import { supabase } from '@database/connection/supabase';

/**
 * Fetches top 5 artists from Supabase database for an SEO page.
 * Prioritizes:
 * 1. Artists in the given city matching category / subCategory
 * 2. Artists nationwide matching subCategory (e.g. Gazals, Sufi, Rock)
 * 3. Artists nationwide matching category (e.g. Singer, Dj, Band)
 * 4. Top featured / rated artists in the database
 */
export async function getTopArtistsForSEO({ category = 'All', subCategory = '', city = 'All Cities', limit = 5 }) {
  try {
    let artists = [];

    const formatArtist = (artist, isFromCity = false) => {
      const alias = artist.alias ? artist.alias.trim() : '';
      const name = artist.name ? artist.name.trim() : '';
      const displayName = alias || name;
      const slug = (alias || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
      const img = artist.artist_images?.[0]?.image_url || null;
      const galleryImages = (artist.artist_images || []).map(i => i.image_url).filter(Boolean);

      return {
        id: artist.id,
        artist_no: artist.artist_no,
        name: displayName,
        rawName: name,
        alias: alias,
        category: artist.category || 'Performer',
        subCategory: artist.sub_category || '',
        city: artist.city || 'India',
        state: artist.state || '',
        rating: artist.rating ? Number(artist.rating) : 5.0,
        successful_bookings: artist.successful_bookings ? Number(artist.successful_bookings) : 20,
        price_min: artist.price_min ? Number(artist.price_min) : 10000,
        price_max: artist.price_max ? Number(artist.price_max) : 25000,
        bio: artist.bio || '',
        img,
        galleryImages,
        isFromCity,
        slug
      };
    };

    // 1. Try local city + category / subCategory
    if (city && city !== 'All Cities') {
      let q = supabase
        .from('artists')
        .select('id, artist_no, name, alias, category, sub_category, city, state, rating, successful_bookings, price_min, price_max, bio, artist_images(image_url)')
        .eq('is_live', true)
        .ilike('city', `%${city}%`);

      if (category && category !== 'All') {
        const filterCat = category.replace(/s$/i, '');
        q = q.or(`category.ilike.%${filterCat}%,sub_category.ilike.%${filterCat}%`);
      }

      const { data } = await q.order('rating', { ascending: false }).limit(limit);
      if (data && data.length > 0) {
        artists = data.map(a => formatArtist(a, true));
      }
    }

    // 2. If fewer than limit, try subCategory nationwide (e.g. Gazals, Sufi)
    if (artists.length < limit && subCategory) {
      const existingIds = artists.map(a => a.id);
      let q = supabase
        .from('artists')
        .select('id, artist_no, name, alias, category, sub_category, city, state, rating, successful_bookings, price_min, price_max, bio, artist_images(image_url)')
        .eq('is_live', true)
        .ilike('sub_category', `%${subCategory}%`);

      if (existingIds.length > 0) {
        q = q.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data } = await q.order('rating', { ascending: false }).order('successful_bookings', { ascending: false }).limit(limit - artists.length);
      if (data && data.length > 0) {
        artists = [...artists, ...data.map(a => formatArtist(a, false))];
      }
    }

    // 3. If still fewer than limit, try category nationwide
    if (artists.length < limit && category && category !== 'All') {
      const existingIds = artists.map(a => a.id);
      const filterCat = category.replace(/s$/i, '');
      let q = supabase
        .from('artists')
        .select('id, artist_no, name, alias, category, sub_category, city, state, rating, successful_bookings, price_min, price_max, bio, artist_images(image_url)')
        .eq('is_live', true)
        .or(`category.ilike.%${filterCat}%,sub_category.ilike.%${filterCat}%`);

      if (existingIds.length > 0) {
        q = q.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data } = await q.order('rating', { ascending: false }).order('successful_bookings', { ascending: false }).limit(limit - artists.length);
      if (data && data.length > 0) {
        artists = [...artists, ...data.map(a => formatArtist(a, false))];
      }
    }

    // 4. If still fewer than limit, fetch top featured or rated artists
    if (artists.length < limit) {
      const existingIds = artists.map(a => a.id);
      let q = supabase
        .from('artists')
        .select('id, artist_no, name, alias, category, sub_category, city, state, rating, successful_bookings, price_min, price_max, bio, artist_images(image_url)')
        .eq('is_live', true);

      if (existingIds.length > 0) {
        q = q.not('id', 'in', `(${existingIds.join(',')})`);
      }

      const { data } = await q.order('is_featured', { ascending: false }).order('rating', { ascending: false }).limit(limit - artists.length);
      if (data && data.length > 0) {
        artists = [...artists, ...data.map(a => formatArtist(a, false))];
      }
    }

    return artists.slice(0, limit);
  } catch (err) {
    console.error('Error fetching top artists for SEO:', err);
    return [];
  }
}
