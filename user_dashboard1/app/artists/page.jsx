"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import ArtistCard from '@/app/components/artists/ArtistCard'
import { ARTISTS_CAT_FILTER, FEATURED_ARTISTS } from '@/app/constants'
import { supabase } from '@/app/lib/supabase'
import '@/app/styles/pages/Artists.css'

let cachedArtistsData = null;

export default function ArtistsPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const ITEMS_PER_PAGE = 12

  const fetchArtists = async (page = 1, category = activeCategory) => {
    setLoading(true)
    try {
      let query = supabase
        .from('artists')
        .select('*, artist_images(image_url)', { count: 'exact' })
        .eq('is_live', true)

      if (category !== 'All') {
        const filterCat = category.replace(/s$/i, '')
        query = query.or(`category.ilike.%${filterCat}%,sub_category.ilike.%${filterCat}%`)
      }

      const from = (page - 1) * ITEMS_PER_PAGE
      const to = from + ITEMS_PER_PAGE - 1

      const { data, count, error } = await query
        .range(from, to)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      if (data) {
        const formattedArtists = data.map(artist => ({
          id: artist.id,
          artist_no: artist.artist_no,
          name: artist.alias || artist.name,
          category: artist.category,
          subCategory: artist.sub_category,
          city: artist.city,
          state: artist.state,
          languages: artist.performing_language,
          priceMin: artist.price_min,
          priceMax: artist.price_max,
          originalPrice: artist.original_price,
          exclusivePrice: artist.exclusive_price,
          price: artist.price_min,
          successful_bookings: artist.successful_bookings,
          rating: artist.rating,
          img: artist.artist_images?.[0]?.image_url || null,
          galleryImages: artist.artist_images?.map(img => img.image_url).filter(Boolean) || [],
          videoUrls: artist.video_url ? artist.video_url.split(',').map(url => url.trim()).filter(Boolean) : [],
          quote: artist.bio || '',
        }))
        setArtists(formattedArtists)
        setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
      }
    } catch (err) {
      console.error('Error fetching artists:', err)
      setArtists([])
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

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
    fetchArtists(currentPage, activeCategory)
  }, [currentPage, activeCategory])

  const handleBook = (name) => {
    router.push(`/book?artist=${encodeURIComponent(name)}`)
  }

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    setCurrentPage(1)
  }

  return (
    <main className="artists-page">
      <div className="lux-container">


        <div className="artists-filters">
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

        <div className="artists-grid">
          {loading ? (
            <>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="artist-card-skeleton" style={{ 
                  background: 'rgba(255,255,255,0.02)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '24px', 
                  height: '460px', 
                  width: '100%', 
                  overflow: 'hidden'
                }}>
                   <div className="skeleton-pulse" style={{ height: '220px', background: 'rgba(255,255,255,0.04)', width: '100%' }}></div>
                   <div style={{ padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                     <div className="skeleton-pulse" style={{ height: '28px', width: '70%', background: 'rgba(255,255,255,0.04)', borderRadius: '6px', marginBottom: '12px' }}></div>
                     <div className="skeleton-pulse" style={{ height: '14px', width: '40%', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', marginBottom: '30px' }}></div>
                     
                     <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', width: '100%', justifyContent: 'center' }}>
                       <div className="skeleton-pulse" style={{ height: '36px', width: '60px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}></div>
                       <div className="skeleton-pulse" style={{ height: '36px', width: '60px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}></div>
                     </div>
                     
                     <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                       <div className="skeleton-pulse" style={{ height: '44px', flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '100px' }}></div>
                       <div className="skeleton-pulse" style={{ height: '44px', flex: 1, background: 'rgba(255,255,255,0.04)', borderRadius: '100px' }}></div>
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

      </div>
    </main>
  )
}

