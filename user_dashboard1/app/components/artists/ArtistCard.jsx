"use client";

import { useState, useEffect, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import TiltCard from '@/app/components/common/TiltCard'
import Stars from '@/app/components/common/Stars'
import '@/app/styles/pages/HomePage.css'

const ArtistCard = forwardRef(({ artist, onBook }, ref) => {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [bookings, setBookings] = useState(0)

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    
    if (artist.successful_bookings && artist.successful_bookings > 0) {
      setBookings(artist.successful_bookings)
    } else {
      setBookings(0)
    }
    
    return () => window.removeEventListener('resize', handleResize)
  }, [artist.successful_bookings])

  const parseJsonArray = (val, fallbackStr) => {
    if (Array.isArray(val)) return val.filter(Boolean);
    try {
      if (typeof val === 'string') {
        const parsed = JSON.parse(val);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      }
    } catch (e) {
      // ignore
    }
    if (typeof fallbackStr === 'string' && fallbackStr.trim() !== '') {
      return fallbackStr.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  };

  let subCats = parseJsonArray(artist.subCategory, artist.subCategory);
  let langs = parseJsonArray(artist.languages, artist.languages);
  let mainCat = artist.category ? artist.category.split(',').map(s => s.trim()) : [];
  
  let allTags = [...new Set([...mainCat, ...subCats, ...langs])].filter(Boolean);
  if (allTags.length === 0) allTags = ['Performer'];

  const location = [artist.city, artist.state].filter(Boolean).join(', ') || 'Jaipur'
  const rating = artist.rating !== undefined && artist.rating !== null ? Number(artist.rating).toFixed(1) : '0.0'
  
  const imgSrc = (!artist.img || imageError) 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name || 'A')}&background=1A1A1A&color=FFE032&size=400&font-size=0.33&bold=true`
    : artist.img

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
      style={{ display: 'flex', width: '100%', height: '100%' }}
    >
      <Link href={`/artist/${encodeURIComponent(artist.name)}`} target={isMobile ? '_self' : '_blank'} style={{ textDecoration: 'none', display: 'flex', width: '100%', height: '100%' }}>
        <TiltCard 
          className="modern-artist-card"
        >
        <div className="modern-img-wrap relative">
          <Image
            src={imgSrc}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            style={{ objectFit: 'cover' }}
            unoptimized
            onError={() => setImageError(true)}
          />
          <div className="modern-overlay-gradient"></div>
        </div>
        <div className="modern-info-overlay" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)', padding: '24px 20px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
          <h3 className="modern-artist-name" style={{ fontSize: '24px', fontWeight: '900', margin: '0 0 6px 0', color: '#ffffff', letterSpacing: '-0.02em', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{artist.name}</h3>

          <div className="modern-badges-container" style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', overflow: 'hidden', alignItems: 'center', marginBottom: '16px' }}>
            {allTags.slice(0, 3).map((tag, idx) => (
              <span key={`tag-${idx}`} style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', padding: '2px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: '800', letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{tag}</span>
            ))}
            {allTags.length > 3 && <span style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)', padding: '1px 6px', borderRadius: '8px', fontSize: '9px', fontWeight: '800', whiteSpace: 'nowrap' }}>+{allTags.length - 3}</span>}
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '14px', height: '14px', color: '#cbd5e1' }}>
              <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
            </svg>
            <span style={{ color: '#cbd5e1', fontSize: '13px', fontWeight: '500' }}>{location}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <Stars count={Math.round(Number(rating))} />
                <span style={{ color: '#ffffff', fontWeight: '800', fontSize: '14px' }}>{rating}</span>
              </div>
            </div>
            {mounted && bookings > 0 && (
              <div style={{ background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.4) 100%)', color: '#34d399', padding: '4px 8px', borderRadius: '20px', fontSize: '8px', fontWeight: '800', letterSpacing: '0.02em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(16, 185, 129, 0.3)', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)', whiteSpace: 'nowrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '12px', height: '12px', flexShrink: 0, background: 'rgba(16, 185, 129, 0.25)', borderRadius: '50%' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" style={{ width: '8px', height: '8px', color: '#34d399' }}>
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>{bookings} Successful Bookings</span>
              </div>
            )}
          </div>
        </div>
      </TiltCard>
      </Link>
    </motion.div>
  )
})

ArtistCard.displayName = 'ArtistCard';

export default ArtistCard;
