"use client"

import { motion } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import FeatureCard from '@/app/components/common/FeatureCard'
import { WHY_CHOOSE_FEATURES } from '@/app/constants'
import '@/app/styles/pages/WhyChoose.css'

export default function WhyChoosePage() {
  return (
    <main className="lux-page why-choose-page">
      <div className="lux-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="why-choose-header"
        >
          <h1>💎 Why Choose <span className="text-gradient">Magnevents?</span></h1>
        </motion.div>

        <div className="why-choose-grid">
          {WHY_CHOOSE_FEATURES.map((feature, idx) => (
            <FeatureCard
              key={idx}
              icon={feature.icon}
              title={feature.title}
              desc={feature.desc}
              accent={feature.accent}
              index={idx}
            />
          ))}
        </div>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="why-cta-section"
        >
          <h2>Ready to find your perfect artist?</h2>
          <button className="matrix-btn">Explore Categories</button>
        </motion.section>
      </div>
    </main>
  )
}
