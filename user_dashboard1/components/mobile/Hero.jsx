"use client";

import React from 'react';
import Link from 'next/link';
import { HERO_STATS, HERO_SPOTLIGHT_SLIDES } from '@/app/constants';

export default function MobileHero() {
  const bgImage = HERO_SPOTLIGHT_SLIDES[0] || "/images/placeholder.jpg"; // Using only the first slide to save JS bundle and rendering on mobile

  return (
    <section className="mobile-hero">
      <div className="mobile-hero-bg">
        <img
          src={typeof bgImage === "object" ? bgImage?.src : bgImage}
          alt="Live Music Background" style={{ objectFit: 'cover' }}
         />
        <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)' }} />
      </div>
      
      <div className="mobile-shell mobile-hero-content">
        <h1 className="mobile-hero-h1">
          Book A <span style={{ color: '#FFE032' }}>Musician</span><br/>
          For Your <span style={{ color: '#FFE032' }}>Grand Event!</span>
        </h1>
        
        <div style={{ marginBottom: '24px' }}>
          <a href="tel:+918076515257" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            padding: '12px 20px', background: 'rgba(255,255,255,0.1)', 
            border: '1px solid rgba(255,255,255,0.2)', borderRadius: '100px',
            color: '#fff', textDecoration: 'none', fontSize: '14px', fontWeight: '600'
          }}>
            <span>📞</span> Contact Us on <strong style={{ color: '#FFE032' }}>+91 80765 15257</strong>
          </a>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking' } }))}
            className="mobile-btn"
            style={{ background: 'linear-gradient(135deg, #e53e3e 0%, #8b2d2d 100%)', color: '#fff' }}
          >
            Book Now
          </button>
          <Link href="/artists" className="mobile-btn" style={{ background: 'transparent', border: '1px solid #FFE032', color: '#FFE032' }}>
            View All Artists
          </Link>
        </div>
        
        <div className="mobile-stats">
          {HERO_STATS.slice(0, 2).map(item => (
            <div key={item.label} className="mobile-stat-card">
              <strong>{item.value}{item.suffix}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
