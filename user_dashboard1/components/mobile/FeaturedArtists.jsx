"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { supabase } from '@/app/lib/supabase';

function MobileFeaturedArtists() {
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*, artist_images(image_url)')
          .eq('is_featured', true)
          .eq('is_live', true)
          .limit(5);

        if (error) {
          return;
        }

        const formatArtistData = (artists) => artists.map(artist => ({
          id: artist.id,
          name: artist.alias || artist.name,
          subCategory: artist.sub_category || artist.category,
          city: artist.city,
          state: artist.state,
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
            .limit(5);
            
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
    };
    fetchFeatured();
  }, []);

  if (!loading && featuredArtists.length === 0) {
    return null;
  }

  return (
    <section className="mobile-shell" style={{ marginBottom: '40px' }}>
      <div className="mobile-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px' }}>Featured</h2>
        </div>
        <Link href="/artists" style={{ fontSize: '13px', color: '#FFE032', textDecoration: 'none', fontWeight: '600' }}>
          See All
        </Link>
      </div>

      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        paddingBottom: '16px',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }}
      className="hide-scrollbar"
      >
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={`skel-${i}`} style={{ flex: '0 0 auto', width: '280px', scrollSnapAlign: 'start', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', height: '360px' }} />
          ))
        ) : (
          featuredArtists.map((artist) => (
            <Link
              key={artist.id || artist.name}
              href={`/artist/${encodeURIComponent(artist.name)}`}
              style={{
                flex: '0 0 auto',
                width: '280px',
                scrollSnapAlign: 'start',
                textDecoration: 'none',
                background: 'rgba(20, 20, 20, 0.9)',
                borderRadius: '16px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <div style={{ position: 'relative', width: '100%', height: '240px' }}>
                <img
                  src={typeof artist.img || '/images/placeholder.jpg' === "object" ? artist.img || '/images/placeholder.jpg'?.src : artist.img || '/images/placeholder.jpg'}
                  alt={artist.name} style={{ objectFit: 'cover' }}
                 />
              </div>
              <div style={{ padding: '16px' }}>
                <span style={{ display: 'block', fontSize: '11px', color: '#FFE032', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', fontWeight: '600' }}>
                  {artist.subCategory || 'Performer'}
                </span>
                <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#fff' }}>
                  {artist.name}
                </h3>
                <span style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  {[artist.city, artist.state].filter(Boolean).join(', ') || 'India'}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', fontSize: '13px', color: '#fff' }}>
                  <span style={{ color: '#FFE032', marginRight: '4px' }}>⭐</span>
                  {Number(artist.rating || 0).toFixed(1)} <span style={{ color: 'rgba(255,255,255,0.4)', margin: '0 4px' }}>•</span> {artist.successful_bookings || 0} bookings
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </section>
  );
}

export default React.memo(MobileFeaturedArtists);
