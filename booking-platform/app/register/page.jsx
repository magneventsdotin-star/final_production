"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper'
import { bookingService } from '@/app/services/bookingService'
import '@/app/styles/components/ContactModal.css'
import '@/app/styles/pages/Register.css'

import { validateName, validateEmail, validatePhone } from '@helpers/validation';

export default function RegisterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    portfolio: '',
    bio: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const submissionData = { ...formData }

    const nameErr = validateName(submissionData.name);
    if (nameErr) return setFormError(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return setFormError(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return setFormError(phoneErr);

    setIsSubmitting(true)
    try {
      await bookingService.submitRequest({ ...submissionData, type: 'artist_registration' })
      
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', {
          event_category: 'form',
          event_label: 'artist_registration_submit'
        });
      }

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
                {formError && (
                  <div style={{ color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(255, 77, 79, 0.2)' }} role="alert">
                    {formError}
                  </div>
                )}
                <div className="lux-form-grid">
                  <div className="lux-form-group">
                    <label htmlFor="reg-name">FULL NAME</label>
                    <input
                      id="reg-name"
                      name="name"
                      type="text" required placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                    />
                  </div>
                  <div className="lux-form-group">
                    <label htmlFor="reg-phone">PHONE NUMBER</label>
                    <input
                      id="reg-phone"
                      name="phone"
                      type="tel" required placeholder="+91 9XXX-XXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                    />
                  </div>
                </div>

                <div className="lux-form-group">
                  <label htmlFor="reg-email">EMAIL ADDRESS</label>
                  <input
                    id="reg-email"
                    name="email"
                    type="email" required placeholder="name@email.in"
                    value={formData.email}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>

                <div className="lux-form-grid">
                  <div className="lux-form-group">
                    <label htmlFor="reg-category">ARTIST CATEGORY</label>
                    <select
                      id="reg-category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="" disabled>Select Type</option>
                      <option value="singer">Solo Singer</option>
                      <option value="band">Music Band</option>
                      <option value="dj">DJ / Percussionist</option>
                      <option value="instrumental">Instrumentalist</option>
                      <option value="comedian">Standup Comedian</option>
                      <option value="emcee">Anchor / Emcee</option>
                    </select>
                  </div>
                  <div className="lux-form-group">
                    <label htmlFor="reg-portfolio">PORTFOLIO / SOCIAL LINK</label>
                    <input
                      id="reg-portfolio"
                      name="portfolio"
                      type="url" required placeholder="Instagram, YouTube or Website"
                      value={formData.portfolio}
                      onChange={handleChange}
                      autoComplete="url"
                    />
                  </div>
                </div>

                <div className="lux-form-group">
                  <label htmlFor="reg-bio">BIO & EXPERIENCE</label>
                  <textarea
                    id="reg-bio"
                    name="bio"
                    rows="4" required
                    placeholder="Briefly describe your performances, experience, and what makes you unique..."
                    value={formData.bio}
                    onChange={handleChange}
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
