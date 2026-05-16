"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import ArtistCard from '@/app/components/artists/ArtistCard'
import { ARTISTS_CAT_FILTER } from '@/app/constants'
import { supabase } from '@/app/lib/supabase'
import '@/app/styles/pages/Artists.css'

/**
 * ArtistsPage Component
 * 
 * Displays a filterable grid of elite performers.
 * Fetches standard artist profiles from Supabase.
 */
export default function ArtistsPage() {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState('All')
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data, error } = await supabase
          .from('artists')
          .select('*, artist_images(image_url)')
          .eq('is_popular', false)
          .eq('is_artist_of_month', false)
        
        if (error) throw error
 
        const formattedArtists = data.map(artist => ({
          id: artist.id,
          name: artist.name,
          category: artist.category,
          subCategory: artist.sub_category,
          city: artist.city,
          state: artist.state,
          languages: artist.performing_language,
          priceMin: artist.price_min,
          priceMax: artist.price_max,
          originalPrice: artist.original_price,
          exclusivePrice: artist.exclusive_price,
          img: artist.artist_images?.[0]?.image_url || null,
          quote: artist.bio || '',
        }))
        
        setArtists(formattedArtists)
      } catch (err) {
        console.error('Error fetching artists:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArtists()
  }, [])

  useEffect(() => {
    // Read category from URL if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const catParam = params.get('category')
      if (catParam) {
        // Find matching category in ARTISTS_CAT_FILTER (case insensitive, handle plurals)
        const match = ARTISTS_CAT_FILTER.find(
          c => c.toLowerCase() === catParam.toLowerCase() || 
               c.toLowerCase() === catParam.toLowerCase() + 's' ||
               c.toLowerCase().replace(/s$/, '') === catParam.toLowerCase()
        )
        if (match) setActiveCategory(match)
      }
    }
  }, [])

  const filteredArtists = activeCategory === 'All' 
    ? artists 
    : artists.filter(a => {
        const aCat = (a.category || '').toLowerCase()
        const filterCat = activeCategory.toLowerCase()
        return aCat === filterCat || aCat === filterCat.replace(/s$/, '') || aCat + 's' === filterCat
      })

  const handleBook = (name) => {
    router.push(`/book?artist=${encodeURIComponent(name)}`)
  }

  return (
    <main className="artists-page">
      <div className="lux-container">
        


        <div className="artists-filters">
          {ARTISTS_CAT_FILTER.map((cat, idx) => (
            <motion.button
              key={cat}
              className={`filter-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
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
            <p style={{ textAlign: 'center', width: '100%', color: 'white' }}>Loading artists...</p>
          ) : (
            <AnimatePresence mode='popLayout'>
              {filteredArtists.length > 0 ? (
                filteredArtists.map((artist) => (
                  <ArtistCard 
                    key={artist.id} 
                    artist={artist} 
                    onBook={handleBook} 
                  />
                ))
              ) : (
                <p style={{ textAlign: 'center', width: '100%', color: 'white' }}>No standard artists found.</p>
              )}
            </AnimatePresence>
          )}
        </div>

      </div>
    </main>
  )
}

