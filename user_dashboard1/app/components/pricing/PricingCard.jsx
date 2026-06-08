"use client"
import { motion } from 'framer-motion'
import Link from 'next/link'

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

      <div className="card-price-container" style={{ margin: '10px 0 20px 0', padding: '16px 16px 16px 20px', background: 'linear-gradient(145deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: plan.popular ? '#FFE032' : '#D65050' }} />
        

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '10px', color: plan.popular ? '#FFE032' : '#D65050', textTransform: 'uppercase', letterSpacing: '0.2em', fontWeight: '900', background: plan.popular ? 'rgba(255, 224, 50, 0.1)' : 'rgba(214, 80, 80, 0.1)', padding: '4px 10px', borderRadius: '100px' }}>Magnevents Exclusive</span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
          <span style={{ 
            fontSize: '36px', 
            fontWeight: '900', 
            color: '#fbbf24', 
            letterSpacing: '-0.02em', 
            lineHeight: '1',
            textShadow: '0 2px 10px rgba(251, 191, 36, 0.2)'
          }}>
            {plan.price}
          </span>
          <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Starts From</span>
        </div>
        </div>
      </div>

      <ul className="card-features">
        {plan.features.map(f => (
          <li key={f}>
            <span className="check-icon">✓</span>
            {f}
          </li>
        ))}
      </ul>

      <button 
        onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { 
          detail: { 
            type: 'booking', 
            pricingPlan: {
              name: plan.name,
              price: plan.price,
              tagline: plan.tagline,
              features: plan.features
            } 
          } 
        }))} 
        className={`card-btn ${plan.popular ? 'btn-primary' : 'btn-outline'}`}
      >
        Book now
      </button>
    </motion.div>
  )
}
