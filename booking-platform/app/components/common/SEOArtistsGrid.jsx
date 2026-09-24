"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ArtistCard from '@/app/components/artists/ArtistCard';
import { useArtists } from '@/app/hooks/useArtists';
import '@/app/styles/pages/Artists.css';

export default function SEOArtistsGrid({ category = 'All', city = 'All Cities', fallbackArtists = [] }) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const { artists, loading, totalPages, fetchArtists } = useArtists(15);

  useEffect(() => {
    fetchArtists(currentPage, category, city);
  }, [currentPage, category, city, fetchArtists]);

  const handleBook = (name) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-contact-modal', {
          detail: {
            type: 'booking',
            artist: name,
            service: `${category} in ${city}`
          }
        })
      );
    }
  };

  const displayArtists = artists.length > 0 ? artists : fallbackArtists;
  const isShowingFallback = artists.length === 0 && fallbackArtists.length > 0;

  return (
    <div className="artists-page" style={{ padding: '2rem 0', background: 'transparent' }}>
      <div className="lux-container">
        <div className="hp-section-head" style={{ marginBottom: '2rem' }}>
          <h2>Available {category !== 'All' ? category + 's' : 'Artists'} {isShowingFallback ? `for ${city} Events` : `in ${city}`}</h2>
        </div>

        <div className="artists-grid">
          {loading ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="modern-artist-card artist-card-skeleton" style={{ 
                  background: '#0a0a0a', border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative', display: 'flex', flexDirection: 'column',
                  justifyContent: 'flex-end', padding: '24px 20px 20px'
                }}>
                   <div className="skeleton-pulse" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.03)' }}></div>
                   <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)', pointerEvents: 'none' }}></div>
                   <div style={{ relative: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     <div className="skeleton-pulse" style={{ height: '28px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}></div>
                     <div style={{ display: 'flex', gap: '6px' }}>
                       <div className="skeleton-pulse" style={{ height: '14px', width: '50px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}></div>
                       <div className="skeleton-pulse" style={{ height: '14px', width: '60px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}></div>
                     </div>
                     <div className="skeleton-pulse" style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '8px' }}></div>
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div className="skeleton-pulse" style={{ height: '14px', width: '70px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                          <div className="skeleton-pulse" style={{ height: '12px', width: '90px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}></div>
                        </div>
                        <div className="skeleton-pulse" style={{ height: '24px', width: '80px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}></div>
                     </div>
                   </div>
                </div>
              ))}
            </>
          ) : (
            <AnimatePresence mode='popLayout'>
              {isShowingFallback && (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  marginBottom: '10px',
                  padding: '18px 24px',
                  background: 'rgba(255, 224, 50, 0.08)',
                  borderRadius: '16px',
                  border: '1px solid rgba(255, 224, 50, 0.25)'
                }}>
                  <p style={{ margin: 0, color: '#FFE032', fontWeight: '700', fontSize: '15px' }}>
                    ✈️ Top Verified {category !== 'All' ? category + 's' : 'Performers'} Ready to Travel to {city}
                  </p>
                  <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', marginTop: '4px', display: 'block' }}>
                    Magnevents manages all artist travel, accommodation, technical riders, and venue sound coordination end-to-end.
                  </span>
                </div>
              )}

              {displayArtists.length > 0 ? (
                displayArtists.map((artist) => (
                  <ArtistCard key={artist.id} artist={artist} onBook={handleBook} />
                ))
              ) : (
                <div style={{ textAlign: 'center', width: '100%', gridColumn: '1 / -1', padding: '40px 20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <h3 style={{ color: '#fff', fontSize: '1.3rem', marginBottom: '8px' }}>Looking for a specific artist in {city}?</h3>
                  <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '20px', maxWidth: '500px', marginInline: 'auto' }}>
                    Our event specialists can source, curate, and book any verified performer according to your event requirements and budget.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleBook(null)}
                    style={{ background: '#FFE032', color: '#000', border: 'none', padding: '12px 28px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Request Custom Artist
                  </button>
                </div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
