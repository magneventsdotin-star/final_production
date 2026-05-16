"use client";

import { motion } from 'framer-motion'

export default function ReservationCard({ title, desc, actionLabel, onAction, isExternal, href, direction }) {
  const content = (
    <>
      <h3>{title}</h3>
      <p>{desc}</p>
      {isExternal ? (
        <a href={href} className="book-outline-btn">
          {actionLabel}
        </a>
      ) : (
        <button className="book-main-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </>
  )

  return (
    <motion.div 
      initial={{ opacity: 0, x: direction === 'left' ? -40 : 40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="book-card"
    >
      {content}
    </motion.div>
  )
}
