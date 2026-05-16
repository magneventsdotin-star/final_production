"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { bookingService } from '@/app/services/bookingService'
import '@/app/styles/components/ContactModal.css'

export default function ContactModal({ isOpen, onClose, initialType = 'booking', initialArtist = null }) {
  const [formType, setFormType] = useState(initialType) // 'booking' | 'contact' | 'register'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    date: '',
    location: '',
    artistType: [],
    budget: '',
    budget: '',
    message: '',
    selectedArtist: initialArtist
  })
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Sync with initial props when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormType(initialType)
      setSubmitted(false)
      setFormData(prev => ({ ...prev, selectedArtist: initialArtist }))
    }
  }, [isOpen, initialType, initialArtist])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      await bookingService.submitRequest({ ...formData, formType })
      setIsSubmitting(false)
      setSubmitted(true)
      
      // Auto close after success
      setTimeout(() => {
        onClose()
        setFormData({ 
          name: '', email: '', phone: '', eventType: '', 
          date: '', location: '', artistType: [], budget: '', message: '', selectedArtist: null
        })
      }, 2500)
    } catch (error) {
      console.error("Booking error:", error)
      setIsSubmitting(false)
    }
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

          <div className="lux-modal-header">
            <div className="header-badge">
              {formType === 'register' ? 'JOIN OUR ROSTER' : 'DIRECT SUPPORT'}
            </div>
            <h3 style={{ fontFamily: 'var(--font-display)', color: '#fff', fontSize: '32px' }}>
              {formType === 'register' ? 'Artist Registration' : 'Booking form'}
            </h3>
            {formData.selectedArtist ? (
              <div style={{ marginTop: '12px', padding: '10px 16px', background: 'rgba(255,224,50,0.1)', border: '1px solid rgba(255,224,50,0.2)', borderRadius: '8px', display: 'inline-block' }}>
                <span style={{ color: '#FFE032', fontSize: '14px', fontWeight: '500' }}>
                  Booking Inquiry for: {typeof formData.selectedArtist === 'string' ? formData.selectedArtist : formData.selectedArtist?.name || 'Artist'}
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
                  <label>Name</label>
                  <input 
                    type="text" required placeholder="e.g. Arjun Sharma"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="lux-form-group">
                  <label>Phone no.</label>
                  <input 
                    type="tel" required placeholder="+91 9XXX-XXXXXX"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group">
                  <label>Email ID</label>
                  <input 
                    type="email" required placeholder="name@email.com"
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="lux-form-group">
                  <label>Event Type</label>
                  <input 
                    type="text" required placeholder="Wedding, Sangeet, Corporate..."
                    value={formData.eventType}
                    onChange={e => setFormData({...formData, eventType: e.target.value})}
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group">
                  <label>Event Date</label>
                  <input 
                    type="date" required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="lux-form-group">
                  <label>Location</label>
                  <input 
                    type="text" required placeholder="Delhi, Mumbai, Lucknow..."
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                  />
                </div>
              </div>

              <div className="lux-form-row">
                <div className="lux-form-group full-width">
                  <label>Artist Type (Multiple allowed)</label>
                  <div className="artist-type-grid">
                    {['Solo Singer', 'Full Band', 'DJ', 'Sufi Artist', 'Magician', 'Instrumental', 'Dancer', 'Comedian'].map(type => (
                      <button
                        key={type}
                        type="button"
                        className={`artist-chip ${formData.artistType.includes(type) ? 'active' : ''}`}
                        onClick={() => {
                          const newTypes = formData.artistType.includes(type)
                            ? formData.artistType.filter(t => t !== type)
                            : [...formData.artistType, type];
                          setFormData({...formData, artistType: newTypes});
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
                    value={formData.budget}
                    onChange={e => setFormData({...formData, budget: e.target.value})}
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

              <div className="lux-modal-footer">
                <button type="submit" className="btn-submit-premium" disabled={isSubmitting}>
                  <span className="btn-text">
                    {isSubmitting ? 'Processing...' : (
                      formType === 'register' ? 'Register as Artist' : 'Request Booking'
                    )}
                  </span>
                  <div className="btn-glow" />
                </button>
              </div>


            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
