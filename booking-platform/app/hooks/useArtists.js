import { useState, useCallback } from 'react';
import { supabase } from '@database/connection/supabase';

export const useArtists = (itemsPerPage = 15) => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);

  const fetchArtists = useCallback(async (page = 1, category = 'All', city = 'All Cities') => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('artists')
        .select('*, artist_images(image_url)', { count: 'exact' })
        .eq('is_live', true);

      if (category !== 'All') {
        const filterCat = category.replace(/s$/i, '');
        query = query.or(`category.ilike.%${filterCat}%,sub_category.ilike.%${filterCat}%`);
      }

      if (city !== 'All Cities') {
        query = query.ilike('city', `%${city}%`);
      }

      const from = (page - 1) * itemsPerPage;
      const to = from + itemsPerPage - 1;

      const { data, count, error: queryError } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (queryError) {
        throw queryError;
      }

      if (data) {
        const formattedArtists = data.map(artist => ({
          id: artist.id,
          artist_no: artist.artist_no,
          name: artist.alias || artist.name,
          category: artist.category,
          subCategory: artist.sub_category,
          city: artist.city,
          state: artist.state,
          languages: artist.performing_language,
          priceMin: artist.price_min,
          priceMax: artist.price_max,
          originalPrice: artist.original_price,
          exclusivePrice: artist.exclusive_price,
          price: artist.price_min,
          successful_bookings: artist.successful_bookings,
          rating: artist.rating,
          img: artist.artist_images?.[0]?.image_url || null,
          galleryImages: artist.artist_images?.map(img => img.image_url).filter(Boolean) || [],
          videoUrls: artist.video_url ? artist.video_url.split(',').map(url => url.trim()).filter(Boolean) : [],
          quote: artist.bio || '',
        }));
        setArtists(formattedArtists);
        setTotalPages(Math.ceil((count || 0) / itemsPerPage));
      }
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError(err);
      setArtists([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  return { artists, loading, totalPages, fetchArtists, error };
};

export const useFeaturedArtists = (limit = 6) => {
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFeatured = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*, artist_images(image_url)')
        .eq('is_featured', true)
        .eq('is_live', true)
        .limit(limit);

      if (error) {
        console.warn('Failed to fetch featured artists from DB, using fallback.', error.message);
        return;
      }

      const formatArtistData = (artists) => artists.map(artist => ({
        id: artist.id,
        artist_no: artist.artist_no,
        name: artist.alias || artist.name,
        category: artist.category,
        subCategory: artist.sub_category,
        city: artist.city,
        state: artist.state,
        languages: artist.performing_language,
        successful_bookings: artist.successful_bookings,
        rating: artist.rating,
        img: artist.artist_images?.[0]?.image_url || null,
      }));

      if (data && data.length > 0) {
        setFeaturedArtists(formatArtistData(data));
      } else {
        const { data: anyData } = await supabase
          .from('artists')
          .select('*, artist_images(image_url)')
          .eq('is_live', true)
          .limit(limit);
          
        if (anyData && anyData.length > 0) {
          setFeaturedArtists(formatArtistData(anyData));
        } else {
          setFeaturedArtists([]);
        }
      }
    } catch (err) {
      console.error('Error fetching featured artists:', err);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  return { featuredArtists, loading, fetchFeatured };
};
