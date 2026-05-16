"use client";

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import FadeSection from '@/app/components/common/FadeSection'
import Stars from '@/app/components/common/Stars'
import { ARTIST_OF_MONTH } from '@/app/constants'
import { formatINR } from '@/app/utils/formatters'
import { supabase } from '@/app/lib/supabase'

export default function TopPerformerSection() {
  const [artist, setArtist] = useState(ARTIST_OF_MONTH);

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

          setArtist({
            name: data.name ?? ARTIST_OF_MONTH.name,
            image: data.artist_images?.[0]?.image_url ?? ARTIST_OF_MONTH.image,
            genres: genres,
            originalPrice: data.original_price ?? data.price_max ?? ARTIST_OF_MONTH.originalPrice,
            exclusivePrice: data.exclusive_price ?? data.price_min ?? ARTIST_OF_MONTH.exclusivePrice,
            rating: data.rating ?? ARTIST_OF_MONTH.rating,
            bookings: data.successful_bookings ?? ARTIST_OF_MONTH.bookings,
          });
        }
      } catch (err) {
        console.error('Error fetching artist of the month:', err);
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
        <div className="hp-aom-img-wrap">
          <Image 
            src={artist.image} 
            alt={artist.name} 
            width={400} 
            height={400} 
            style={{ objectFit: 'cover' }}
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

          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { 
              detail: { type: 'booking', artist: artist } 
            }))}
            className="hp-btn hp-aom-btn"
          >
            Book This Artist
          </button>
        </div>
      </div>
    </FadeSection>
  )
}
