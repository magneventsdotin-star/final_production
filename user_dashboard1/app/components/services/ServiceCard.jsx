"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ServiceCard({ service, index }) {
  return (
    <motion.article
      className="service-item-card fx-soft-card"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="service-media" style={{ position: 'relative', overflow: 'hidden' }}>
        <img
          src={typeof service.image === "object" ? service.image?.src : service.image}
          alt={service.title} style={{ objectFit: "cover", width: "100%", height: "100%", position: "absolute", inset: 0 }}  />
        <div className="service-overlay" />
      </div>
      <div className="service-content">
        <h3>{service.title}</h3>
        <p>{service.desc}</p>
        <button 
          onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { 
            detail: { 
              type: 'booking', 
              service: {
                title: service.title,
                desc: service.desc
              } 
            } 
          }))} 
          className="service-action-btn"
        >
          Check Availability
        </button>
      </div>
    </motion.article>
  )
}
