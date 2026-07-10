"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingService } from '@/app/services/bookingService'
import { validateName, validateEmail, validatePhone } from '@/app/utils/validation';
import '@/app/styles/components/ContactModal.css'

export default function ContactModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [formType, setFormType] = useState('booking')
  const [initialArtist, setInitialArtist] = useState(null)
  const [initialPlan, setInitialPlan] = useState(null)
  const [initialService, setInitialService] = useState(null)
  
  const [selectedArtistTypes, setSelectedArtistTypes] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')

  const [selectedBudget, setSelectedBudget] = useState('')
  const [selectedEventType, setSelectedEventType] = useState('')

  const copyToClipboard = () => {
    let url = window.location.href;
   
    if (window.location.pathname === '/' || window.location.pathname === '') {
      if (formType === 'register') {
        url = window.location.origin + '/register/artist';
      } else if (formType === 'booking') {
        url = window.location.origin + '/register/event';
      }
    } else if (window.location.pathname.startsWith('/artist/')) {
    
      const urlObj = new URL(url);
      if (!urlObj.searchParams.has('book')) {
        urlObj.searchParams.set('book', 'true');
      }
      url = urlObj.toString();
    }
    
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const nameRef = useRef(null)
  const phoneRef = useRef(null)
  const emailRef = useRef(null)
  const dateRef = useRef(null)
  const locationRef = useRef(null)

  useEffect(() => {
    const handleOpenModal = (e) => {
      const type = e.detail?.type || 'booking';
      const artist = e.detail?.artist || null;
      const plan = e.detail?.pricingPlan || null;
      const service = e.detail?.service || null;

      setFormType(type);
      setInitialArtist(artist);
      setInitialPlan(plan);
      setInitialService(service);
      setIsOpen(true);
      setSubmitted(false);
      setFormError('');

      if (plan) {
        const planName = plan.name.toLowerCase();
        if (planName.includes('singer')) {
          setSelectedArtistTypes(['Singer']);
          setSelectedBudget('5k_10k');
        } else if (planName.includes('duo')) {
          setSelectedArtistTypes(['Singer', 'Musician']);
          setSelectedBudget('10k_20k');
        } else if (planName.includes('band')) {
          setSelectedArtistTypes(['Music Band']);
          setSelectedBudget('20k_35k');
        }
        setSelectedEventType('Live Booking');
      } else if (service) {
        setSelectedArtistTypes([]);
        setSelectedBudget('');
        setSelectedEventType(service.title);
      } else if (artist) {
        const tag = artist.category || '';
        if (tag) setSelectedArtistTypes([tag]);
        setSelectedBudget('');
        setSelectedEventType('Artist Booking');
      } else {
        setSelectedArtistTypes([]);
        setSelectedBudget('');
        setSelectedEventType('');
      }
    };

    window.addEventListener('open-contact-modal', handleOpenModal);
    return () => window.removeEventListener('open-contact-modal', handleOpenModal);
  }, []);

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

  const onClose = () => setIsOpen(false);

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormError('')

    const nameVal = nameRef.current?.value || ''
    const phoneVal = phoneRef.current?.value || ''
    const emailVal = emailRef.current?.value || ''

    if (!phoneVal && !emailVal) {
      setFormError('Please provide either a Phone number or an Email ID.')
      return
    }
    
    if (nameVal) {
      const nameErr = validateName(nameVal);
      if (nameErr) return setFormError(nameErr);
    }
    
    if (phoneVal) {
      const phoneErr = validatePhone(phoneVal);
      if (phoneErr) return setFormError(phoneErr);
    }
    
    if (emailVal) {
      const emailErr = validateEmail(emailVal);
      if (emailErr) return setFormError(emailErr);
    }

    const submissionData = {
      name: nameRef.current?.value || '',
      phone: phoneVal,
      email: emailVal,
      eventType: selectedEventType,
      date: dateRef.current?.value || '',
      location: locationRef.current?.value || '',
      artistType: selectedArtistTypes,
      budget: selectedBudget,
      selectedArtist: initialArtist,
      selectedPlan: initialPlan,
      selectedService: initialService
    }

    setSubmitted(true)

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'generate_lead', {
        event_category: 'form',
        event_label: 'contact_modal_submit'
      });
    }

    bookingService.submitRequest({ ...submissionData, formType }).catch(error => {
      console.error("Booking error:", error)
    })

    setTimeout(() => {
      onClose()
      if (nameRef.current) nameRef.current.value = ''
      if (phoneRef.current) phoneRef.current.value = ''
      if (emailRef.current) emailRef.current.value = ''
      if (dateRef.current) dateRef.current.value = ''
      if (locationRef.current) locationRef.current.value = ''
      setSelectedEventType('')
      setSelectedBudget('')
      setSelectedArtistTypes([])
    }, 1800)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="lux-modal-root">
        <motion.div
          className="lux-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        <motion.div
          className={`lux-modal-content ${formType}`}
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: "spring", damping: 30, stiffness: 400 }}
        >
          <div className="modal-glow-bg" />

          <button className="lux-modal-close" onClick={onClose} aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>

          <div className="lux-modal-header" style={{ position: 'relative', paddingTop: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div className="header-badge" style={{ margin: 0 }}>
                {formType === 'register' ? 'JOIN OUR ROSTER' : 'DIRECT SUPPORT'}
              </div>
              <button 
                onClick={copyToClipboard}
                style={{ background: 'transparent', border: '1px solid rgba(255, 255, 255, 0.2)', color: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', padding: '4px 12px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.4)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'; }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                Copy Link
              </button>
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '32px', marginTop: '4px' }}>
              {formType === 'register' ? 'Artist Registration' : 'Booking form'}
            </h3>
            {initialArtist ? (
              <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(255,224,50,0.1)', border: '1px solid rgba(255,224,50,0.2)', borderRadius: '8px', display: 'inline-block' }}>
                <span style={{ color: '#FFE032', fontSize: '14px', fontWeight: '500' }}>
                  Booking Inquiry for: {typeof initialArtist === 'string' ? initialArtist : initialArtist?.name || 'Artist'}
                </span>
              </div>
            ) : initialPlan ? (
              <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(255,224,50,0.1)', border: '1px solid rgba(255,224,50,0.2)', borderRadius: '8px', display: 'inline-block', width: '100%', textAlign: 'left' }}>
                <span style={{ color: '#FFE032', fontSize: '15px', fontWeight: '700', display: 'block', marginBottom: '4px' }}>
                  Selected Package: {initialPlan.name} ({initialPlan.price})
                </span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'block' }}>
                  Tagline: {initialPlan.tagline}
                </span>
              </div>
            ) : initialService ? (
              <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(255,224,50,0.1)', border: '1px solid rgba(255,224,50,0.2)', borderRadius: '8px', display: 'inline-block', width: '100%', textAlign: 'left' }}>
                <span style={{ color: '#FFE032', fontSize: '15px', fontWeight: '700', display: 'block' }}>
                  Selected Service: {initialService.title}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', display: 'block', marginTop: '4px' }}>
                  {initialService.desc}
                </span>
              </div>
            ) : (
              <p>
                {formType === 'register' ? 'Showcase your talent to the world. Join Magnevents and perform at premium venues.' :
                 'Tell us your vision, and we will find the perfect stage presence for you.'}
              </p>
            )}
          </div>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lux-modal-success"
            >
              <div className="lux-success-ring">
                 <div className="lux-success-check">✓</div>
              </div>
              <h4>Submission Received!</h4>
              <p>Your details have been securely sent. A booking concierge will reach out to you within 24 hours.</p>
            </motion.div>
          ) : (
            <form className="lux-modal-form" onSubmit={handleSubmit}>
              <div className="lux-form-row">
                <div className="lux-form-group">
                  <label htmlFor="modal-name">Name</label>
                  <input
                    id="modal-name"
                    ref={nameRef}
                    type="text" required placeholder="e.g. Arjun Sharma"
                    defaultValue=""
                  />
                </div>
                <div className="lux-form-group">
                  <label htmlFor="modal-phone">Phone no.</label>
                  <input
                    id="modal-phone"
                    ref={phoneRef}
                    type="tel" placeholder="+91 9XXX-XXXXXX"
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group">
                  <label htmlFor="modal-email">Email ID</label>
                  <input
                    id="modal-email"
                    ref={emailRef}
                    type="email" placeholder="name@email.com"
                    defaultValue=""
                  />
                </div>
                <div className="lux-form-group">
                  <label htmlFor="modal-event-type">Event Type</label>
                  <input
                    id="modal-event-type"
                    type="text" required placeholder="Wedding, Sangeet, Corporate..."
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group">
                  <label>Event Date</label>
                  <input
                    ref={dateRef}
                    type="date" required
                    defaultValue=""
                  />
                </div>
                <div className="lux-form-group">
                  <label>Location</label>
                  <input
                    ref={locationRef}
                    type="text" required placeholder="Delhi, Mumbai, Lucknow..."
                    defaultValue=""
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group full-width">
                  <label>Artist Type (Multiple allowed)</label>
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
                  <label>Budget range</label>
                  <select
                    required
                    value={selectedBudget}
                    onChange={(e) => setSelectedBudget(e.target.value)}
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

              {formError && (
                <div style={{ color: '#D65050', fontSize: '13px', marginTop: '5px', marginBottom: '15px', padding: '10px 14px', background: 'rgba(214, 80, 80, 0.1)', borderRadius: '8px', border: '1px solid rgba(214, 80, 80, 0.2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  {formError}
                </div>
              )}

              <div className="lux-modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button type="submit" className="btn-submit-premium" disabled={isSubmitting}>
                  <span className="btn-text">
                    {isSubmitting ? 'Processing...' : (
                      formType === 'register' ? 'Register as Artist' : 'Request Booking'
                    )}
                  </span>
                  <div className="btn-glow" />
                </button>

                <a
                  href={`https://wa.me/918076515257?text=Hi%20Magnevents,%20I'm%20interested%20in%20booking%20an%20artist!`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp-premium"
                >
                  <span className="whatsapp-icon">
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.437 0 9.857-4.403 9.86-9.809.001-2.618-1.01-5.08-2.858-6.93C16.528 2.015 14.07 1.006 11.453 1.006c-5.434 0-9.852 4.403-9.855 9.81-.001 2.062.54 4.079 1.566 5.86l-.99 3.613 3.712-.977zm11.304-6.816c-.302-.15-1.788-.882-2.066-.983-.277-.101-.478-.15-.678.15-.2.3-.775.983-.95 1.185-.175.201-.35.227-.652.076-.302-.15-1.274-.469-2.427-1.498-.897-.8-1.502-1.788-1.678-2.09-.175-.302-.019-.465.132-.615.136-.135.302-.35.454-.526.15-.176.2-.302.302-.503.101-.2.05-.376-.026-.526-.075-.15-.678-1.636-.93-2.243-.244-.59-.493-.51-.678-.518-.176-.008-.377-.01-.578-.01-.2 0-.527.075-.803.376-.277.301-1.055 1.031-1.055 2.516 0 1.485 1.079 2.921 1.229 3.122.15.2 2.125 3.245 5.148 4.549.719.311 1.28.497 1.717.637.722.23 1.38.197 1.901.12.58-.087 1.788-.73 2.04-1.435.252-.703.252-1.306.176-1.435-.076-.13-.277-.201-.578-.352z"/>
                    </svg>
                  </span>
                  <span className="btn-text">Or Chat on WhatsApp</span>
                </a>
              </div>

            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
