"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { PREMIUM_CARDS } from '@/app/constants'
import '@/app/styles/components/PremiumShowcase.css'

export default function PremiumShowcase() {
  return (
    <section className="premium-section">
      <div className="premium-container">
        <div className="premium-header">
          <motion.span
            className="premium-eyebrow"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            EXCEPTIONAL SERVICE
          </motion.span>
          <motion.h2
            className="premium-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            Discover the <span className="text-glow">Magnevents</span> Edge
          </motion.h2>
        </div>

        <div className="premium-grid">
          {PREMIUM_CARDS.map((card, idx) => (
            <motion.div
              key={card.id}
              className="premium-card-wrap"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                href={card.path}
                className="premium-card"
                onClick={(e) => {
                  if (card.path === '/contact') {
                    e.preventDefault();
                    window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking' } }));
                  }
                }}
              >
                <div className="card-glow" style={{ backgroundColor: card.color }} />
                <div className="card-inner">
                  <span className="card-icon">{card.icon}</span>
                  <div className="card-content">
                    <h3>{card.title}</h3>
                    <p className="card-subtitle">{card.subtitle}</p>
                    <p className="card-desc">{card.desc}</p>
                  </div>
                  <div className="card-action">
                    <span>Learn More</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"></line>
                      <polyline points="12 5 19 12 12 19"></polyline>
                    </svg>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
