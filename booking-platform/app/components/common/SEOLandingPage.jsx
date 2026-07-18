"use client";

import CategoriesSection from '@/app/components/home/CategoriesSection'
import FeaturedArtistsSection from '@/app/components/home/FeaturedArtistsSection'
import HowToBookSection from '@/app/components/home/HowToBookSection'
import FaqSection from '@/app/components/home/FaqSection'
import InfoCards from '@/app/components/home/InfoCards'
import ContactSection from '@/app/components/home/ContactSection'
import '@/app/styles/pages/HomePage.css'
import Link from 'next/link'

export default function SEOLandingPage({ heroTitle, heroSubtitle, schema }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="hp">
        <section className="hp-hero" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '10rem 2rem 4rem', background: 'radial-gradient(circle at top, #1a1a1a 0%, #000000 100%)' }}>
          <div className="hp-hero-content" style={{ maxWidth: '800px', margin: '0 auto', zIndex: 10, position: 'relative' }}>
            <h1 className="hp-hero-h1" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', marginBottom: '1.5rem', lineHeight: 1.2 }}>
              <span className="hp-gradient-text accent-text">{heroTitle}</span>
            </h1>
            <p style={{ fontSize: '1.25rem', color: '#ccc', marginBottom: '2rem' }}>{heroSubtitle}</p>
            <div className="hp-hero-actions" style={{ justifyContent: 'center' }}>
              <button
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking' } }))
                  }
                }}
                className="hp-btn hp-btn-primary"
              >
                <span>Book Now</span>
                <span className="hp-btn-shine" aria-hidden="true" />
              </button>
              <Link href="/artists" className="hp-btn hp-btn-ghost">
                Browse Artists
              </Link>
            </div>
          </div>
        </section>

        <CategoriesSection />
        <FeaturedArtistsSection />
        <HowToBookSection />
        <FaqSection />
        <InfoCards />
        <ContactSection />
      </div>
    </>
  )
}
