"use client";

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', city: '', type: '', details: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  function handle(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  function submit(e) {
    e.preventDefault()
    setLoading(true)
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'form',
        event_label: 'home_contact_submit'
      });
    }
    setTimeout(() => { setLoading(false); setSent(true) }, 1200)
  }

  if (sent) {
    return (
      <motion.div
        className="hp-form-success"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 240 }}
      >
        <span className="hp-form-success-icon">🎉</span>
        <h3>Inquiry Sent!</h3>
        <p>Our team will reach out within 2 hours with curated artist options for your event.</p>
        <button onClick={() => setSent(false)} className="hp-btn hp-btn-ghost hp-btn-sm">Send Another</button>
      </motion.div>
    )
  }

  return (
    <motion.form
      className="hp-contact-form"
      onSubmit={submit}
      initial={{ opacity: 0, x: 24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="hp-form-row">
        <div className="hp-form-field">
          <label>Full Name *</label>
          <input type="text" name="name" value={form.name} onChange={handle} placeholder="Your full name" required />
        </div>
        <div className="hp-form-field">
          <label>Phone Number *</label>
          <input type="tel" name="phone" value={form.phone} onChange={handle} placeholder="+91 XXXXX XXXXX" required />
        </div>
      </div>

      <div className="hp-form-row">
        <div className="hp-form-field">
          <label>Email Address</label>
          <input type="email" name="email" value={form.email} onChange={handle} placeholder="your@email.com" />
        </div>
        <div className="hp-form-field">
          <label>Event City *</label>
          <input type="text" name="city" value={form.city} onChange={handle} placeholder="e.g. Delhi, Mumbai" required />
        </div>
      </div>

      <div className="hp-form-field">
        <label>Event Type *</label>
        <select name="type" value={form.type} onChange={handle} required>
          <option value="">Select event type</option>
          <option>Wedding</option>
          <option>Corporate Event</option>
          <option>House Party</option>
          <option>Birthday / Anniversary</option>
          <option>College Fest</option>
          <option>Other</option>
        </select>
      </div>

      <div className="hp-form-field">
        <label>Event Details</label>
        <textarea name="details" value={form.details} onChange={handle} rows={4} placeholder="Tell us about your event — date, guest count, vibe, any specific requests..." />
      </div>

      <motion.button
        type="submit"
        className="hp-btn hp-btn-primary hp-form-submit"
        disabled={loading}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading
          ? <span className="hp-spinner" />
          : <><span>Send Inquiry</span><span className="hp-btn-shine" aria-hidden="true" /></>}
      </motion.button>
    </motion.form>
  )
}
