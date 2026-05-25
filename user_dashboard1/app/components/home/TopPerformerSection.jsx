"use client";

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import FadeSection from '@/app/components/common/FadeSection'
import Stars from '@/app/components/common/Stars'
import { ARTIST_OF_MONTH } from '@/app/constants'
import { formatINR } from '@/app/utils/formatters'
import { supabase } from '@/app/lib/supabase'
import ArtistDetailsModal from '@/app/components/artists/ArtistDetailsModal'

function TopPerformerSection() {
  const [artist, setArtist] = useState(ARTIST_OF_MONTH);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {

    const fetchArtistOfMonth = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*, artist_images(image_url)')
          .eq('is_artist_of_month', true)
          .limit(1)
          .single();

        if (error) {
          console.warn('No artist of the month found in DB, using fallback.', error.message);
          return;
        }

        if (data) {
          let genres = ARTIST_OF_MONTH.genres;
          if (data.sub_categories && data.sub_categories.length > 0) {
             genres = data.sub_categories;
          } else if (data.sub_category) {
             genres = data.sub_category.split(',').map(g => g.trim().toUpperCase());
          }

          const parsedArtist = {
            name: data.alias || data.name || ARTIST_OF_MONTH.name,
            image: data.artist_images?.[0]?.image_url || ARTIST_OF_MONTH.image,
            genres: genres,
            originalPrice: data.original_price || data.price_max || 0,
            exclusivePrice: data.exclusive_price || data.price_min || 0,
            rating: data.rating || 0,
            bookings: data.successful_bookings || 0,
          };

          setArtist(parsedArtist);
        }
      } catch (err) {
        console.error('Error fetching artist of the month:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistOfMonth();
  }, []);

  return (
    <FadeSection className="hp-shell hp-block">
      <div className="hp-section-head">
        <h2 className="hp-top-performer-title">Top performer picked this month</h2>
      </div>
      <div className="hp-aom-card">
        {loading ? (
          <>
            <div className="hp-aom-img-wrap skeleton-pulse" style={{ background: 'rgba(255,255,255,0.05)' }}></div>
            <div className="hp-aom-content" style={{ display: 'flex', flexDirection: 'column', padding: '40px' }}>
               <div className="skeleton-pulse" style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.05)', marginBottom: '16px', borderRadius: '4px' }}></div>
               <div className="skeleton-pulse" style={{ height: '36px', width: '60%', background: 'rgba(255,255,255,0.05)', marginBottom: '40px', borderRadius: '6px' }}></div>
               
               <div className="skeleton-pulse" style={{ height: '48px', width: '100%', background: 'rgba(255,255,255,0.05)', marginBottom: '12px', borderRadius: '12px' }}></div>
               <div className="skeleton-pulse" style={{ height: '48px', width: '100%', background: 'rgba(255,255,255,0.05)', marginBottom: '12px', borderRadius: '12px' }}></div>
               <div className="skeleton-pulse" style={{ height: '48px', width: '100%', background: 'rgba(255,255,255,0.05)', marginBottom: '12px', borderRadius: '12px' }}></div>
               <div className="skeleton-pulse" style={{ height: '48px', width: '100%', background: 'rgba(255,255,255,0.05)', marginBottom: '30px', borderRadius: '12px' }}></div>
               
               <div className="skeleton-pulse" style={{ height: '42px', width: '160px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}></div>
            </div>
          </>
        ) : (
          <>
            <div className="hp-aom-img-wrap">
              <Image
                src={artist.image}
                alt={artist.name}
                width={400}
                height={400}
                style={{ objectFit: 'cover' }}
                unoptimized
              />
              <div className="hp-aom-badge">
                <span className="hp-aom-badge-icon">🏆</span>
                Artist of the Month
              </div>
            </div>
            <div className="hp-aom-content">
              <p className="hp-aom-genres">{(artist.genres || []).join(', ')}</p>
              <h3 className="hp-aom-name">{artist.name}</h3>

              <div className="hp-aom-stats-grid">
                <div className="hp-aom-stat-row">
                  <span>Original Price</span>
                  <strong>Rs {formatINR(artist.originalPrice)}</strong>
                </div>
                <div className="hp-aom-stat-row is-exclusive">
                  <span>Exclusive Price</span>
                  <strong>Rs {formatINR(artist.exclusivePrice)}</strong>
                </div>
                <div className="hp-aom-stat-row">
                  <span>Star Rating</span>
                  <div className="hp-aom-rating">
                    <Stars count={5} />
                    <strong>{artist.rating}/5</strong>
                  </div>
                </div>
                <div className="hp-aom-stat-row">
                  <span>Total Bookings</span>
                  <strong>{artist.bookings}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', {
                    detail: { type: 'booking', artist: artist }
                  }))}
                  className="hp-btn hp-aom-btn"
                  style={{ flex: 1, whiteSpace: 'nowrap', padding: '12px 10px' }}
                >
                  Book Now
                </button>
                <button
                  onClick={() => setShowDetails(true)}
                  className="hp-btn"
                  style={{ 
                    flex: 1, 
                    background: '#fff', 
                    border: 'none', 
                    color: '#000',
                    fontWeight: '600',
                    whiteSpace: 'nowrap',
                    padding: '12px 10px'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e0e0e0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fff';
                  }}
                >
                  View Profile
                </button>
              </div>

              <ArtistDetailsModal 
                artist={artist} 
                showDetails={showDetails} 
                setShowDetails={setShowDetails} 
              />
            </div>
          </>
        )}
      </div>
    </FadeSection>
  )
}

// 🧠 Memoize in Main Memory to prevent rediffing and CPU lag on mobile
export default React.memo(TopPerformerSection);
