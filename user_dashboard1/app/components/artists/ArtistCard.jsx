"use client";

import { useState, useEffect, forwardRef } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import ArtistDetailsModal from './ArtistDetailsModal'

const ArtistCard = forwardRef(({ artist, onBook }, ref) => {
  const [imageError, setImageError] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [mounted, setMounted] = useState(false)

  const firstLetter = artist.name ? artist.name.charAt(0).toUpperCase() : 'A'

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

  return (
    <>
      <motion.div
        ref={ref}
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="artist-card-v2"
      >
        <div className="artist-cover-image">
           {(!artist.img || imageError) ? (
             <Image
               src={`https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name || 'A')}&background=111111&color=D65050&size=400&font-size=0.33&bold=true`}
               alt={artist.name}
               fill
               sizes="(max-width: 768px) 300px, 400px"
               style={{ objectFit: 'cover' }}
               unoptimized
             />
           ) : (
             <Image
               src={artist.img}
               alt={artist.name}
               fill
               sizes="(max-width: 768px) 300px, 400px"
               style={{ objectFit: 'cover' }}
               unoptimized
               onError={() => setImageError(true)}
             />
           )}
           <div className="image-overlay-gradient"></div>
           <div className="note-icon-badge-v2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
           </div>
        </div>

        <div className="card-inner-content">
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

      <ArtistDetailsModal 
        artist={artist} 
        showDetails={showDetails} 
        setShowDetails={setShowDetails} 
      />
    </>
  )
})

ArtistCard.displayName = 'ArtistCard';

export default ArtistCard;
