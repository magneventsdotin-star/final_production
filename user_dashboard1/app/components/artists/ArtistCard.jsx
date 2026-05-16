"use client";

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function ArtistCard({ artist, onBook }) {
  const [imageError, setImageError] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  
  const firstLetter = artist.name ? artist.name.charAt(0).toUpperCase() : 'A'

  useEffect(() => {
    if (showDetails) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [showDetails]);

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="artist-card-v2"
      >
        <div className="card-inner">
          <div className="artist-avatar-container">
            <div className="avatar-ring">
              <div className="avatar-img-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0a0a0a' }}>
                {(!artist.img || imageError) ? (
                  <span style={{ fontSize: '50px', fontWeight: 'bold', color: '#fff', opacity: 0.2 }}>{firstLetter}</span>
                ) : (
                  <img 
                    src={artist.img} 
                    alt={artist.name}
                    className="artist-avatar-img w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                )}
              </div>
              <div className="note-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              </div>
            </div>
          </div>

          <div className="artist-info-v2" style={{ width: '100%' }}>
            <h3 className="artist-name-v2">{artist.name}</h3>
            <div className="category-badge-v2">{artist.subCategory || artist.category || 'PERFORMER'}</div>
            <div className="artist-details-row">
              {(artist.city || artist.state) && (
                <div className="detail-item">
                  <svg className="detail-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span>{[artist.city, artist.state].filter(Boolean).join(', ')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="artist-dual-actions">
            <button className="btn-book-premium yellow-btn" onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: artist } }))}>
              <span>BOOK NOW</span>
            </button>
            <button className="btn-details-premium" onClick={() => setShowDetails(true)}>VIEW DETAILS</button>
          </div>
        </div>
      </motion.div>

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
              
              <div className="proper-modal-content">
                {/* Left Side: Visual Profile */}
                <div className="proper-modal-left">
                  <div className="proper-avatar-wrap">
                    <div className="proper-avatar-img">
                      {(!artist.img || imageError) ? (
                        <span className="placeholder-large">{firstLetter}</span>
                      ) : (
                        <img src={artist.img} alt={artist.name} />
                      )}
                    </div>
                    <div className="proper-avatar-glow" />
                  </div>
                  <h2 className="proper-name">{artist.name}</h2>
                  <span className="proper-tag">{artist.subCategory || artist.category}</span>
                  
                  <div className="proper-stats-row">
                    <div className="p-stat"><strong>5.0</strong><span>RATING</span></div>
                    <div className="p-stat"><strong>150+</strong><span>SHOWS</span></div>
                  </div>
                </div>

                {/* Right Side: Detailed Information */}
                <div className="proper-modal-right">
                  <div className="proper-section">
                    <h4 className="proper-section-title">Artist Information</h4>
                    <div className="proper-info-grid">
                      <div className="proper-info-item">
                        <span className="p-label">Location</span>
                        <span className="p-value">{[artist.city, artist.state].filter(Boolean).join(', ') || 'Global'}</span>
                      </div>
                      <div className="proper-info-item">
                        <span className="p-label">Category</span>
                        <span className="p-value">{artist.category || 'Solo Performer'}</span>
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
                      {artist.quote || "A top-tier artist providing premium entertainment solutions for high-end events. Known for exceptional vocal performance and stage presence."}
                    </p>
                  </div>

                  <div className="proper-modal-footer">
                    <button 
                      className="proper-book-btn"
                      onClick={() => {
                        setShowDetails(false);
                        window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: artist } }));
                      }}
                    >
                      PROCEED TO BOOKING
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
