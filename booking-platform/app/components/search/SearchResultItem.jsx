"use client"
import { motion } from 'framer-motion'

export default function SearchResultItem({ result, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="result-item fx-soft-card"
    >
      <div className="result-main">
        <h3>{result.name}</h3>
        <span className="result-type">{result.type}</span>
      </div>
      <div className="result-meta">
        <span className="result-price">{result.price}</span>
        <button className="result-view-btn">View Profile</button>
      </div>
    </motion.div>
  )
}
