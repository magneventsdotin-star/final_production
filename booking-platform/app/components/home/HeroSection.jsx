"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

import { HERO_SPOTLIGHT_SLIDES } from '@/app/constants'
import AISingerBookingCard from '@/app/components/home/AISingerBookingCard'

export default function HeroSection() {
  const router = useRouter()
  const [heroSlide, setHeroSlide] = useState(0)
  const [mobCardSlide, setMobCardSlide] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }
    const id = window.setInterval(() => {
      setHeroSlide(prev => (prev + 1) % HERO_SPOTLIGHT_SLIDES.length)
    }, 8000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="hp-hero-wrapper">
      {/* BACKGROUND (Shared for both) */}
      <div className="hp-hero-bg" style={{ pointerEvents: 'none' }}>
        {HERO_SPOTLIGHT_SLIDES.map((src, idx) => (
          <div
            key={src}
            className={`hp-hero-slide ${heroSlide === idx ? 'is-active' : ''}`}
            style={{
              position: 'absolute',
              inset: 0,
              opacity: heroSlide === idx ? 1 : 0,
              zIndex: heroSlide === idx ? 2 : 1,
              transition: 'opacity 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'opacity'
            }}
          >
            <Image
              src={typeof src === "object" ? src?.src : src}
              alt={`Live singer and band performing at an event slide ${idx + 1}`} 
              fill
              priority={idx === 0}
              unoptimized
              fetchPriority={idx === 0 ? "high" : "auto"}
              sizes="100vw"
              style={{ objectFit: "cover" }}
             />
          </div>
        ))}
      </div>
      <div className="hp-hero-overlay" aria-hidden="true" />
      <div className="hp-hero-radial-glow" aria-hidden="true" />
      <div className="hp-mobile-hero-overlay" aria-hidden="true" />

      {/* ======================================================== */}
      {/* DESKTOP HERO (DO NOT MODIFY, strictly preserved) */}
      {/* ======================================================== */}
      <div className="hp-hero hp-desktop-hero">
        <div className="hp-shell hp-hero-content">
          <div className="hp-hero-split">
            
            {/* LEFT 60% */}
            <div className="hp-hero-left">
              <div className="hp-hero-text-backdrop">
              <motion.h1
                className="hp-hero-h1"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0, y: 15 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }
                  }
                }}
              >
                Book India's <br className="hp-desktop-br" /> <strong className="hp-gradient-text italic">Verified Singers</strong> Using <strong className="hp-gradient-text italic">AI Search</strong> <br className="hp-desktop-br" /> For Weddings, Events & <strong className="hp-gradient-text italic">House Parties</strong>
              </motion.h1>

              <motion.p 
                className="hp-hero-sub"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Book from 1500+ verified singers for weddings, corporate events & celebrations. 
                Trusted by 2500+ happy clients with a 4.9★ Google rating, transparent pricing, and instant quotes.
              </motion.p>

              <motion.div
                className="hp-hero-actions"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('open-quick-booking'))}
                  className="hp-btn hp-btn-primary"
                >
                  <span>Get Free Quote</span>
                  <span style={{ marginLeft: '8px', fontSize: '18px', display: 'inline-block' }}>→</span>
                </button>
                <Link href="/artists" className="hp-btn hp-btn-glass">
                  <span>Check Artist Availability</span>
                  <span style={{ marginLeft: '8px', fontSize: '15px', display: 'inline-block' }}>📅</span>
                </Link>
                <a href="tel:+918076515257" className="hp-btn hp-btn-glass call-btn">
                  <span className="hp-call-icon">📞</span> +91 80765 15257
                </a>
              </motion.div>

              <motion.div
                className="hp-hero-trust-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.7 }}
              >
                <div className="hp-trust-mini-card">★ 4.9 Google Rating</div>
                <div className="hp-trust-mini-card">👥 2500+ Successful Bookings</div>
                <div className="hp-trust-mini-card">🛡️ 100% Verified Artists</div>
              </motion.div>

              </div>
            </div>

            {/* RIGHT 40% — DEDICATED AI SEARCH BOX */}
            <div className="hp-hero-right-clean" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 1, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
                style={{ width: '100%', maxWidth: '480px' }}
              >
                <AISingerBookingCard />
              </motion.div>
            </div>
            
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MOBILE HERO (Premium App-Like Layout) */}
      {/* ======================================================== */}
      <div className="hp-mobile-hero">
        <div className="hp-mobile-content">
          
          {/* Section 0: TOP AI SEARCH BANNER (Top of Mobile View) */}
          <div className="hp-mob-section hp-mob-top-ai-section">
            <Link href="/ai-search" className="mob-top-ai-banner">
              <div className="mob-top-ai-left">
                <span className="mob-top-ai-sparkle">✨</span>
                <span className="mob-top-ai-text">
                  <strong className="mob-top-ai-gold">AI Search:</strong> Find Best Match in 10s
                </span>
              </div>
              <span className="mob-top-ai-pill">TRY AI SEARCH ➔</span>
            </Link>
          </div>

          {/* Section 1: Badge + Quick AI Match Pill */}
          <div className="hp-mob-section">
            <div className="hp-mob-badge-row">
              <div className="hp-mob-badge">
                <span className="mob-stars">⭐⭐⭐⭐⭐</span> 2500+ Happy Clients
              </div>
              <Link href="/ai-search" className="hp-mob-ai-chip-top">
                <span>✨ AI Search</span>
                <span className="arrow">➔</span>
              </Link>
            </div>
          </div>

          {/* Section 2: Headline */}
          <div className="hp-mob-section">
            <h1 className="hp-mob-h1">
              Book a <span className="hp-gradient-text">Verified Singer</span> Using <span className="hp-gradient-text">AI Search</span> For Weddings, Events & <span className="hp-gradient-text">House Parties</span>
            </h1>
          </div>

          {/* Section 3: CTAs (Upper Part) */}
          <div className="hp-mob-section hp-mob-cta-section">
            <button 
              className="mob-btn-primary"
              onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking' } }))}
            >
              Get Free Quote
            </button>
            <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
              <Link href="/artists" className="mob-btn-secondary" style={{ flex: 1 }}>
                Browse Artists
              </Link>
              <a href="tel:+918076515257" className="mob-btn-secondary" style={{ flex: 1, padding: '14px 6px', fontSize: '13.5px', whiteSpace: 'nowrap' }}>
                📞 +91 80765 15257
              </a>
            </div>
          </div>

          {/* Section 4: Subtitle / Description Text (Lower Part) */}
          <div className="hp-mob-section">
            <p className="hp-mob-sub">
              Book from 1500+ verified singers for weddings, corporate events & celebrations. Trusted for 2500+ successful bookings with 4.9★ Google rating & instant transparent quotes.
            </p>
          </div>

          {/* Section 5: Trust Cards */}
          <div className="hp-mob-section">
            <div className="hp-mob-trust-grid">
              <div className="mob-trust-card"><span className="mob-check">✓</span> Verified Artists</div>
              <div className="mob-trust-card"><span className="mob-check">✓</span> Instant Quotes</div>
              <div className="mob-trust-card"><span className="mob-check">✓</span> Transparent Pricing</div>
              <div className="mob-trust-card"><span className="mob-check">✓</span> Pan India</div>
            </div>
          </div>

          {/* Section 6: Mobile Premium Slider Card */}
          <div className="hp-mob-section">
            <div className="mob-premium-slider-card">

              <div className="mps-body">
                {mobCardSlide === 0 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mps-slide">
                    <div className="mps-inner-card">
                      <h4 className="mps-slide-title">🎤 Why Choose Magnevents?</h4>
                      <ul className="mps-list">

                        <li><span className="mps-check">✓</span> Verified Professional Artists</li>
                        <li><span className="mps-check">✓</span> 100% Artist Arrival Guarantee</li>
                        <li><span className="mps-check">✓</span> Fast Booking Process (0% Markup)</li>
                        <li><span className="mps-check">✓</span> Transparent Pricing & Escrow</li>
                        <li><span className="mps-check">✓</span> 24/7 Dedicated Event Support</li>
                        <li><span className="mps-check">✓</span> Pan India Service</li>
                      </ul>
                    </div>
                  </motion.div>
                )}
                
                {mobCardSlide === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mps-slide">
                    <div className="mps-inner-card">
                      <h4 className="mps-slide-title">📱 How to Book?</h4>
                      <ul className="mps-list">
                        <li><span className="mps-check">1️⃣</span> Share your event details</li>
                        <li><span className="mps-check">2️⃣</span> Get curated artist options</li>
                        <li><span className="mps-check">3️⃣</span> Compare prices & profiles</li>
                        <li><span className="mps-check">4️⃣</span> Confirm booking securely</li>
                        <li><span className="mps-check">5️⃣</span> Enjoy a flawless performance</li>
                      </ul>
                    </div>
                  </motion.div>
                )}

                {mobCardSlide === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="mps-slide">
                    <div className="mps-inner-card">
                      <h4 className="mps-slide-title">⭐ Our Reviews</h4>
                      <div className="mps-review">
                        <p>"Magnevents made our wedding unforgettable! The singer was phenomenal."</p>
                        <span>- Priya S., Mumbai</span>
                      </div>
                      <div className="mps-review">
                        <p>"Super transparent and professional. Highly recommended for corporate events."</p>
                        <span>- Rahul M., Delhi</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
              <div className="hp-trust-badge-bottom">
                ⭐ Trusted by 2500+ Happy Clients
              </div>
            </div>
          </div>
          
        </div>
      </div>


      {/* Hidden SEO Paragraph for bots */}
      <div className="sr-only">
        <p>Looking to book a singer online for your next celebration? Whether you want to hire a singer for an intimate gathering or need a professional wedding singer to create magical moments, we offer a seamless singer booking platform. Explore our diverse roster of verified singers ranging from soulful Bollywood performers to high-energy corporate event singers and house party singers. Enjoy transparent pricing and hire a professional singer instantly. Let us help you find the perfect birthday party singer or live artist. Book artists online with complete peace of mind today.</p>
      </div>
    </section>
  )
}
