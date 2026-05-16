"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

/**
 * ServiceCard Component
 * 
 * Displays a single service offering with an image and description.
 */
export default function ServiceCard({ service, index }) {
  return (
    <motion.article 
      className="service-item-card fx-soft-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="service-media">
        <img src={service.image} alt={service.title} />
        <div className="service-overlay" />
      </div>
      <div className="service-content">
        <h3>{service.title}</h3>
        <p>{service.desc}</p>
        <button onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))} className="service-action-btn">Check Availability</button>
      </div>
    </motion.article>
  )
}
