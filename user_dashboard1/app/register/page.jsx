"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import { bookingService } from '@/app/services/bookingService'
import '@/app/styles/components/ContactModal.css' // Reuse modal styles for consistency
import '@/app/styles/pages/Register.css'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: '',
    portfolio: '',
    bio: ''
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

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
    <main className="lux-page register-page">
      <div className="lux-container">
        <div className="register-card-container">
          {submitted ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="registration-success-box"
            >
              <div className="success-icon">✓</div>
              <h2>Application Received!</h2>
              <p>Thank you for joining Magnevents. Our artist relations team will review your portfolio and contact you within 48 hours.</p>
              <button onClick={() => window.location.href = '/'} className="return-home-btn">
                Return to Home
              </button>
            </motion.div>
          ) : (
            <div className="lux-modal-content register is-page">
              <div className="lux-modal-header">
                <span className="accent-tag">JOIN THE ELITE</span>
                <h2 className="lux-modal-title">Artist Registration</h2>
                <p className="lux-modal-desc">Showcase your talent to the world. Join Magnevents and perform at premium venues.</p>
              </div>

              <form className="lux-modal-form" onSubmit={handleSubmit}>
                <div className="lux-form-grid">
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

                <div className="lux-form-grid">
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
                  {isSubmitting ? 'Processing...' : 'Register as Artist'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
