"use client"

import { motion } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import PricingCard from '@/app/components/pricing/PricingCard'
import FaqSection from '@/app/components/home/FaqSection'
import { PRICING_PLANS } from '@/app/constants'
import '@/app/styles/pages/PricingPage.css'

/**
 * PricingPage Component
 * 
 * Displays available artist booking packages.
 * Refactored into modular components and centralized data.
 */
export default function PricingPage() {
  return (
    <main className="pricing-pg">
      <div className="pricing-shell">
        <header className="pricing-header">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="pricing-title"
          >
            Book Top Singers <br />
            <span className="accent-text">Starting At Just ...</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="pricing-subtitle"
          >
            Select the perfect ensemble to elevate your event. From intimate whispers to <br />
            grand stadium energy
          </motion.p>
        </header>

        <div className="pricing-grid">
          {PRICING_PLANS.map((plan, i) => (
            <PricingCard 
              key={plan.name} 
              plan={plan} 
              index={i} 
            />
          ))}
        </div>

        <FaqSection 
          eyebrow="💡 Common Questions" 
          title="Everything you need to know" 
          titleGradient={true}
        />
      </div>
    </main>
  )
}
