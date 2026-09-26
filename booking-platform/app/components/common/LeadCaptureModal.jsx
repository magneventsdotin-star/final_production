"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingService } from '@/app/services/bookingService'
import { getSilentLocationIfGranted } from '@/app/utils/geolocation'
import { AIIcon } from '@/app/components/icons/NavigationIcons'
import '@/app/styles/components/ContactModal.css'

export default function LeadCaptureModal() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const handleOpenModal = () => setIsOpen(true);
    window.addEventListener('open-lead-capture', handleOpenModal);

    if (typeof window !== 'undefined') {
      if (window.location.hash === '#offers' || window.location.hash === '#lead-capture' || window.location.search.includes('open=offers')) {
        setIsOpen(true);
      }
    }

    const hasSeenModal = sessionStorage.getItem('magnevents_lead_captured')
    
    if (!hasSeenModal) {
      sessionStorage.setItem('magnevents_lead_captured', 'true')
      const timer = setTimeout(() => {
        setIsOpen(true)
      }, 3200)
      return () => {
        clearTimeout(timer)
        window.removeEventListener('open-lead-capture', handleOpenModal);
      }
    }

    return () => window.removeEventListener('open-lead-capture', handleOpenModal);
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('modal-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])

  const onClose = () => {
    setIsOpen(false)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="lead-modal" className="lux-modal-root" style={{ zIndex: 100000 }}>
          <motion.div
            className="lux-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="lux-modal-content booking ai-lead-modal-card"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
          >
            <div className="modal-glow-bg" />
            <div className="ai-modal-top-accent-line" />

            <div className="lux-modal-top-actions">
              <button
                type="button"
                className="lux-modal-ai-btn"
                onClick={() => {
                  onClose();
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
                  }
                }}
                title="Chat with AI Assistant"
                aria-label="Chat with AI Assistant"
              >
                <span className="lux-modal-ai-sparkle">
                  <AIIcon size={14} />
                </span>
                <span className="lux-modal-ai-text">AI Chat</span>
                <span className="lux-modal-ai-dot" />
              </button>
              <button className="lux-modal-close" onClick={onClose} aria-label="Close modal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="lux-modal-header lead-header">
              <div className="ai-lead-pill-badge">
                <span className="sparkle-rot">✨</span>
                <span>AI ARTIST MATCHING</span>
              </div>
              <h3 className="lead-title ai-gradient-title">
                Find Your Perfect Artist
              </h3>
              <p className="lead-subtitle">
                Receive instant transparent quotes directly from verified live artists.
              </p>
            </div>

            <InnerLeadForm onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function InnerLeadForm({ onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '', requirement: '' })
  const [geoData, setGeoData] = useState({ latitude: null, longitude: null, detectedLocation: '' })

  useEffect(() => {
    getSilentLocationIfGranted().then(geo => {
      if (geo && geo.success) {
        setGeoData({ latitude: geo.latitude, longitude: geo.longitude, detectedLocation: geo.detectedLocation })
      }
    })
  }, [])

  const rawDigits = (formData.phone || '').replace(/[^0-9]/g, '')
  const isPhoneValid = rawDigits.length >= 10

  const handleOpenAiAssistant = () => {
    onClose();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-ai-chatbot'));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')
    
    const trimmedName = formData.name.trim()
    if (!trimmedName || trimmedName.length < 2) {
      setFormError('Please enter your full name.')
      return
    }

    const cleanPhone = (formData.phone || '').replace(/[^0-9+]/g, '')
    const digitsOnly = cleanPhone.replace(/[^0-9]/g, '')
    if (digitsOnly.length < 10) {
      setFormError('Please enter a valid 10-digit mobile number so artists can send quotes.')
      return
    }

    let deviceType = 'D';
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 768) deviceType = 'M';
      else if (window.innerWidth <= 1024) deviceType = 'T';
    }

    // Instantly track conversion and mark form filled
    if (typeof window !== 'undefined') {
      localStorage.setItem('magnevents-form-filled', 'true');
      window.dispatchEvent(new Event('form-filled'));
      if (typeof window.gtag === 'function') {
        window.gtag('event', 'generate_lead', { event_category: 'form', event_label: 'lead_capture_modal_submit' });
        window.gtag('event', 'conversion', {
          'send_to': 'AW-16657289873/9sBzCMry1eocEJGl6IY-',
          'value': 1.0,
          'currency': 'INR'
        });
      }
    }

    // Instant optimistic transition - zero user waiting time
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 2400);

    // Fire background request asynchronously
    bookingService.submitRequest({ 
      name: trimmedName,
      phone: cleanPhone,
      message: formData.requirement || 'Requested quote via Quick Inquiry Modal',
      eventType: 'Live Artist Booking',
      deviceType: deviceType,
      formName: 'Lead Capture Modal',
      formType: 'inquiry',
      formLink: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}${window.location.search || ''}#inquiry` : '',
      keywords: formData.requirement,
      pageUrl: typeof window !== 'undefined' ? window.location.href : '',
      pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
      referrer: typeof document !== 'undefined' ? (document.referrer || 'Direct') : '',
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      detectedLocation: geoData.detectedLocation
    }).catch((error) => {
      console.error("Background booking error:", error);
    });
  }

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }} 
        className="lux-modal-success ai-success-screen"
        style={{ padding: '36px 20px', textAlign: 'center' }}
      >
        <div className="lux-success-ring ai-success-ring" style={{ margin: '0 auto 20px' }}>
          <div className="lux-success-check">✓</div>
        </div>
        <h4 style={{ color: '#ffffff', fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>
          Inquiry Received!
        </h4>
        <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.5, maxWidth: '400px', margin: '0 auto 16px' }}>
          Our event specialists in your city are reviewing your request and will contact you with transparent quotes.
        </p>
      </motion.div>
    )
  }

  return (
    <form className="lux-modal-form ai-styled-lead-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      
      {/* Interactive Magnetic AI Chatbot Trigger Card */}
      <div 
        className="ai-chatbot-magnetic-card" 
        onClick={handleOpenAiAssistant} 
        role="button" 
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenAiAssistant(); }}
        aria-label="Open Magnevents AI Concierge Chatbot"
        style={{ marginBottom: '2px' }}
      >
        <div className="ai-chatbot-magnetic-glow" aria-hidden="true" />
        <div className="ai-chatbot-magnetic-left">
          <div className="ai-chatbot-magnetic-avatar">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="ai-avatar-sparkle">
              <path d="M12 3C12 7.5 7.5 12 3 12C7.5 12 12 16.5 12 21C12 16.5 16.5 12 21 12C16.5 12 12 7.5 12 3Z" fill="none" stroke="#ffffff" strokeWidth="2.5" />
              <path d="M19 3C19 4.8 17.5 6 16 6C17.5 6 19 7.2 19 9C19 7.2 20.5 6 22 6C20.5 6 19 4.8 19 3Z" fill="#ffffff" stroke="none" />
            </svg>
            <span className="ai-avatar-dot" />
          </div>
          <div className="ai-chatbot-magnetic-info">
            <div className="ai-chatbot-badge-row">
              <span className="ai-chatbot-tag">✨ MAGNEVENTS AI SEARCH</span>
              <span className="ai-chatbot-live-status">● ONLINE</span>
            </div>
            <h4 className="ai-chatbot-magnetic-title">Prefer to chat with AI?</h4>
            <p className="ai-chatbot-magnetic-sub">Instant personalized artist recommendations</p>
          </div>
        </div>
        <div className="ai-chatbot-magnetic-cta">
          <span className="ai-cta-text">Start Chat</span>
          <span className="ai-cta-arrow">➔</span>
        </div>
      </div>

      {/* Full Name */}
      <div className="lux-form-group full-width">
        <label htmlFor="lead-name" className="ai-field-label">
          <span>Full Name</span>
          <span className="ai-required-star">*</span>
        </label>
        <div className="ai-input-with-icon">
          <span className="ai-field-icon">👤</span>
          <input 
            id="lead-name" 
            type="text" 
            required 
            placeholder="e.g. Arjun Sharma" 
            value={formData.name} 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
            className="ai-lux-input"
          />
        </div>
      </div>
      
      {/* Phone Number */}
      <div className="lux-form-group full-width">
        <div className="ai-label-split">
          <label htmlFor="lead-phone" className="ai-field-label">
            <span>Phone Number (For Instant Quotes)</span>
            <span className="ai-required-star">*</span>
          </label>
          {rawDigits.length > 0 && (
            <span className={`ai-phone-counter ${isPhoneValid ? 'valid' : 'invalid'}`}>
              {isPhoneValid ? '✓ 10 Digits' : `${rawDigits.length}/10 digits`}
            </span>
          )}
        </div>
        <div className="ai-input-with-icon phone-field-wrap">
          <div className="ai-phone-prefix">
            <span className="flag">🇮🇳</span>
            <span className="code">+91</span>
          </div>
          <input 
            id="lead-phone" 
            type="tel" 
            required 
            placeholder="98765 43210" 
            value={formData.phone} 
            onChange={(e) => {
              const val = e.target.value.replace(/[^0-9+ ]/g, '')
              setFormData({ ...formData, phone: val })
            }} 
            className="ai-lux-input with-prefix"
          />
        </div>
      </div>

      {/* Requirement / Note */}
      <div className="lux-form-group full-width">
        <label htmlFor="lead-req" className="ai-field-label">
          <span>Event Details / Requirement</span>
        </label>
        <div className="ai-textarea-wrapper">
          <span className="ai-field-icon" style={{ top: '20px' }}>🎤</span>
          <textarea 
            id="lead-req" 
            rows="2"
            placeholder="e.g. Singer/Band for wedding reception in Delhi on 20th Dec..." 
            value={formData.requirement} 
            onChange={(e) => setFormData({ ...formData, requirement: e.target.value })} 
            className="ai-lux-textarea"
            style={{ minHeight: '60px', paddingLeft: '44px' }}
          />
        </div>
      </div>

      {formError && (
        <div className="ai-form-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="16"></line></svg>
          <span>{formError}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="lux-modal-footer" style={{ marginTop: '8px' }}>
        <button 
          type="submit" 
          className="btn-submit-premium ai-submit-pulse" 
          disabled={isSubmitting} 
          style={{ width: '100%' }}
        >
          <span className="btn-text">
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="ai-spinner-dot" /> Submitting...
              </span>
            ) : (
              '⚡ Request Free Quotes'
            )}
          </span>
          <div className="btn-glow" />
        </button>
      </div>

      {/* Trust Guarantee Badges */}
      <div className="ai-trust-guarantee-bar" style={{ marginTop: '10px', paddingTop: '10px' }}>
        <div className="ai-trust-item">
          <span className="trust-icon">🛡️</span>
          <span>100% Artist Arrival Guarantee</span>
        </div>
        <div className="ai-trust-item">
          <span className="trust-icon">💎</span>
          <span>Direct Rates (0% Markup)</span>
        </div>
        <div className="ai-trust-item">
          <span className="trust-icon">🔒</span>
          <span>Privacy Protected</span>
        </div>
      </div>
    </form>
  )
}
