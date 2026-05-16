"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import AnimatedCounter from '@/app/components/common/AnimatedCounter'
import { HERO_STATS, HERO_SPOTLIGHT_SLIDES } from '@/app/constants'

export default function HeroSection() {
  const [heroSlide, setHeroSlide] = useState(0)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined
    }

    const id = window.setInterval(() => {
      setHeroSlide(prev => (prev + 1) % HERO_SPOTLIGHT_SLIDES.length)
    }, 2800)

    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="hp-hero">
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
              src={src}
              alt=""
              fill
              priority={idx === 0}
              loading={idx === 0 ? "eager" : "lazy"}
              quality={85}
              sizes="100vw"
              style={{ objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
      <div className="hp-hero-overlay" aria-hidden="true" />

      <div className="hp-shell hp-hero-content">
        <div className="hp-hero-grid">
          <div className="hp-hero-main full-width">
            <motion.h1
              className="hp-hero-h1"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              Book A <span className="hp-gradient-text accent-text">Musician</span>
              <br />
              For Your <span className="hp-gradient-text accent-text">Grand Event!</span>
            </motion.h1>

            <motion.div
              className="hp-hero-contact-wrap"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.28 }}
            >
              <a href="tel:+918076515257" className="hp-hero-contact-pill">
                <span className="hp-contact-icon">📞</span>
                <span>Contact Us on <strong>+91 80765 15257</strong></span>
              </a>
            </motion.div>

            <motion.div
              className="hp-hero-actions"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.45 }}
            >
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking' } }))}
                className="hp-btn hp-btn-primary"
              >
                <span>Book Now</span>
                <span className="hp-btn-shine" aria-hidden="true" />
              </button>
              <Link href="/artists" className="hp-btn hp-btn-ghost">
                Look Now
              </Link>
            </motion.div>

            <motion.div
              className="hp-stats"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.62 }}
            >
              {HERO_STATS.map(item => (
                <div key={item.label} className="hp-stat-card">
                  <strong>
                    <AnimatedCounter to={item.value} suffix={item.suffix} />
                  </strong>
                  <span>{item.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
