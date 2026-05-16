"use client"

import { motion } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import TestimonialCard from '@/app/components/testimonials/TestimonialCard'
import { TESTIMONIALS } from '@/app/constants'
import '@/app/styles/pages/Testimonials.css'

/**
 * TestimonialsPage Component
 * 
 * Displays a grid of client reviews.
 * Refactored into modular components and centralized data.
 */
export default function TestimonialsPage() {
  return (
    <main className="lux-page testimonials-page">
      <div className="lux-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="testi-header"
        >
          <span className="accent-tag">REVIEWS</span>
          <h1>What Our <span className="text-gradient">Clients Say</span></h1>
          <p>Real Stories. Unforgettable Events.</p>
        </motion.div>

        <div className="testi-grid">
          {TESTIMONIALS.map((review, idx) => (
            <TestimonialCard 
              key={idx} 
              review={review} 
              index={idx} 
            />
          ))}
        </div>
      </div>
    </main>
  )
}
