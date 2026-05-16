"use client";

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import TiltCard from '@/app/components/common/TiltCard'
import Stars from '@/app/components/common/Stars'
import { FEATURED_ARTISTS } from '@/app/constants'

export default function FeaturedArtistsSection() {
  const [pauseFeatured, setPauseFeatured] = useState(false)
  const featuredRef = useRef(null)

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
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
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
        {FEATURED_ARTISTS.map((artist, i) => (
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
              <div className="hp-feat-img-wrap-v2">
                <Image 
                  src={artist.image} 
                  alt={artist.name} 
                  width={320} 
                  height={400} 
                  style={{ objectFit: 'cover' }}
                />
                <div className="hp-feat-overlay-v2">
                  <span className="hp-live-badge">LIVE PREVIEW</span>
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
                  <Link href="/artists" className="hp-btn-view-v2">VIEW PROFILE</Link>
                </div>
              </div>
            </TiltCard>
          </motion.div>
        ))}
      </div>

    </FadeSection>
  )
}
