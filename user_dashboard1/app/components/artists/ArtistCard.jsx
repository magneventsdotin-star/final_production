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

  useEffect(() => {
    setMounted(true)
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const rawGenre = artist.subCategory || artist.category || 'Performer'
  const genres = rawGenre.split(',').map(g => g.trim()).filter(Boolean)
  const displayGenres = genres.slice(0, 1)
  const hasMore = genres.length > 1

  const location = [artist.city, artist.state].filter(Boolean).join(', ') || 'Jaipur'
  const rating = artist.rating || '4.9'
  const bookings = artist.successful_bookings || Math.floor(Math.random() * 50) + 50
  
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
        <div className="modern-img-wrap">
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
        <div className="modern-info-overlay">
          <div className="modern-genres-wrapper">
            {displayGenres.map((g, idx) => (
              <span key={idx} className="modern-genre-badge">{g}</span>
            ))}
            {hasMore && <span className="modern-genre-badge outline">+{genres.length - 1}</span>}
          </div>
          <h3 className="modern-artist-name">{artist.name}</h3>
          <span className="modern-artist-loc">{location}</span>

          <div className="modern-artist-rating">
            <Stars count={Math.round(Number(rating))} />
            <span className="modern-score-text">{rating} · {bookings} bks</span>
          </div>
        </div>
      </TiltCard>
      </Link>
    </motion.div>
  )
})

ArtistCard.displayName = 'ArtistCard';

export default ArtistCard;
