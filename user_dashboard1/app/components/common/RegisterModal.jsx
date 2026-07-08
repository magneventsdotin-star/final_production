"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingService } from '@/app/services/bookingService'
import { validateName, validateEmail, validatePhone } from '@/app/utils/validation'
import '@/app/styles/components/ContactModal.css'

export default function RegisterModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('selection')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const emailRef = useRef(null)
  const categoryRef = useRef(null)
  const portfolioRef = useRef(null)
  const priceRef = useRef(null)
  const bioRef = useRef(null)

  const eventNameRef = useRef(null)
  const eventPhoneRef = useRef(null)
  const eventEmailRef = useRef(null)
  const eventTypeRef = useRef(null)
  const eventDateRef = useRef(null)
  const eventLocationRef = useRef(null)
  const eventBudgetRef = useRef(null)
  const [selectedArtistTypes, setSelectedArtistTypes] = useState([])

  const copyToClipboard = (path) => {
    const url = window.location.origin + path;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true)
      setSubmitted(false)
      setView(e?.detail?.view || 'selection')
      setSelectedArtistTypes([])
    }
    window.addEventListener('open-register-modal', handleOpen)
    return () => window.removeEventListener('open-register-modal', handleOpen)
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

  const handleArtistSubmit = async (e) => {
    e.preventDefault()
    const submissionData = {
      name: nameRef.current?.value || '',
      phone: phoneRef.current?.value || '',
      email: emailRef.current?.value || '',
      category: categoryRef.current?.value || '',
      portfolio: portfolioRef.current?.value || '',
      price: priceRef.current?.value || '',
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
      setIsSubmitting(false)
      setSubmitted(true)
    } catch (error) {
      console.error("Artist registration error:", error)
      setIsSubmitting(false)
    }
  }

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    const submissionData = {
      name: eventNameRef.current?.value || '',
      phone: eventPhoneRef.current?.value || '',
      email: eventEmailRef.current?.value || '',
      eventType: eventTypeRef.current?.value || '',
      date: eventDateRef.current?.value || '',
      location: eventLocationRef.current?.value || '',
      artistType: selectedArtistTypes,
      budget: eventBudgetRef.current?.value || '',
    }

    const nameErr = validateName(submissionData.name);
    if (nameErr) return alert(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return alert(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return alert(phoneErr);

    setIsSubmitting(true)
    try {
      await bookingService.submitRequest({ ...submissionData, formType: 'booking' })
      setIsSubmitting(false)
      setSubmitted(true)
    } catch (error) {
      console.error("Event registration error:", error)
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
            className={`lux-modal-content register ${view === 'selection' ? 'selection-view' : ''}`}
            style={{ position: 'relative' }}
          >
            <div className="modal-glow-bg" style={{ background: 'radial-gradient(ellipse at center, rgba(255, 224, 50, 0.06) 0%, transparent 70%)' }} />
            
            <button className="lux-modal-close" onClick={() => setIsOpen(false)} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            {view !== 'selection' && !submitted && (
              <button 
                onClick={() => setView('selection')} 
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                className="lux-modal-back-btn"
              >
                <span>← Back</span>
              </button>
            )}

            {view === 'selection' && (
              <>
                <div className="lux-modal-header" style={{ textAlign: 'center', marginBottom: '0px', paddingTop: '28px' }}>
                  <p className="header-badge" style={{ margin: '0 auto 8px' }}>GET STARTED</p>
                  <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '28px', fontWeight: '900', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
                    Choose Registration
                  </h3>
                  <p className="lux-modal-desc" style={{ maxWidth: '440px', margin: '0 auto', fontSize: '13px', lineHeight: '1.4' }}>
                    Book verified live singers, bands, or stage acts, or join our elite performers roster.
                  </p>
                </div>

                <div className="registration-options-grid">
                  <div 
                    className="registration-option-card card-event"
                    onClick={() => setView('event')}
                  >
                    <div className="option-glow glow-event" />
                    <div className="option-icon">🎉</div>
                    <h4>Register Event</h4>
                    <p>
                      Book verified live singers, bands, or DJs for weddings, private parties and corporate events.
                    </p>
                    <button className="option-cta-btn btn-event">
                      Book an Artist →
                    </button>
                  </div>

                  <div 
                    className="registration-option-card card-artist"
                    onClick={() => setView('artist')}
                  >
                    <div className="option-glow glow-artist" />
                    <div className="option-icon">🎤</div>
                    <h4>Artist Roster</h4>
                    <p>
                      Join our elite platform to showcase your talent and get booked at premium events.
                    </p>
                    <button className="option-cta-btn btn-artist">
                      Join Our Roster →
                    </button>
                  </div>
                </div>
              </>
            )}

            {submitted && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="lux-modal-success"
              >
                <div className="lux-success-ring" style={{ borderColor: view === 'artist' ? '#00d4ff' : '#FFE032' }}>
                   <div className="lux-success-check" style={{ color: view === 'artist' ? '#00d4ff' : '#FFE032' }}>✓</div>
                </div>
                <h4>{view === 'artist' ? 'Application Received!' : 'Booking Requested!'}</h4>
                <p>
                  {view === 'artist' 
                    ? 'Thank you for joining Magnevents. Our artist relations team will review your portfolio and contact you within 48 hours.'
                    : 'Your event details have been securely sent. A booking concierge will reach out to you within 24 hours.'}
                </p>
                <button onClick={() => setIsOpen(false)} className="btn-submit-premium" style={{ marginTop: '24px' }}>
                  <span className="btn-text">Close Window</span>
                </button>
              </motion.div>
            )}

            {view === 'artist' && !submitted && (
              <>
                <div className="lux-modal-header" style={{ marginBottom: '16px', position: 'relative', paddingTop: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p className="header-badge" style={{ background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', margin: 0 }}>JOIN THE ELITE</p>
                    <button 
                      onClick={() => copyToClipboard('/register/artist')}
                      style={{ background: 'transparent', border: '1px solid rgba(0, 212, 255, 0.3)', color: '#00d4ff', borderRadius: '12px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'; e.currentTarget.style.borderColor = '#00d4ff'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)'; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      Copy Link
                    </button>
                  </div>
                  <h3 className="lux-modal-title" style={{ marginTop: '12px' }}>Artist Registration</h3>
                  <p className="lux-modal-desc">Showcase your talent to the world. Join Magnevents and perform at premium venues.</p>
                </div>

                <form className="lux-modal-form" onSubmit={handleArtistSubmit}>
                  <div className="lux-form-row">
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

                  <div className="lux-form-row">
                    <div className="lux-form-group">
                      <label>ARTIST CATEGORY</label>
                      <select
                        ref={categoryRef}
                        required
                        defaultValue=""
                      >
                        <option value="">Select Type</option>
                        <option value="singer">Singer</option>
                        <option value="band">Music Band</option>
                        <option value="dj">DJ</option>
                        <option value="musician">Musician</option>
                        <option value="comedian">Comedian</option>
                        <option value="anchor">Anchor</option>
                        <option value="dancer">Dancer</option>
                        <option value="magician">Magician</option>
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
                    <label>PERFORMANCE PRICE (INR)</label>
                    <input
                      ref={priceRef}
                      type="text" required placeholder="e.g. 10000 - 20000"
                      defaultValue=""
                    />
                  </div>

                  <div className="lux-form-group">
                    <label>BIO & EXPERIENCE</label>
                    <textarea
                      ref={bioRef}
                      rows="3" required
                      placeholder="Briefly describe your performances, experience, and what makes you unique..."
                      defaultValue=""
                    />
                  </div>

                  <button type="submit" className="btn-submit-premium" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0072ff 100%)', boxShadow: '0 4px 15px rgba(0, 212, 255, 0.2)' }} disabled={isSubmitting}>
                    <span className="btn-text">{isSubmitting ? 'Processing...' : 'Register as Artist'}</span>
                  </button>
                </form>
              </>
            )}

            {view === 'event' && !submitted && (
              <>
                <div className="lux-modal-header" style={{ marginBottom: '16px', position: 'relative', paddingTop: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p className="header-badge" style={{ margin: 0 }}>DIRECT SUPPORT</p>
                    <button 
                      onClick={() => copyToClipboard('/register/event')}
                      style={{ background: 'transparent', border: '1px solid rgba(255, 224, 50, 0.3)', color: '#FFE032', borderRadius: '12px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 224, 50, 0.1)'; e.currentTarget.style.borderColor = '#FFE032'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 224, 50, 0.3)'; }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      Copy Link
                    </button>
                  </div>
                  <h3 className="lux-modal-title" style={{ marginTop: '12px' }}>Register Event</h3>
                  <p className="lux-modal-desc">Tell us your vision, and we will find the perfect stage presence for you.</p>
                </div>

                <form className="lux-modal-form" onSubmit={handleEventSubmit}>
                  <div className="lux-form-row">
                    <div className="lux-form-group">
                      <label>YOUR NAME</label>
                      <input
                        ref={eventNameRef}
                        type="text" required placeholder="e.g. Arjun Sharma"
                        defaultValue=""
                      />
                    </div>
                    <div className="lux-form-group">
                      <label>PHONE NUMBER</label>
                      <input
                        ref={eventPhoneRef}
                        type="tel" required placeholder="+91 9XXX-XXXXXX"
                        defaultValue=""
                      />
                    </div>
                  </div>

                  <div className="lux-form-row">
                    <div className="lux-form-group">
                      <label>EMAIL ADDRESS</label>
                      <input
                        ref={eventEmailRef}
                        type="email" required placeholder="name@email.com"
                        defaultValue=""
                      />
                    </div>
                    <div className="lux-form-group">
                      <label>EVENT TYPE</label>
                      <input
                        ref={eventTypeRef}
                        type="text" required placeholder="Wedding, Sangeet, Corporate..."
                        defaultValue=""
                      />
                    </div>
                  </div>

                  <div className="lux-form-row">
                    <div className="lux-form-group">
                      <label>EVENT DATE</label>
                      <input
                        ref={eventDateRef}
                        type="date" required
                        defaultValue=""
                      />
                    </div>
                    <div className="lux-form-group">
                      <label>LOCATION</label>
                      <input
                        ref={eventLocationRef}
                        type="text" required placeholder="Delhi, Mumbai, Lucknow..."
                        defaultValue=""
                      />
                    </div>
                  </div>

                  <div className="lux-form-row">
                    <div className="lux-form-group full-width">
                      <label>ARTIST TYPE (Multiple allowed)</label>
                      <div className="artist-type-grid">
                        {['Singer', 'Music Band', 'DJ', 'Musician', 'Comedian', 'Anchor', 'Dancer', 'Magician'].map(type => (
                          <button
                            key={type}
                            type="button"
                            className={`artist-chip ${selectedArtistTypes.includes(type) ? 'active' : ''}`}
                            onClick={() => {
                              const newTypes = selectedArtistTypes.includes(type)
                                ? selectedArtistTypes.filter(t => t !== type)
                                : [...selectedArtistTypes, type];
                              setSelectedArtistTypes(newTypes);
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="lux-form-group">
                      <label>BUDGET RANGE</label>
                      <select
                        ref={eventBudgetRef}
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>Select Budget</option>
                        <option value="below_5k">below 5000</option>
                        <option value="5k_10k">5000-10000</option>
                        <option value="10k_20k">10000-20000</option>
                        <option value="20k_35k">20000-35000</option>
                        <option value="35k_50k">35000-50000</option>
                        <option value="50k_80k">50000-80000</option>
                        <option value="80k_1.2L">80000-1.2L</option>
                        <option value="1.2L_1.5L">1.2L-1.5L</option>
                        <option value="1.5L_2L">1.5L-2L</option>
                        <option value="2L_3L">2L-3L</option>
                        <option value="3L_5L">3L-5L</option>
                        <option value="5L_plus">5L+</option>
                      </select>
                    </div>
                  </div>

                  <div className="lux-modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '16px' }}>
                    <button type="submit" className="btn-submit-premium" disabled={isSubmitting}>
                      <span className="btn-text">{isSubmitting ? 'Processing...' : 'Request Event Booking'}</span>
                    </button>

                    <a
                      href={`https://wa.me/918076515257?text=Hi%20Magnevents,%20I'm%20interested%20in%20booking%20an%20artist!`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp-premium"
                      style={{ height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontSize: '13px' }}
                    >
                      <span className="whatsapp-icon" style={{ marginRight: '6px', display: 'flex', alignItems: 'center' }}>
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.437 0 9.857-4.403 9.86-9.809.001-2.618-1.01-5.08-2.858-6.93C16.528 2.015 14.07 1.006 11.453 1.006c-5.434 0-9.852 4.403-9.855 9.81-.001 2.062.54 4.079 1.566 5.86l-.99 3.613 3.712-.977zm11.304-6.816c-.302-.15-1.788-.882-2.066-.983-.277-.101-.478-.15-.678.15-.2.3-.775.983-.95 1.185-.175.201-.35.227-.652.076-.302-.15-1.274-.469-2.427-1.498-.897-.8-1.502-1.788-1.678-2.09-.175-.302-.019-.465.132-.615.136-.135.302-.35.454-.526.15-.176.2-.302.302-.503.101-.2.05-.376-.026-.526-.075-.15-.678-1.636-.93-2.243-.244-.59-.493-.51-.678-.518-.176-.008-.377-.01-.578-.01-.2 0-.527.075-.803.376-.277.301-1.055 1.031-1.055 2.516 0 1.485 1.079 2.921 1.229 3.122.15.2 2.125 3.245 5.148 4.549.719.311 1.28.497 1.717.637.722.23 1.38.197 1.901.12.58-.087 1.788-.73 2.04-1.435.252-.703.252-1.306.176-1.435-.076-.13-.277-.201-.578-.352z"/>
                        </svg>
                      </span>
                      <span className="btn-text">Or Chat on WhatsApp</span>
                    </a>
                  </div>
                </form>
              </>
            )}

          </motion.div>
        </div>
      )}

      <style jsx global>{`
        /* Avoid top/bottom truncation on mobile viewports */
        .lux-modal-root {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: flex-start !important;
          justify-content: center;
          padding: 24px 8px !important;
          overflow-y: auto !important;
        }

        .lux-modal-content.selection-view {
          max-width: 680px !important;
          padding: 40px !important;
          margin-top: 20px;
        }

        .registration-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 32px;
        }

        .registration-option-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 32px 24px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }

        .option-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }

        .glow-event {
          background: radial-gradient(circle at center, rgba(255, 224, 50, 0.08) 0%, transparent 70%);
        }

        .glow-artist {
          background: radial-gradient(circle at center, rgba(0, 212, 255, 0.08) 0%, transparent 70%);
        }

        .option-icon {
          font-size: 54px;
          line-height: 1;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
          transition: transform 0.3s ease;
        }

        .registration-option-card h4 {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .registration-option-card p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.6;
          margin: 0;
          min-height: 60px;
        }

        .option-cta-btn {
          width: 100%;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .btn-event {
          background: var(--brand-primary);
          color: var(--bg-main);
          box-shadow: 0 4px 15px rgba(255, 224, 50, 0.15);
        }

        .btn-artist {
          background: linear-gradient(135deg, #00d4ff 0%, #0072ff 100%);
          color: #fff;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
        }

        /* Hover Actions */
        .registration-option-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.04);
        }

        .registration-option-card:hover .option-icon {
          transform: scale(1.1) rotate(4deg);
        }

        .registration-option-card:hover .option-glow {
          opacity: 1;
        }

        .registration-option-card.card-event:hover {
          border-color: var(--brand-gold, #FFE032);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 224, 50, 0.12);
        }

        .registration-option-card.card-artist:hover {
          border-color: #00d4ff;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.15);
        }

        .registration-option-card:hover .option-cta-btn.btn-event {
          background: var(--brand-primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 224, 50, 0.3);
        }

        .registration-option-card:hover .option-cta-btn.btn-artist {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
        }

        /* Mobile specific style overrides - Increase width, decrease height, remove long text */
        @media (max-width: 680px) {
          .lux-modal-content.selection-view {
            padding: 24px 16px !important;
            margin: 10px 4px !important;
            max-width: calc(100% - 8px) !important;
            width: calc(100% - 8px) !important;
            border-radius: 20px !important;
          }

          .registration-options-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-top: 18px;
            width: 100%;
          }

          .registration-option-card {
            padding: 16px 14px;
            gap: 8px;
            border-radius: 16px;
          }

          .option-icon {
            font-size: 36px;
          }

          .registration-option-card h4 {
            font-size: 18px;
          }

          .registration-option-card p {
            font-size: 12px;
            min-height: auto;
            line-height: 1.4;
            color: rgba(255, 255, 255, 0.65);
          }

          .option-cta-btn {
            padding: 10px 16px;
            font-size: 12px;
            margin-top: 4px;
          }

          .lux-modal-back-btn {
            top: 12px !important;
            left: 12px !important;
            padding: 4px 10px !important;
          }
        }
      `}</style>
    </AnimatePresence>
  )
}
