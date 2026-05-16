"use client"
import { motion } from 'framer-motion'

/**
 * TestimonialCard Component
 * 
 * Displays a client review with stars and location.
 */
export default function TestimonialCard({ review, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      className="testi-card"
    >
      <div className="stars">
        {"★".repeat(review.stars || 5)}
      </div>
      <p className="testi-text">"{review.text}"</p>
      <div className="testi-user">
        <div className="user-info">
          <strong>{review.name}</strong>
          <span>{review.location || review.city}</span>
        </div>
      </div>
    </motion.div>
  )
}
