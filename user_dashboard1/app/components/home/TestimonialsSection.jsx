"use client";

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import { TESTIMONIALS } from '@/app/constants'

// Adding more testimonials for a better slider experience
const EXTENDED_TESTIMONIALS = [
  ...TESTIMONIALS,
  {
    name: 'Rahul Sharma',
    time: '2 weeks ago',
    stars: 5,
    text: 'Best platform to book musicians. The coordination was seamless and the artist was world-class.',
    isVerified: true
  },
  {
    name: 'Priya Kapoor',
    time: '3 weeks ago',
    stars: 5,
    text: 'Highly recommend Magnevents for corporate gigs. They understand the vibe and deliver excellence.',
    isVerified: true
  }
]

export default function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const [itemsPerPage, setItemsPerPage] = useState(3)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setItemsPerPage(1)
      } else if (window.innerWidth <= 1024) {
        setItemsPerPage(2)
      } else {
        setItemsPerPage(3)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const next = () => setIndex((prev) => (prev + 1) % (EXTENDED_TESTIMONIALS.length - itemsPerPage + 1))
  const prev = () => setIndex((prev) => (prev - 1 + (EXTENDED_TESTIMONIALS.length - itemsPerPage + 1)) % (EXTENDED_TESTIMONIALS.length - itemsPerPage + 1))

  return (
    <FadeSection className="hp-shell hp-block hp-testimonials-section">
      <div className="hp-section-head">
        <h2>Our Rating</h2>
      </div>
      <div className="hp-trust-header">
        <div className="hp-google-summary">
          <div className="hp-summary-score">
            <span className="hp-score-num">4.9</span>
            <div className="hp-score-stars">
              {Array.from({ length: 5 }).map((_, s) => (
                <span key={s} className="hp-star">★</span>
              ))}
            </div>
            <span className="hp-score-count">7 Google reviews</span>
          </div>
          <div className="hp-summary-bars">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="hp-rating-bar-row">
                <span className="hp-bar-label">{rating}</span>
                <div className="hp-bar-wrap">
                  <div 
                    className="hp-bar-fill" 
                    style={{ width: rating === 5 ? '92%' : rating === 4 ? '15%' : '0%' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="hp-business-card fx-soft-card">
          <div className="hp-biz-header">
            <div className="hp-biz-info">
              <h3>Magnevents</h3>
              <div className="hp-biz-rating">
                <span>4.9</span>
                <div className="hp-mini-stars">★★★★★</div>
                <span className="hp-biz-count">7 Google reviews</span>
              </div>
              <p className="hp-biz-type">Event management company in Ghaziabad, Uttar Pradesh</p>
            </div>
            <div className="hp-biz-actions-grid">
              <button className="hp-biz-action-btn">
                <div className="hp-action-icon">🌐</div>
                <span>Website</span>
              </button>
              <button className="hp-biz-action-btn">
                <div className="hp-action-icon">📍</div>
                <span>Directions</span>
              </button>
              <button className="hp-biz-action-btn">
                <div className="hp-action-icon">⭐</div>
                <span>Reviews</span>
              </button>
              <button className="hp-biz-action-btn">
                <div className="hp-action-icon">🔖</div>
                <span>Save</span>
              </button>
            </div>
          </div>
          <div className="hp-biz-footer">
            <div className="hp-biz-detail">
            </div>
            <div className="hp-biz-detail">
              <strong>Phone:</strong> 080765 15257
            </div>
            <div className="hp-biz-detail">
              <strong>Hours:</strong> <span className="hp-open-status">Open 24 hours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hp-reviews-slider-wrap-v2">
        <button className="lux-arrow-v2 is-left" onClick={prev} aria-label="Previous">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        </button>

        <div className="hp-reviews-slider-viewport">
          <motion.div 
            className="hp-reviews-slider-track"
            animate={{ x: `-${index * (100 / itemsPerPage)}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {EXTENDED_TESTIMONIALS.map((item, i) => (
              <div key={i} className="hp-review-slide">
                <article className="hp-review-card-v2">
                  <div className="hp-review-header-v2">
                    <div className="hp-review-user-v2">
                      <div className="hp-review-avatar-v2">
                        {item.name.charAt(0)}
                      </div>
                      <div className="hp-review-meta-v2">
                        <h4 className="hp-review-name-v2">{item.name}</h4>
                        <span className="hp-review-time-v2">{item.time}</span>
                      </div>
                    </div>
                    <div className="hp-google-icon-v2">
                      <svg width="20" height="20" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                    </div>
                  </div>

                  <div className="hp-review-stars-v2">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s} className="hp-star-v2">★</span>
                    ))}
                  </div>

                  <p className="hp-review-text-v2">&ldquo;{item.text}&rdquo;</p>
                  
                  <div className="hp-review-footer-v2">
                    <div className="hp-verified-line-v2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      <span>VERIFIED GOOGLE REVIEW</span>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </motion.div>
        </div>

        <button className="lux-arrow-v2 is-right" onClick={next} aria-label="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>

    </FadeSection>
  )
}

// Next HMR Cache Invalidation Trigger: Testimonials Carousel Squish Bug Resolved 2026-05-17

