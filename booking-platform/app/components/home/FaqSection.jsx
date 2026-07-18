"use client";

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import { FAQS } from '@/app/constants'
import '@/app/styles/pages/HomePage.css'

export default function FaqSection({
  eyebrow = "🤔 Common Questions",
  title = "Frequently Asked Questions",
  titleGradient = false
}) {
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <FadeSection className="hp-shell hp-block hp-faqs">
      <div className="hp-section-head">
        <h2 className={titleGradient ? 'text-gradient' : ''}>{title}</h2>
      </div>
      <div className="hp-faq-list">
        {FAQS.map((item, index) => {
          const active = openFaq === index
          return (
            <motion.div
              key={item.q}
              className={`hp-faq-item ${active ? 'is-open' : ''}`}
              layout
            >
              <button type="button" onClick={() => setOpenFaq(active ? -1 : index)}>
                <span>{item.q}</span>
                <motion.strong
                  animate={{ rotate: active ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  +
                </motion.strong>
              </button>
              <AnimatePresence initial={false}>
                {active && (
                  <motion.p
                    key="answer"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: 'easeInOut' }}
                  >
                    {item.a}
                  </motion.p>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </FadeSection>
  )
}
