"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import SearchResultItem from '@/app/components/search/SearchResultItem'
import { searchService } from '@/app/services/searchService'
import { TRENDING_SEARCHES } from '@/app/constants'
import '@/app/styles/pages/SearchPage.css'

/**
 * SearchPage Component
 * 
 * Provides a dedicated search interface for the platform.
 * Refactored to use searchService for logic extraction.
 */
export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)

  const handleSearch = async (e) => {
    if (e) e.preventDefault()
    if (!query) return
    setIsSearching(true)
    
    try {
      const searchResults = await searchService.searchArtists(query)
      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handleTrendingClick = (tag) => {
    setQuery(tag)
    // Trigger immediate search
    setIsSearching(true)
    searchService.searchArtists(tag).then(res => {
      setResults(res)
      setIsSearching(false)
    })
  }

  return (
    <main className="search-page-layout">
      <div className="lux-container">
        <header className="search-page-header">
          <h1>Discover <span className="text-gradient">Magic</span></h1>
          <p>Search for artists, categories, or events to find your perfect match.</p>
        </header>

        <form className="search-large-bar" onSubmit={handleSearch}>
          <input 
            type="text" 
            placeholder="Search for 'Sufi Singers', 'Wedding Bands'..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          <button type="submit" className="fx-glow-button" disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Find Talent'}
          </button>
        </form>

        <div className="search-results-area">
          <AnimatePresence>
            {results.length > 0 ? (
              <div className="results-grid">
                {results.map((res, idx) => (
                  <SearchResultItem 
                    key={res.id} 
                    result={res} 
                    index={idx} 
                  />
                ))}
              </div>
            ) : query && !isSearching ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="search-empty"
              >
                <p>No results found for "{query}". Try searching for categories like "Singers" or "Bands".</p>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="search-trending">
          <h5>Trending Searches</h5>
          <div className="trending-tags">
            {TRENDING_SEARCHES.map(tag => (
              <button key={tag} onClick={() => handleTrendingClick(tag)}>
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
