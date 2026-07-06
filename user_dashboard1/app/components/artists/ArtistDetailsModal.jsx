"use client";

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import '@/app/styles/pages/Artists.css'

export default function ArtistDetailsModal({ artist, showDetails, setShowDetails }) {
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('modal-open');
    } else {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.classList.remove('modal-open');
    };
  }, [showDetails]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {showDetails && (
        <div className="artist-details-overlay" onClick={() => setShowDetails(false)}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="proper-desktop-modal"
            onClick={e => e.stopPropagation()}
          >
            <button className="proper-close-btn" onClick={() => setShowDetails(false)}>&times;</button>

            <div className="proper-modal-header" style={{ position: 'relative', width: '100%', height: '380px', overflow: 'hidden' }}>
              {(!artist.img && !artist.image) || imageError ? (
                <Image
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name || 'A')}&background=111111&color=D65050&size=800&font-size=0.33&bold=true`}
                  alt={artist.name}
                  fill
                  sizes="1000px"
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                  unoptimized
                />
              ) : (
                <Image
                  src={artist.img || artist.image}
                  alt={artist.name}
                  fill
                  sizes="1000px"
                  style={{ objectFit: 'cover', objectPosition: 'top center' }}
                  unoptimized
                  onError={() => setImageError(true)}
                />
              )}
              <div className="image-overlay-gradient"></div>
              <div style={{ position: 'absolute', bottom: '25px', left: '40px', zIndex: 10, textAlign: 'left' }}>
                <h2 className="proper-name" style={{ margin: 0, fontSize: '42px', textShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>{artist.name}</h2>
                <span className="proper-tag" style={{ display: 'inline-block', marginTop: '8px' }}>{artist.subCategory || artist.category || (artist.genres ? artist.genres.join(', ') : 'Artist')}</span>
              </div>
              <div style={{ position: 'absolute', bottom: '25px', right: '40px', zIndex: 10, display: 'flex', gap: '20px' }}>
                <div className="p-stat" style={{ textAlign: 'center' }}><strong>{artist.rating || '5.0'}</strong><span>RATING</span></div>
                <div className="p-stat" style={{ textAlign: 'center' }}><strong>{artist.bookings || '150+'}</strong><span>SHOWS</span></div>
              </div>
            </div>

            <div className={`proper-modal-content-new ${(!artist.videoUrls?.length && !artist.galleryImages?.length) ? 'single-col' : ''}`} style={{ padding: '40px' }}>
              
              {(artist.videoUrls?.length > 0 || artist.galleryImages?.length > 0) && (
                <div className="proper-modal-left-col">
                  <div className="proper-section">
                    <h4 className="proper-section-title">Media Gallery</h4>
                    
                    {artist.videoUrls?.map((url, i) => {
                      const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                      const ytId = match ? match[1] : null;
                      if (!ytId) return null;
                      return (
                        <div key={i} style={{ marginBottom: '20px', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                          <iframe 
                            width="100%" 
                            height="220" 
                            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`} 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen
                          ></iframe>
                        </div>
                      );
                    })}

                    {artist.galleryImages?.length > 0 && (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                        {artist.galleryImages.map((imgUrl, i) => (
                          <div key={i} style={{ position: 'relative', height: '100px', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                            <Image src={imgUrl} fill style={{ objectFit: 'cover' }} alt={`${artist.name} gallery ${i+1}`} unoptimized />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="proper-modal-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div className="proper-section">
                  <h4 className="proper-section-title">Artist Information</h4>
                  <div className="proper-info-grid">
                    <div className="proper-info-item">
                      <span className="p-label">Location</span>
                      <span className="p-value">{[artist.city, artist.state].filter(Boolean).join(', ') || 'Global'}</span>
                    </div>
                    <div className="proper-info-item">
                      <span className="p-label">Category</span>
                      <span className="p-value">{artist.category || (artist.genres ? artist.genres[0] : 'Solo Performer')}</span>
                    </div>
                    <div className="proper-info-item">
                      <span className="p-label">Languages</span>
                      <span className="p-value">{artist.languages || 'English, Hindi'}</span>
                    </div>
                    {artist.originalPrice ? (
                      <div className="proper-info-item">
                        <span className="p-label">Original Price</span>
                        <span className="p-value highlight" style={{ textDecoration: 'line-through', opacity: 0.6 }}>₹{artist.originalPrice?.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="proper-info-item">
                        <span className="p-label">Price Range</span>
                        <span className="p-value highlight">₹{artist.priceMin?.toLocaleString()} - ₹{artist.priceMax?.toLocaleString()}</span>
                      </div>
                    )}
                    {artist.exclusivePrice && (
                      <div className="proper-info-item">
                        <span className="p-label">Exclusive Price</span>
                        <span className="p-value highlight" style={{ color: '#e11d48' }}>₹{artist.exclusivePrice?.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="proper-section">
                  <h4 className="proper-section-title">Professional Bio</h4>
                  <p className="proper-bio-text">
                    {artist.quote || artist.bio || "A top-tier artist providing premium entertainment solutions for high-end events. Known for exceptional vocal performance and stage presence."}
                  </p>
                </div>

                <div className="proper-modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: 'auto', paddingTop: '20px' }}>
                  <button
                    className="proper-book-btn"
                    onClick={() => {
                      setShowDetails(false);
                      window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: artist } }));
                    }}
                  >
                    PROCEED TO BOOKING
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDetails(false)}
                    style={{
                      width: '100%',
                      height: '56px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      color: 'rgba(255, 255, 255, 0.6)',
                      borderRadius: '100px',
                      fontWeight: '800',
                      fontSize: '13px',
                      letterSpacing: '0.1em',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textTransform: 'uppercase'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(214, 80, 80, 0.1)';
                      e.target.style.borderColor = '#D65050';
                      e.target.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(255, 255, 255, 0.04)';
                      e.target.style.borderColor = 'rgba(255, 255, 255, 0.08)';
                      e.target.style.color = 'rgba(255, 255, 255, 0.6)';
                    }}
                  >
                    Cancel & Close
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
