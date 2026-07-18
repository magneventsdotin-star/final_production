"use client";

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import { ARTIST_CATEGORIES } from '@/app/constants'
import { SingerIcon, BandsIcon, DjIcon, ComedianIcon, AnchorIcon, DancerIcon, MagicianIcon } from '@/app/components/home/CategoryIcons'

const getCategoryIcon = (label) => {
  switch(label) {
    case 'Singers': return <SingerIcon />;
    case 'Live Bands': return <BandsIcon />;
    case 'DJs': return <DjIcon />;
    case 'Comedians': return <ComedianIcon />;
    case 'Anchors': return <AnchorIcon />;
    case 'Dancers': return <DancerIcon />;
    case 'Magicians': return <MagicianIcon />;
    default: return <SingerIcon />;
  }
}

function CategoriesSection() {
  const [catPage, setCatPage] = useState(0)
  const [catPerPage, setCatPerPage] = useState(4)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCatPerPage(1)
      } else {
        setCatPerPage(4)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const totalCatPages = Math.ceil(ARTIST_CATEGORIES.length / catPerPage)
  const moveCat = (dir) => setCatPage(p => (p + dir + totalCatPages) % totalCatPages)

  return (
    <FadeSection className="hp-shell hp-block">
      <div className="hp-cat-section">
        <div className="hp-cat-header">
          <h2 className="hp-cat-title">Artist Categories</h2>
          <p className="hp-cat-desc" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', maxWidth: '500px', margin: '0 auto' }}>
            Choose from our handpicked, premium categories of certified top talent.
          </p>
          <Link href="/artists" className="hp-cat-all-btn">
            View All Artists →
          </Link>
        </div>

        <div className="hp-cat-carousel-wrap">
          <button className="lux-arrow-btn is-left" onClick={() => moveCat(-1)} aria-label="Previous categories">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>

          <div className="hp-cat-carousel">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={catPage}
                className="hp-cat-grid"
                initial={{ opacity: 0, x: 80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -80 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={(event, info) => {
                  const swipeThreshold = 30;
                  if (info.offset.x < -swipeThreshold) {
                    moveCat(1);
                  } else if (info.offset.x > swipeThreshold) {
                    moveCat(-1);
                  }
                }}
                style={{ touchAction: 'pan-y' }}
              >
                {ARTIST_CATEGORIES.slice(catPage * catPerPage, catPage * catPerPage + catPerPage).map((cat, i) => (
                  <Link key={cat.label} href={`/artists?category=${cat.query}`} className="hp-cat-card-v2">
                    <div className="hp-cat-avatar-ring">
                      <div className="hp-cat-img-wrapper" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        width: '100%',
                        height: '100%',
                        padding: '10px'
                      }}>
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {getCategoryIcon(cat.label)}
                        </div>
                      </div>
                      <div className="hp-cat-note-badge">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18V5l12-2v13" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="16" r="3" />
                        </svg>
                      </div>
                    </div>
                    <div className="hp-cat-info">
                      <span className="hp-cat-label-v2">{cat.label.toUpperCase()}</span>
                      <span className="hp-cat-sub-label">{cat.startingPrice || 'Top Talent'}</span>
                    </div>
                  </Link>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          <button className="lux-arrow-btn" onClick={() => moveCat(1)} aria-label="Next categories">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>

        <div className="hp-cat-dots">
          {Array.from({ length: totalCatPages }).map((_, i) => (
            <button
              key={i}
              className={`hp-cat-dot ${catPage === i ? 'is-active' : ''}`}
              onClick={() => setCatPage(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </FadeSection>
  )
}

export default React.memo(CategoriesSection);


