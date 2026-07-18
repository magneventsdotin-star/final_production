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

  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const emailRef = useRef(null)
  const categoryRef = useRef(null)
  const portfolioRef = useRef(null)
  const bioRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    const submissionData = {
      name: nameRef.current?.value || '',
      phone: phoneRef.current?.value || '',
      email: emailRef.current?.value || '',
      category: categoryRef.current?.value || '',
      portfolio: portfolioRef.current?.value || '',
      bio: bioRef.current?.value || ''
    }

    const nameErr = validateName(submissionData.name);
    if (nameErr) return alert(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return alert(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return alert(phoneErr);

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
                <div className="lux-form-grid">
                  <div className="lux-form-group">
                    <label>FULL NAME</label>
                    <input
                      ref={nameRef}
                      type="text" required placeholder="e.g. Rahul Verma"
                      defaultValue=""
                    />
                  </div>
                  <div className="lux-form-group">
                    <label>PHONE NUMBER</label>
                    <input
                      ref={phoneRef}
                      type="tel" required placeholder="+91 9XXX-XXXXXX"
                      defaultValue=""
                    />
                  </div>
                </div>

                <div className="lux-form-group">
                  <label>EMAIL ADDRESS</label>
                  <input
                    ref={emailRef}
                    type="email" required placeholder="name@email.in"
                    defaultValue=""
                  />
                </div>

                <div className="lux-form-grid">
                  <div className="lux-form-group">
                    <label>ARTIST CATEGORY</label>
                    <select
                      ref={categoryRef}
                      required
                      defaultValue=""
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
                      ref={portfolioRef}
                      type="url" required placeholder="Instagram, YouTube or Website"
                      defaultValue=""
                    />
                  </div>
                </div>

                <div className="lux-form-group">
                  <label>BIO & EXPERIENCE</label>
                  <textarea
                    ref={bioRef}
                    rows="4" required
                    placeholder="Briefly describe your performances, experience, and what makes you unique..."
                    defaultValue=""
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
