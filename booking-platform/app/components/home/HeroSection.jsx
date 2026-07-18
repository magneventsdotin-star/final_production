"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

import { HERO_STATS, HERO_SPOTLIGHT_SLIDES } from '@/app/constants'

export default function HeroSection() {
  const [heroSlide, setHeroSlide] = useState(0)

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
            <img
              src={typeof src === "object" ? src?.src : src}
              alt={`Live musician and band performing at an event slide ${idx + 1}`} style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", inset: 0 }}
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
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.05, delayChildren: 0.0 }
                }
              }}
            >
              {"Book A".split(" ").map((word, i) => (
                <motion.span key={`w1-${i}`} style={{ display: 'inline-block', marginRight: '0.25em' }} variants={{ hidden: { opacity: 0, y: 15, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}>
                  {word}
                </motion.span>
              ))}
              <motion.span 
                className="hp-gradient-text accent-text" 
                style={{ display: 'inline-block' }}
                variants={{ hidden: { opacity: 0, y: 15, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
              >
                Musician
              </motion.span>
              <br />
              {"For Your".split(" ").map((word, i) => (
                <motion.span key={`w2-${i}`} style={{ display: 'inline-block', marginRight: '0.25em' }} variants={{ hidden: { opacity: 0, y: 15, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}>
                  {word}
                </motion.span>
              ))}
              <motion.span 
                className="hp-gradient-text accent-text" 
                style={{ display: 'inline-block', marginRight: '0.15em' }}
                variants={{ hidden: { opacity: 0, y: 15, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
              >
                Grand
              </motion.span>
              <motion.span 
                className="hp-gradient-text accent-text" 
                style={{ display: 'inline-block' }}
                variants={{ hidden: { opacity: 0, y: 15, filter: 'blur(8px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } } }}
              >
                Event!
              </motion.span>
            </motion.h1>

            <motion.div
              className="hp-hero-contact-wrap"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <a href="tel:+918076515257" className="hp-hero-contact-pill">
                <span className="hp-contact-icon">📞</span>
                <span>Contact Us on <strong>+91 80765 15257</strong></span>
              </a>
            </motion.div>

            <motion.div
              className="hp-hero-actions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking' } }))}
                className="hp-btn hp-btn-primary"
              >
                <span>Book Now</span>
                <span className="hp-btn-shine" aria-hidden="true" />
              </button>
              <Link href="/artists" className="hp-btn hp-btn-ghost">
                View All Artists
              </Link>
            </motion.div>

            <motion.div
              className="hp-stats"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1, delayChildren: 0.5 }
                }
              }}
            >
              {HERO_STATS.map(item => (
                <motion.div 
                  key={item.label} 
                  className="hp-stat-card"
                  variants={{
                    hidden: { opacity: 0, y: 15, scale: 0.95 },
                    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
                  }}
                >
                  <strong>
                    {item.value}{item.suffix}
                  </strong>
                  <span>{item.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}



