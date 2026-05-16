"use client"

import { motion } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import { BOOKING_STEPS } from '@/app/constants'
import '@/app/styles/pages/HomePage.css' 
import '@/app/styles/pages/HowToBook.css'

/**
 * HowToBookPage Component
 * 
 * Explains the artist booking process using the orthogonal flow layout.
 */
export default function HowToBookPage() {
  return (
    <main className="lux-page how-to-book-page">
      <div className="lux-container">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="how-header"
        >
          <span className="accent-tag">TIMELINE</span>
          <h1>How to Book <span className="text-gradient">a Musician</span></h1>
          <p>Your Live Music in 4 Easy Steps</p>
        </motion.div>

        <div className="hp-how-section">
          <div className="hp-orthogonal-flow">
            {BOOKING_STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                className={`hp-flow-step step-${i + 1}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
              >
                <motion.div className="hp-step-card fx-soft-card">
                  <div className="hp-step-header">
                    <span className="hp-step-num">{step.num}</span>
                    <span className="hp-step-icon">{step.icon}</span>
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}

