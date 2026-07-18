"use client";

import { motion, AnimatePresence } from 'framer-motion'

export default function SearchOverlay({ isOpen, onClose, query, onQueryChange, onSubmit, searchRef }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="lux-search-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button type="button" className="lux-search-dismiss" aria-label="Close search" onClick={onClose} />
          <motion.div
            className="lux-search-panel"
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
          >
            <form onSubmit={onSubmit}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                placeholder="Search artists, bands, genres..."
                aria-label="Search"
                defaultValue=""
              />
              <button type="button" className="lux-search-esc" onClick={onClose}>ESC</button>
            </form>
            <p>Try: Bollywood Singer, Sufi Band, Wedding DJ</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
