"use client";

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import TiltCard from '@/app/components/common/TiltCard'
import Stars from '@/app/components/common/Stars'

import { supabase } from '@/app/lib/supabase'
import { useRouter } from 'next/navigation'

function FeaturedArtistsSection() {
  const router = useRouter();
  const [featuredArtists, setFeaturedArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [pauseFeatured, setPauseFeatured] = useState(false)
  const [selectedArtist, setSelectedArtist] = useState(null)
  const [showDetails, setShowDetails] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const featuredRef = useRef(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*, artist_images(image_url)')
          .eq('is_featured', true)
          .eq('is_live', true)
          .limit(6);

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
          const { data: anyData, error: anyError } = await supabase
            .from('artists')
            .select('*, artist_images(image_url)')
            .eq('is_live', true)
            .limit(6);
            
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

  if (!loading && featuredArtists.length === 0) {
    return null;
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
            <div key={`skel-${i}`} className="hp-feat-slide" style={{ width: '100%' }}>
              <div className="hp-feat-card" style={{ height: '550px', background: 'rgba(255,255,255,0.02)', borderColor: 'rgba(255,255,255,0.05)' }}>
                 <div className="skeleton-pulse" style={{ height: '60%', background: 'rgba(255,255,255,0.04)' }}></div>
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
              key={artist.artist_no || artist.name}
              className="hp-feat-slide"
              data-featured-card
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.1 }}
            >
              <Link href={`/artist/${encodeURIComponent(artist.name)}`} target={isMobile ? "_self" : "_blank"} style={{ textDecoration: 'none', display: 'flex', width: '100%', height: '100%' }}>
                <TiltCard 
                  className="hp-feat-card-v2"
                  style={{ cursor: 'pointer', width: '100%', display: 'flex', flexDirection: 'column' }}
                >
                  <div className="hp-feat-img-wrap-v2">
                    <img
                      src={typeof artist.img || 'https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp' === "object" ? artist.img || 'https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp'?.src : artist.img || 'https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp'}
                      alt={artist.name} style={{ objectFit: 'cover' }}  />
                  </div>
                  <div className="hp-feat-info-v2">
                    <div>
                      <span className="hp-feat-genre-v2">{artist.subCategory || artist.category || 'Performer'}</span>
                      <h3 className="hp-feat-name-v2">{artist.name}</h3>
                      <span className="hp-feat-loc-v2">{[artist.city, artist.state].filter(Boolean).join(', ') || 'India'}</span>

                      <div className="hp-feat-rating-v2">
                        <Stars count={Math.round(Number(artist.rating || 0))} />
                        <span className="hp-feat-score-v2">
                          {Number(artist.rating || 0).toFixed(1)} · {artist.successful_bookings || 0} bookings
                        </span>
                      </div>
                    </div>
                  </div>
                </TiltCard>
              </Link>
            </motion.div>
          ))
        )}
      </div>

    </FadeSection>
  )
}

export default React.memo(FeaturedArtistsSection);
