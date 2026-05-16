"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingService } from '@/app/services/bookingService'
import '@/app/styles/components/ContactModal.css' // Reuse base modal styles

export default function RegisterModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    portfolio: '',
    bio: ''
  })

  useEffect(() => {
    const handleOpen = () => {
      setIsOpen(true)
      setSubmitted(false)
    }
    window.addEventListener('open-register-modal', handleOpen)
    return () => window.removeEventListener('open-register-modal', handleOpen)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await bookingService.submitRequest({ ...formData, type: 'artist_registration' })
      setIsSubmitting(false)
      setSubmitted(true)
    } catch (error) {
      console.error("Registration error:", error)
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="lux-modal-root">
          <div className="lux-modal-backdrop" onClick={() => setIsOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="lux-modal-content register"
          >
            <div className="modal-glow-bg" style={{ background: 'radial-gradient(ellipse at center, rgba(0, 212, 255, 0.08) 0%, transparent 70%)' }} />
            <button className="lux-modal-close" onClick={() => setIsOpen(false)} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>
            
            <div className="lux-modal-header">
              <p className="header-badge">JOIN THE ELITE</p>
              <h3 className="lux-modal-title">Artist Registration</h3>
              <p className="lux-modal-desc">Showcase your talent to the world. Join Magnevents and perform at premium venues.</p>
            </div>

            {submitted ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lux-modal-success"
              >
                <div className="lux-success-ring" style={{ borderColor: '#00d4ff' }}>
                   <div className="lux-success-check" style={{ color: '#00d4ff' }}>✓</div>
                </div>
                <h4>Application Received!</h4>
                <p>Thank you for joining Magnevents. Our artist relations team will review your portfolio and contact you within 48 hours.</p>
                <button onClick={() => setIsOpen(false)} className="btn-submit-premium" style={{ marginTop: '24px' }}>
                  <span className="btn-text">Close Window</span>
                </button>
              </motion.div>
            ) : (
              <form className="lux-modal-form" onSubmit={handleSubmit}>
                <div className="lux-form-row">
                  <div className="lux-form-group">
                    <label>FULL NAME</label>
                    <input 
                      type="text" required placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="lux-form-group">
                    <label>PHONE NUMBER</label>
                    <input 
                      type="tel" required placeholder="+91 9XXX-XXXXXX"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>

                <div className="lux-form-group">
                  <label>EMAIL ADDRESS</label>
                  <input 
                    type="email" required placeholder="name@email.in"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>

                <div className="lux-form-row">
                  <div className="lux-form-group">
                    <label>ARTIST CATEGORY</label>
                    <select 
                      required
                      value={formData.category}
                      onChange={e => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">Select Type</option>
                      <option value="singer">Solo Singer</option>
                      <option value="band">Music Band</option>
                      <option value="dj">DJ / Percussionist</option>
                      <option value="instrumental">Instrumentalist</option>
                      <option value="comedian">Standup Comedian</option>
                      <option value="emcee">Anchor / Emcee</option>
                    </select>
                  </div>
                  <div className="lux-form-group">
                    <label>PORTFOLIO / SOCIAL LINK</label>
                    <input 
                      type="url" required placeholder="Instagram, YouTube or Website"
                      value={formData.portfolio}
                      onChange={e => setFormData({...formData, portfolio: e.target.value})}
                    />
                  </div>
                </div>

                <div className="lux-form-group">
                  <label>BIO & EXPERIENCE</label>
                  <textarea 
                    rows="4" required 
                    placeholder="Briefly describe your performances, experience, and what makes you unique..."
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
                </div>

                <button type="submit" className="btn-submit-premium" disabled={isSubmitting}>
                  <span className="btn-text">{isSubmitting ? 'Processing...' : 'Register as Artist'}</span>
                  <div className="btn-glow" />
                </button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
