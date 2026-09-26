"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { bookingService } from '@/app/services/bookingService'
import { getSilentLocationIfGranted } from '@/app/utils/geolocation'
import '@/app/styles/components/ContactModal.css'

const AI_VIBES = [
  { id: 'sufi', icon: '🍷', label: 'Sufi & Ghazal', sample: 'Looking for a soulful Sufi & Ghazal live band for an evening gathering with ~100 guests. 2 hours performance with sound setup included.' },
  { id: 'sangeet', icon: '💍', label: 'Wedding Sangeet', sample: 'Looking for a high-energy live singer and band for a Wedding Sangeet. Need Bollywood dance anthems and live dhol setup for 200+ guests.' },
  { id: 'acoustic', icon: '🎸', label: 'Acoustic Singer', sample: 'Looking for a versatile acoustic singer-guitarist for an intimate cocktail house party. English & Hindi unplugged classics for ~40 guests.' },
  { id: 'dj', icon: '⚡', label: 'High-Energy DJ', sample: 'Looking for a premier Bollywood & commercial club DJ with sound console and intelligent dance lighting for a 3-4 hour private celebration.' },
  { id: 'celebrity', icon: '🎤', label: 'Celebrity Singer', sample: 'Inquiring for a celebrity playback singer / renowned headline artist for a luxury wedding reception with full stage production.' }
]

export default function LeadCaptureModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [offerHeading, setOfferHeading] = useState('🔥 SPECIAL OFFER – UP TO 60% OFF')
  const [offerSubheading, setOfferSubheading] = useState('🎁 Flat 60% OFF with Code: FIRSTEVENT60')
  const [isOfferEnabled, setIsOfferEnabled] = useState(true)

  useEffect(() => {
    fetch('/api/settings/form-offer')
      .then(r => r.json())
      .then(data => {
        if (data) {
          if (data.isVisible === false) {
            setIsOfferEnabled(false);
          }
          if (data.textDesktop) {
            setOfferSubheading(data.textDesktop);
          }
          if (data.textMobile) {
            setOfferHeading(data.textMobile);
          }
        }
      })
      .catch(err => console.error('Failed to fetch discount', err));
  }, []);

  useEffect(() => {
    // Open on custom window event (e.g. from buttons on the site)
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

            <button className="lux-modal-close" onClick={onClose} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            <div className="lux-modal-header lead-header">
              <div className="ai-lead-pill-badge">
                <span className="sparkle-rot">✨</span>
                <span>AI-POWERED ARTIST MATCH</span>
                <span className="discount-pill-tag">FLAT 60% OFF</span>
              </div>
              <h3 className="lead-title ai-gradient-title">
                Find Your Perfect Artist
              </h3>
              <p className="lead-subtitle">
                Enter your details or use <strong style={{ color: '#FFE032' }}>Smart AI</strong> to draft your requirement. Receive instant quotes directly from verified artists.
              </p>
            </div>

            <InnerLeadForm 
              onClose={onClose} 
              offerHeading={offerHeading} 
              offerSubheading={offerSubheading} 
              isOfferEnabled={isOfferEnabled} 
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 0, seconds: 0 });

  useEffect(() => {
    const getNextMidnight = () => {
      const now = new Date();
      const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      return midnight.getTime();
    };

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = getNextMidnight() - now;

      if (difference > 0) {
        setTimeLeft({
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (num) => num.toString().padStart(2, '0');

  return (
    <div className="ai-timer-strip">
      <span className="ai-timer-label">Ends In:</span>
      <span className="elegant-time-block">{pad(timeLeft.hours)}</span>
      <span className="time-colon">:</span>
      <span className="elegant-time-block">{pad(timeLeft.minutes)}</span>
      <span className="time-colon">:</span>
      <span className="elegant-time-block">{pad(timeLeft.seconds)}</span>
    </div>
  );
}

function InnerLeadForm({ onClose, offerHeading, offerSubheading, isOfferEnabled }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({ name: '', phone: '', requirement: '' })
  const [activeVibe, setActiveVibe] = useState('')
  const [isAiDrafting, setIsAiDrafting] = useState(false)
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false)
  const [geoData, setGeoData] = useState({ latitude: null, longitude: null, detectedLocation: '' })
  const textareaRef = useRef(null)

  useEffect(() => {
    getSilentLocationIfGranted().then(geo => {
      if (geo && geo.success) {
        setGeoData({ latitude: geo.latitude, longitude: geo.longitude, detectedLocation: geo.detectedLocation })
      }
    })
  }, [])

  // Clean phone digits for validation
  const rawDigits = (formData.phone || '').replace(/[^0-9]/g, '')
  const isPhoneValid = rawDigits.length >= 10

  const handleVibeClick = async (vibe) => {
    setActiveVibe(vibe.id)
    setIsAiDrafting(true)
    setFormError('')

    try {
      const city = geoData.detectedLocation || 'Delhi NCR'
      const res = await fetch('/api/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vibe: vibe.id, city, keywords: formData.requirement })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.text) {
          setFormData(prev => ({ ...prev, requirement: data.text }))
          setAiGeneratedSuccess(true)
          setTimeout(() => setAiGeneratedSuccess(false), 3500)
        } else {
          setFormData(prev => ({ ...prev, requirement: vibe.sample }))
        }
      } else {
        setFormData(prev => ({ ...prev, requirement: vibe.sample }))
      }
    } catch {
      setFormData(prev => ({ ...prev, requirement: vibe.sample }))
    } finally {
      setIsAiDrafting(false)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleAiAutoDraft = async () => {
    setIsAiDrafting(true)
    setFormError('')

    try {
      const city = geoData.detectedLocation || 'Delhi NCR'
      const res = await fetch('/api/ai-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          vibe: activeVibe || 'live artist', 
          city, 
          keywords: formData.requirement 
        })
      })

      if (res.ok) {
        const data = await res.json()
        if (data.text) {
          setFormData(prev => ({ ...prev, requirement: data.text }))
          setAiGeneratedSuccess(true)
          setTimeout(() => setAiGeneratedSuccess(false), 3500)
        }
      }
    } catch (err) {
      console.warn("AI draft fetch failed:", err)
      if (!formData.requirement) {
        setFormData(prev => ({ 
          ...prev, 
          requirement: 'Looking for a verified live singer / band for an upcoming event in Delhi NCR with sound setup included.' 
        }))
      }
    } finally {
      setIsAiDrafting(false)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }

  const handleSubmit = async (e) => {
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

    setIsSubmitting(true)

    let deviceType = 'D';
    if (typeof window !== 'undefined') {
      if (window.innerWidth <= 768) deviceType = 'M';
      else if (window.innerWidth <= 1024) deviceType = 'T';
    }

    const selectedVibeObj = AI_VIBES.find(v => v.id === activeVibe)
    const eventTypeTag = selectedVibeObj ? `${selectedVibeObj.label} Booking` : 'AI Live Artist Booking'

    try {
      await bookingService.submitRequest({ 
        name: trimmedName,
        phone: cleanPhone,
        message: formData.requirement || 'Requested quote via AI Search Quick Inquiry Modal',
        eventType: eventTypeTag,
        deviceType: deviceType,
        formName: 'Lead Capture Popup',
        formType: 'offer',
        formLink: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}${window.location.search || ''}#offers` : '',
        keywords: selectedVibeObj ? selectedVibeObj.label : formData.requirement,
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
        referrer: typeof document !== 'undefined' ? (document.referrer || 'Direct') : '',
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        detectedLocation: geoData.detectedLocation
      })

      if (typeof window !== 'undefined') {
        localStorage.setItem('magnevents-form-filled', 'true');
        window.dispatchEvent(new Event('form-filled'));
        if (typeof window.gtag === 'function') {
          window.gtag('event', 'conversion', {
            'send_to': 'AW-16657289873/9sBzCMry1eocEJGl6IY-',
            'value': 1.0,
            'currency': 'INR'
          });
        }
      }

      setSubmitted(true)
      setTimeout(() => {
        onClose()
      }, 2800)
    } catch (error) {
      console.error("Booking error:", error)
      setFormError('Unable to submit inquiry. Please check your connection and try again.')
    } finally {
      setIsSubmitting(false)
    }
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
        <h4 style={{ color: '#ffffff', fontSize: '26px', fontWeight: 800, marginBottom: '8px' }}>
          Inquiry Received & AI Search Matched!
        </h4>
        <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: 1.5, maxWidth: '440px', margin: '0 auto 16px' }}>
          We have saved your details into our verified database. Our specialists and artists in your city are reviewing your brief.
        </p>
        <div className="ai-success-code-tag">
          <span>🎁 Flat 60% OFF Applied</span>
          <strong>Code: FIRSTEVENT60</strong>
        </div>
        <p style={{ color: '#64748b', fontSize: '13px', marginTop: '16px' }}>
          You will receive direct WhatsApp quotes shortly. Closing window...
        </p>
      </motion.div>
    )
  }

  return (
    <form className="lux-modal-form ai-styled-lead-form" onSubmit={handleSubmit}>
      {isOfferEnabled && (
        <div className="lux-form-group full-width elegant-promo-box ai-promo-glow">
          <div className="ai-promo-left">
            <div className="ai-gift-3d-box">
              <span>🎁</span>
            </div>
            <div className="ai-promo-text-wrap">
              <span className="rakhi-highlight">
                {offerHeading || '🔥 SPECIAL OFFER – UP TO 60% OFF'}
              </span>
              <span className="ai-promo-sub">
                {offerSubheading ? offerSubheading : 'Flat 60% OFF with Code: FIRSTEVENT60'}
              </span>
            </div>
          </div>
          
          <div className="ai-promo-timer-wrap">
            <CountdownTimer />
          </div>
        </div>
      )}

      {/* Name Input */}
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
      
      {/* Phone Input with validation badge */}
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

      {/* Requirement Input with AI Auto-Draft & Vibe Chips */}
      <div className="lux-form-group full-width">
        <div className="ai-label-split" style={{ marginBottom: '8px' }}>
          <label htmlFor="lead-req" className="ai-field-label">
            <span>What are you looking for?</span>
          </label>
          <button 
            type="button" 
            onClick={handleAiAutoDraft} 
            disabled={isAiDrafting}
            className="ai-quick-draft-btn"
            title="Auto-draft a professional artist requirement with AI"
          >
            <span className="ai-sparkle-spin">✨</span>
            <span>{isAiDrafting ? 'Crafting with AI...' : 'Auto-Draft with AI'}</span>
          </button>
        </div>

        {/* 1-Click AI Vibe Chips */}
        <div className="ai-vibe-chips-bar">
          <span className="ai-chips-caption">Quick AI Vibes:</span>
          <div className="ai-chips-scroll">
            {AI_VIBES.map(vibe => (
              <button
                key={vibe.id}
                type="button"
                className={`ai-vibe-pill ${activeVibe === vibe.id ? 'active' : ''}`}
                onClick={() => handleVibeClick(vibe)}
                disabled={isAiDrafting}
              >
                <span className="vibe-emoji">{vibe.icon}</span>
                <span className="vibe-text">{vibe.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="ai-textarea-wrapper">
          <textarea 
            ref={textareaRef}
            id="lead-req" 
            rows="3"
            placeholder="E.g. A soulful sufi live band for wedding reception in Delhi on 15th Nov with sound setup..." 
            value={formData.requirement} 
            onChange={(e) => setFormData({ ...formData, requirement: e.target.value })} 
            className="ai-lux-textarea"
          />
          {aiGeneratedSuccess && (
            <div className="ai-chip-generated-notice">
              <span>✨ Refined by AI Search</span>
            </div>
          )}
        </div>
      </div>

      {formError && (
        <div className="ai-form-error-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <span>{formError}</span>
        </div>
      )}

      {/* Submit Button */}
      <div className="lux-modal-footer" style={{ marginTop: '16px' }}>
        <button 
          type="submit" 
          className="btn-submit-premium ai-submit-pulse" 
          disabled={isSubmitting} 
          style={{ width: '100%' }}
        >
          <span className="btn-text">
            {isSubmitting ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span className="ai-spinner-dot" /> Saving &amp; Matching...
              </span>
            ) : (
              '⚡ GET FREE ARTIST QUOTES (FLAT 60% OFF)'
            )}
          </span>
          <div className="btn-glow" />
        </button>
      </div>

      {/* ── AI Search Alternative ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        margin: '16px 0 4px',
      }}>
        <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>OR</span>
        <span style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.08)' }} />
      </div>

      <Link
        href="/ai-search"
        onClick={onClose}
        style={{ textDecoration: 'none', display: 'block' }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          padding: '13px 20px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(236,72,153,0.12) 100%)',
          border: '1px solid rgba(139,92,246,0.35)',
          cursor: 'pointer',
          transition: 'all 0.22s ease',
          marginBottom: '4px',
        }}
          className="ai-search-alt-btn"
        >
          <span style={{ fontSize: '20px', lineHeight: 1 }}>✨</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
              Search Artists with AI
            </div>
            <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.50)', marginTop: '1px' }}>
              Describe your event — AI matches in seconds
            </div>
          </div>
          <span style={{
            marginLeft: 'auto',
            fontSize: '11px',
            fontWeight: 800,
            color: '#c084fc',
            background: 'rgba(139,92,246,0.18)',
            border: '1px solid rgba(139,92,246,0.3)',
            padding: '3px 9px',
            borderRadius: '20px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.04em',
          }}>TRY FREE →</span>
        </div>
      </Link>

      {/* Trust Guarantee Badges */}
      <div className="ai-trust-guarantee-bar">
        <div className="ai-trust-item">
          <span className="trust-icon">🛡️</span>
          <span>100% Artist Arrival Guarantee</span>
        </div>
        <div className="ai-trust-item">
          <span className="trust-icon">💎</span>
          <span>Direct Artist Rates (0% Markup)</span>
        </div>
        <div className="ai-trust-item">
          <span className="trust-icon">🔒</span>
          <span>100% Privacy Protected</span>
        </div>
      </div>
    </form>
  )
}
