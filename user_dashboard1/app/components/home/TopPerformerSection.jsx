"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import FadeSection from '@/app/components/common/FadeSection'
import Stars from '@/app/components/common/Stars'
import { formatINR } from '@/app/utils/formatters'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

function TopPerformerSection() {
  const router = useRouter();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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
          // Fallback to any artist in the DB if none is marked as artist of the month
          const { data: fallbackData } = await supabase
            .from('artists')
            .select('*, artist_images(image_url)')
            .eq('is_live', true)
            .limit(1)
            .single();
            
          if (fallbackData) {
            topArtist = fallbackData;
          } else {
            console.warn('No artists found in DB');
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

          const parsedArtist = {
            name: topArtist.alias || topArtist.name,
            image: topArtist.artist_images?.[0]?.image_url || '/placeholder.png',
            genres: genres,
            originalPrice: topArtist.original_price || topArtist.price_max || 0,
            exclusivePrice: topArtist.exclusive_price || topArtist.price_min || 0,
            rating: topArtist.rating || 0,
            bookings: topArtist.successful_bookings || 0,
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

  if (!loading && !artist) {
    return null;
  }

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
              {/* Blurred background layer to fill empty spaces */}
              <div 
                className="hp-aom-img-bg-blur" 
                style={{ backgroundImage: `url(${artist.image})` }}
              />
              {/* Actual image contained so it's fully visible */}
              <img
                src={typeof artist.image === "object" ? artist.image?.src : artist.image}
                alt={artist.name} style={{ objectFit: 'contain', zIndex: 2 }}  />
              <div className="hp-aom-badge" style={{ zIndex: 10 }}>
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
                    <Stars count={Math.round(Number(artist.rating))} />
                    <strong>{artist.rating}/5</strong>
                  </div>
                </div>
                {artist.bookings > 0 && (
                  <div className="hp-aom-stat-row">
                    <span>Total Bookings</span>
                    <strong>{artist.bookings}</strong>
                  </div>
                )}
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
                <Link href={`/artist/${encodeURIComponent(artist.name)}`} target={isMobile ? "_self" : "_blank"} style={{ flex: 1, textDecoration: 'none', display: 'flex' }}>
                  <button
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
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </FadeSection>
  )
}

// 🧠 Memoize in Main Memory to prevent rediffing and CPU lag on mobile
export default React.memo(TopPerformerSection);
