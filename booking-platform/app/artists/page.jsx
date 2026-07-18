"use client"

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import ArtistCard from '@/app/components/artists/ArtistCard'
import { ARTISTS_CAT_FILTER } from '@/app/constants'
import { useArtists } from '@/app/hooks/useArtists'
import '@/app/styles/pages/Artists.css'

let cachedArtistsData = null;

export default function ArtistsPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeCity, setActiveCity] = useState('All Cities')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  const { artists, loading, totalPages, fetchArtists } = useArtists(15)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const catParam = params.get('category')
      if (catParam) {
        const match = ARTISTS_CAT_FILTER.find(
          c => c.toLowerCase() === catParam.toLowerCase() ||
               c.toLowerCase() === catParam.toLowerCase() + 's' ||
               c.toLowerCase().replace(/s$/, '') === catParam.toLowerCase()
        )
        if (match) {
          setActiveCategory(match)
          return
        }
      }
    }
  }, [])

  useEffect(() => {
    fetchArtists(currentPage, activeCategory, activeCity)
  }, [currentPage, activeCategory, activeCity])

  const handleBook = (name) => {
    router.push(`/book?artist=${encodeURIComponent(name)}`)
  }

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setCurrentPage(1)
  }

  const handleCityChange = (city) => {
    setActiveCity(city)
    setCurrentPage(1)
  }

  return (
    <main className="artists-page">
      <div className="lux-container">

        <div className="artists-top-bar">
          <div className="artists-filters" style={{ margin: 0, flex: 1 }}>
            {ARTISTS_CAT_FILTER.map((cat, idx) => (
              <motion.button
                key={cat}
                className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => handleCategoryChange(cat)}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                {cat}
              </motion.button>
            ))}
          </div>

          <div className="modern-dropdown-container" ref={dropdownRef}>
            <button 
              className={`modern-dropdown-btn ${isDropdownOpen ? 'active' : ''}`}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span style={{ textTransform: 'uppercase' }}>{activeCity}</span>
              <ChevronDown size={18} style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  className="modern-dropdown-menu"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    className={`modern-dropdown-item ${activeCity === 'All Cities' ? 'active' : ''}`}
                    onClick={() => { handleCityChange('All Cities'); setIsDropdownOpen(false); }}
                  >
                    ALL CITIES
                  </div>
                  {['Delhi', 'Noida', 'Greater Noida', 'Gurugram', 'Faridabad', 'Ghaziabad', 'Sonipat', 'Rohtak', 'Meerut', 'Mumbai', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow', 'Chandigarh', 'Goa', 'Surat', 'Indore', 'Ludhiana'].map(city => (
                    <div 
                      key={city} 
                      className={`modern-dropdown-item ${activeCity === city ? 'active' : ''}`}
                      onClick={() => { handleCityChange(city); setIsDropdownOpen(false); }}
                    >
                      {city.toUpperCase()}
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="artists-grid">
          {loading ? (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="modern-artist-card artist-card-skeleton" style={{ 
                  background: '#0a0a0a', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '24px 20px 20px'
                }}>
                   {/* Background Shimmer */}
                   <div className="skeleton-pulse" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.03)' }}></div>
                   
                   {/* Overlay Gradient mimicking the real card */}
                   <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, transparent 100%)', pointerEvents: 'none' }}></div>
                   
                   {/* Content */}
                   <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                     {/* Name */}
                     <div className="skeleton-pulse" style={{ height: '28px', width: '60%', background: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}></div>
                     
                     {/* Genres */}
                     <div style={{ display: 'flex', gap: '6px' }}>
                       <div className="skeleton-pulse" style={{ height: '14px', width: '50px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}></div>
                       <div className="skeleton-pulse" style={{ height: '14px', width: '60px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}></div>
                     </div>
                     
                     {/* Location */}
                     <div className="skeleton-pulse" style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', marginBottom: '8px' }}></div>
                     
                     {/* Bottom Row */}
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
              {artists.length > 0 ? (
                artists.map((artist) => (
                  <ArtistCard
                    key={artist.id}
                    artist={artist}
                    onBook={handleBook}
                  />
                ))
              ) : (
                <p style={{ textAlign: 'center', width: '100%', color: 'white', gridColumn: '1 / -1', padding: '40px 0' }}>No artists found in this category.</p>
              )}
            </AnimatePresence>
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <div className="fancy-pagination-wrapper">
              <button 
                className="fancy-pagination-btn"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1 || loading}
                aria-label="Previous page"
              >
                ← Previous
              </button>
              <span className="fancy-pagination-info">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                className="fancy-pagination-btn is-active"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || loading}
                aria-label="Next page"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        <div className="artists-header" style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '2rem', paddingTop: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem', color: '#fff' }}>
            Magnevents — Premium Live Artist Booking
          </h1>
          <p style={{ color: 'var(--text-muted)', maxWidth: '800px', margin: '0 auto', fontSize: '1.1rem', lineHeight: '1.6' }}>
            Welcome to Magnevents, India's premier destination for booking top-tier live entertainment. Whether you are planning a grand wedding, a corporate gala, a private celebration, or a massive music festival, our curated roster of extraordinary talent ensures an unforgettable experience. Discover incredible live bands, soulful Sufi singers, high-energy Bollywood performers, and mesmerizing instrumentalists. Our artist-first booking platform connects you directly with the best musicians in the industry, guaranteeing transparent pricing and seamless management. Browse through our extensive selection below, filter by your preferred musical genre or location, and book the perfect artist to elevate your next event from ordinary to spectacular. We pride ourselves on delivering premium live artist booking services for weddings, corporate nights, and concerts across all major cities.
          </p>
        </div>

      </div>
    </main>
  )
}

