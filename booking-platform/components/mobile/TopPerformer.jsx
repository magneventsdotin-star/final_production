"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatINR } from '@helpers/formatters';
import { supabase } from '@database/connection/supabase';

function MobileTopPerformer() {
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtistOfMonth = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*, artist_images(image_url)')
          .eq('is_artist_of_month', true)
          .eq('is_live', true)
          .limit(1)
          .single();

        let topArtist = data;

        if (error || !data) {
          const { data: fallbackData } = await supabase
            .from('artists')
            .select('*, artist_images(image_url)')
            .eq('is_live', true)
            .limit(1)
            .single();
            
          if (fallbackData) {
            topArtist = fallbackData;
          } else {
            setArtist(null);
            return;
          }
        }

        if (topArtist) {
          let genres = [];
          if (topArtist.sub_categories && topArtist.sub_categories.length > 0) {
             genres = topArtist.sub_categories;
          } else if (topArtist.sub_category) {
             genres = topArtist.sub_category.split(',').map(g => g.trim().toUpperCase());
          }

          setArtist({
            name: topArtist.alias || topArtist.name,
            image: topArtist.artist_images?.[0]?.image_url || '/placeholder.png',
            genres: genres,
            originalPrice: topArtist.original_price || topArtist.price_max || 0,
            exclusivePrice: topArtist.exclusive_price || topArtist.price_min || 0,
            rating: topArtist.rating || 0,
            bookings: topArtist.successful_bookings || 0,
          });
        }
      } catch (err) {
        console.error('Error fetching top performer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistOfMonth();
  }, []);

  if (loading) {
    return (
      <section className="mobile-shell mobile-section-head">
        <h2>Artist of the Month</h2>
        <div style={{ height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '16px', marginTop: '16px' }} />
      </section>
    );
  }

  if (!artist) {
    return null;
  }

  return (
    <section className="mobile-shell" style={{ marginBottom: '40px' }}>
      <div className="mobile-section-head">
        <h2>Top Performer</h2>
      </div>

      <div style={{ 
        background: 'rgba(20, 20, 20, 0.9)', 
        borderRadius: '16px', 
        overflow: 'hidden',
        border: '1px solid rgba(255, 224, 50, 0.15)'
      }}>
        <div style={{ position: 'relative', width: '100%', height: '300px' }}>
          <img
            src={typeof artist.image === "object" ? artist.image?.src : artist.image}
            alt={artist.name} style={{ objectFit: 'contain' }}  />
          <div style={{ 
            position: 'absolute', top: '12px', left: '12px', 
            background: 'rgba(0,0,0,0.7)', color: '#FFE032', 
            padding: '6px 12px', borderRadius: '100px', fontSize: '12px', fontWeight: 'bold' 
          }}>
            🏆 Artist of the Month
          </div>
        </div>

        <div style={{ padding: '20px' }}>
          <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#FFE032', fontWeight: '600', letterSpacing: '0.05em' }}>
            {(artist.genres || []).join(', ')}
          </p>
          <h3 style={{ margin: '0 0 16px', fontSize: '24px', color: '#fff' }}>{artist.name}</h3>

          <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Original Price</span>
              <span style={{ color: '#fff', textDecoration: 'line-through' }}>Rs {formatINR(artist.originalPrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
              <span style={{ color: '#FFE032', fontWeight: '600' }}>Exclusive Price</span>
              <span style={{ color: '#FFE032', fontWeight: '600' }}>Rs {formatINR(artist.exclusivePrice)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Rating</span>
              <span style={{ color: '#fff' }}>⭐ {Number(artist.rating).toFixed(1)}/5</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: artist } }))}
              style={{ flex: 1, padding: '14px', borderRadius: '8px', border: 'none', background: '#ff4d4d', color: '#fff', fontWeight: '600', fontSize: '15px' }}
            >
              Book Now
            </button>
            <Link href={`/artist/${encodeURIComponent(artist.name)}`} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#fff', fontWeight: '600', fontSize: '15px', textAlign: 'center', textDecoration: 'none' }}>
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default React.memo(MobileTopPerformer);
