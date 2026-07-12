"use client";

import React from 'react';
import Link from 'next/link';
import { ARTIST_CATEGORIES } from '@/app/constants';

function MobileCategories() {
  return (
    <section className="mobile-shell" style={{ marginBottom: '40px' }}>
      <div className="mobile-section-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '24px' }}>Categories</h2>
        </div>
        <Link href="/artists" style={{ fontSize: '13px', color: '#FFE032', textDecoration: 'none', fontWeight: '600' }}>
          View All
        </Link>
      </div>

      {/* Native horizontal scrolling container */}
      <div style={{
        display: 'flex',
        gap: '16px',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
        paddingBottom: '16px',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none', /* Firefox */
        msOverflowStyle: 'none'  /* IE/Edge */
      }}
      className="hide-scrollbar"
      >
        {ARTIST_CATEGORIES.map((cat, i) => (
          <Link 
            key={cat.label} 
            href={`/artists?category=${cat.query}`}
            style={{
              scrollSnapAlign: 'start',
              flex: '0 0 auto',
              width: '140px',
              textDecoration: 'none',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            <div style={{
              width: '100px',
              height: '100px',
              borderRadius: '50%',
              overflow: 'hidden',
              position: 'relative',
              border: '2px solid rgba(255, 224, 50, 0.3)'
            }}>
              <img
                src={typeof cat.image === "object" ? cat.image?.src : cat.image}
                alt={cat.label} style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", inset: 0 }}
               />
            </div>
            <div style={{ textAlign: 'center' }}>
              <span style={{ display: 'block', fontSize: '13px', color: '#fff', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {cat.label}
              </span>
              <span style={{ display: 'block', fontSize: '11px', color: 'rgba(255,255,255,0.5)', marginTop: '4px' }}>
                {cat.startingPrice || 'Top Talent'}
              </span>
            </div>
          </Link>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  );
}

export default React.memo(MobileCategories);
