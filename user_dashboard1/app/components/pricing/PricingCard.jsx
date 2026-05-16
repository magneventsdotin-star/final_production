"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

/**
 * PricingCard Component
 * 
 * Displays a single pricing tier with features and a call to action.
 */
export default function PricingCard({ plan, index }) {
  return (
    <motion.div 
      className={`pricing-card ${plan.popular ? 'is-popular' : ''}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 * index, duration: 0.6 }}
    >
      {plan.popular && <div className="popular-badge">MOST POPULAR</div>}
      
      <div className="card-head">
        <h3>{plan.name}</h3>
        <p className="plan-tagline">{plan.tagline}</p>
      </div>
      
      <div className="card-price">
        <span className="price-val">{plan.price}</span>
        <span className="price-label">starts from</span>
      </div>

      <ul className="card-features">
        {plan.features.map(f => (
          <li key={f}>
            <span className="check-icon">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))} className={`card-btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}>
        Book now
      </button>
    </motion.div>
  )
}
