"use client";

import { useState, useEffect, forwardRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { motion } from 'framer-motion'
import TiltCard from '@/app/components/common/TiltCard'
import Stars from '@/app/components/common/Stars'
import '@/app/styles/pages/HomePage.css'

const ArtistCard = forwardRef(({ artist, onBook }, ref) => {
  const router = useRouter()
  const [imageError, setImageError] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const genre = artist.subCategory || artist.category || 'Performer'
  const location = [artist.city, artist.state].filter(Boolean).join(', ') || 'Jaipur'
  const rating = artist.rating || '4.9'
  const bookings = artist.successful_bookings || Math.floor(Math.random() * 50) + 50
  
  const imgSrc = (!artist.img || imageError) 
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.name || 'A')}&background=111111&color=D65050&size=400&font-size=0.33&bold=true`
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
      <TiltCard 
        className="hp-feat-card-v2"
        onClick={() => window.open(`/artist/${encodeURIComponent(artist.name)}`, '_blank')}
        style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}
      >
        <div className="hp-feat-img-wrap-v2" style={{ flex: 1, minHeight: '300px', position: 'relative' }}>
          <Image
            src={imgSrc}
            alt={artist.name}
            fill
            sizes="(max-width: 768px) 300px, 400px"
            style={{ objectFit: 'cover' }}
            unoptimized
            onError={() => setImageError(true)}
          />
        </div>
        <div className="hp-feat-info-v2" style={{ flexShrink: 0 }}>
          <span className="hp-feat-genre-v2">{genre}</span>
          <h3 className="hp-feat-name-v2">{artist.name}</h3>
          <span className="hp-feat-loc-v2">{location}</span>

          <div className="hp-feat-rating-v2">
            <Stars count={Math.round(Number(rating))} />
            <span className="hp-feat-score-v2">{rating} · {bookings} bookings</span>
          </div>


        </div>
      </TiltCard>
    </motion.div>
  )
})

ArtistCard.displayName = 'ArtistCard';

export default ArtistCard;
