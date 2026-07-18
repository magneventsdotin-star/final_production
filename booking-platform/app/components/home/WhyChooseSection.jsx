"use client";

import { motion } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import { WHY_POINTS } from '@/app/constants'

export default function WhyChooseSection() {
  return (
    <FadeSection className="hp-shell hp-block">
      <div className="hp-section-head">
        <h2>💎 Why Choose Magnevents?</h2>
      </div>
      <div className="hp-why-grid">
        {WHY_POINTS.map((item, i) => (
          <motion.article
            key={item.title}
            className="hp-why-card"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            whileHover={{ y: -6 }}
          >
            <span className="hp-why-icon">{item.icon}</span>
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </motion.article>
        ))}
      </div>
    </FadeSection>
  )
}
