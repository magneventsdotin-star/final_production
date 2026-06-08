"use client";

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import TiltCard from '@/app/components/common/TiltCard'
import Stars from '@/app/components/common/Stars'
import { FEATURED_ARTISTS } from '@/app/constants'
import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

function FeaturedArtistsSection() {
  const router = useRouter();
  const [featuredArtists, setFeaturedArtists] = useState(FEATURED_ARTISTS)
  const [loading, setLoading] = useState(true)
  const [pauseFeatured, setPauseFeatured] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const featuredRef = useRef(null)

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*, artist_images(image_url)')
          .eq('is_featured', true)
          .limit(6);

        if (error) {
          console.warn('Failed to fetch featured artists from DB, using fallback.', error.message);
          return;
        }

        if (data && data.length > 0) {
          let parsedArtists = data.map(artist => ({
            name: artist.alias || artist.name,
            genre: artist.sub_category || artist.category || 'Performer',
            bookings: `${artist.successful_bookings || Math.floor(Math.random() * 50) + 50} bookings`,
            rating: artist.rating || '4.9',
            image: artist.artist_images?.[0]?.image_url || '/assets/lux-singer-session.webp',
            city: artist.city || 'India'
          }));
          
          if (parsedArtists.length < 15) {
            const needed = 15 - parsedArtists.length;
            const padding = FEATURED_ARTISTS.filter(fa => !parsedArtists.find(pa => pa.name === fa.name)).slice(0, needed);
            parsedArtists = [...parsedArtists, ...padding];
          }
          
          setFeaturedArtists(parsedArtists);
        } else {
          setFeaturedArtists(FEATURED_ARTISTS.slice(0, 15));
        }
      } catch (err) {
        console.error('Error fetching featured artists:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const moveFeatured = (direction) => {
    const scroller = featuredRef.current
    if (!scroller) return
    const card = scroller.querySelector('[data-featured-card]')
    const cardWidth = card ? card.getBoundingClientRect().width + 16 : scroller.clientWidth * 0.86
    const maxLeft = scroller.scrollWidth - scroller.clientWidth - 4
    const atEnd = scroller.scrollLeft >= maxLeft
    const atStart = scroller.scrollLeft <= 2

    if (direction > 0 && atEnd) {
      scroller.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }
    if (direction < 0 && atStart) {
      scroller.scrollTo({ left: maxLeft, behavior: 'smooth' })
      return
    }

    scroller.scrollBy({ left: cardWidth * direction, behavior: 'smooth' })
  }

  useEffect(() => {
    if (typeof window !== 'undefined' && (window.innerWidth < 768 || window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
      return undefined
    }

    const id = window.setInterval(() => {
      if (!pauseFeatured) moveFeatured(1)
    }, 3400)

    return () => window.clearInterval(id)
  }, [pauseFeatured])

  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setStartX(e.pageX - featuredRef.current.offsetLeft)
    setScrollLeft(featuredRef.current.scrollLeft)
  }

  const handleMouseLeave = () => {
    setIsDragging(false)
    setPauseFeatured(false)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    e.preventDefault()
    const x = e.pageX - featuredRef.current.offsetLeft
    const walk = (x - startX) * 2
    featuredRef.current.scrollLeft = scrollLeft - walk
  }

  return (
    <FadeSection className="hp-shell hp-block hp-featured-section">
      <div className="hp-feat-head-v2">
        <div className="hp-section-head">
          <h2>Featured Artists</h2>
        </div>

        <div className="hp-feat-actions-row">
          <Link href="/artists" className="hp-see-all-v2">See all →</Link>
          <div className="hp-feat-controls-v2">
            <button
              type="button"
              className="lux-arrow-mini is-left"
              onClick={() => moveFeatured(-1)}
              aria-label="Previous"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              type="button"
              className="lux-arrow-mini"
              onClick={() => moveFeatured(1)}
              aria-label="Next"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>

      <div
        className="hp-feat-carousel"
        ref={featuredRef}
        onMouseEnter={() => setPauseFeatured(true)}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={`skel-${i}`} className="hp-feat-slide" style={{ width: '320px' }}>
              <div className="hp-feat-card" style={{ height: '440px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                 <div className="skeleton-pulse" style={{ height: '210px', background: 'rgba(255,255,255,0.04)' }}></div>
                 <div style={{ padding: '20px' }}>
                   <div className="skeleton-pulse" style={{ height: '12px', width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', marginBottom: '10px' }}></div>
                   <div className="skeleton-pulse" style={{ height: '24px', width: '80%', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', marginBottom: '16px' }}></div>
                   <div className="skeleton-pulse" style={{ height: '14px', width: '30%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', marginBottom: '24px' }}></div>
                   <div className="skeleton-pulse" style={{ height: '14px', width: '60%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', marginBottom: '24px' }}></div>
                   
                   <div style={{ display: 'flex', gap: '10px' }}>
                     <div className="skeleton-pulse" style={{ height: '36px', flex: 1.2, background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}></div>
                     <div className="skeleton-pulse" style={{ height: '36px', flex: 0.8, background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}></div>
                   </div>
                 </div>
              </div>
            </div>
          ))
        ) : (
          featuredArtists.map((artist, i) => (
            <motion.div
              key={artist.name}
              className="hp-feat-slide"
              data-featured-card
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.1 }}
            >
              <TiltCard className="hp-feat-card-v2">
                <div 
                  className="hp-feat-img-wrap-v2" 
                  onClick={() => router.push(`/artist/${encodeURIComponent(artist.name)}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <Image
                    src={artist.image}
                    alt={artist.name}
                    width={320}
                    height={400}
                    style={{ objectFit: 'cover' }}
                    unoptimized
                  />
                  <div className="hp-feat-overlay-v2">
                    <span className="hp-live-badge">VIEW PROFILE</span>
                  </div>
                </div>
                <div className="hp-feat-info-v2">
                  <span className="hp-feat-genre-v2">{artist.genre}</span>
                  <h3 className="hp-feat-name-v2">{artist.name}</h3>
                  <span className="hp-feat-loc-v2">{artist.location || 'Jaipur'}</span>

                  <div className="hp-feat-rating-v2">
                    <Stars count={Math.round(Number(artist.rating))} />
                    <span className="hp-feat-score-v2">{artist.rating} · 146 bookings</span>
                  </div>

                  <div className="hp-feat-btn-grid">
                    <button
                      onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', {
                        detail: { type: 'booking', artist: artist }
                       }))}
                      className="hp-btn-book-v2"
                    >
                      BOOK THIS ARTIST
                    </button>
                    <button 
                      onClick={() => router.push(`/artist/${encodeURIComponent(artist.name)}`)} 
                      className="hp-btn-view-v2"
                    >
                      VIEW PROFILE
                    </button>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))
        )}
      </div>

    </FadeSection>
  )
}

export default React.memo(FeaturedArtistsSection);
