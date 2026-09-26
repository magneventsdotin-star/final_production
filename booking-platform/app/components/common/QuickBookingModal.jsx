"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { validateName, validatePhone } from '@helpers/validation'
import { bookingService } from '@/app/services/bookingService'
import { getUserGeolocation, getCachedGeolocation, getSilentLocationIfGranted } from '@/app/utils/geolocation'
import '@/app/styles/components/ContactModal.css'

export default function QuickBookingModal() {
  const [isOpen, setIsOpen] = useState(false)
  
  const pathname = usePathname()

  useEffect(() => {
    const handleOpen = () => setIsOpen(true)
    window.addEventListener('open-quick-booking', handleOpen)

    if (typeof window !== 'undefined') {
      if (window.location.hash === '#quick-contact' || window.location.search.includes('quick-booking')) {
        setIsOpen(true)
      }
    }

    return () => window.removeEventListener('open-quick-booking', handleOpen)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Lock body scroll when modal is open
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div key="quick-booking-modal" className="lux-modal-root">
          <motion.div
            className="lux-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="lux-modal-content"
            style={{ maxWidth: '480px' }}
          >
            <button
              onClick={() => setIsOpen(false)}
              className="lux-modal-close"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="lux-modal-header" style={{ marginBottom: '20px' }}>
              <span className="header-badge" style={{ color: '#FFE032', borderColor: 'rgba(255, 224, 50, 0.3)', background: 'rgba(255, 224, 50, 0.1)' }}>QUICK CONTACT</span>
              <h3 style={{ fontSize: '28px', marginTop: '8px', marginBottom: '8px' }}>Quick Contact</h3>
              <p className="lux-modal-desc" style={{ fontSize: '14px', lineHeight: '1.4' }}>
                Provide your details below and our event booking expert will contact you within minutes.
              </p>
            </div>

            <InnerQuickBookingForm onClose={() => setIsOpen(false)} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function InnerQuickBookingForm({ onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', location: '' })
  const [errors, setErrors] = useState({})
  const [geoData, setGeoData] = useState({ latitude: null, longitude: null, detectedLocation: '' })
  const [isDetectingLoc, setIsDetectingLoc] = useState(false)

  const handleDetectLocation = async () => {
    setIsDetectingLoc(true)
    const geo = await getUserGeolocation()
    setIsDetectingLoc(false)
    if (geo.success) {
      setGeoData({ latitude: geo.latitude, longitude: geo.longitude, detectedLocation: geo.detectedLocation })
      if (geo.city || geo.detectedLocation) {
        setFormData(prev => ({ ...prev, location: prev.location || geo.city || geo.detectedLocation }))
        if (errors.location) setErrors(prev => ({ ...prev, location: null }))
      }
    }
  }

  useEffect(() => {
    getSilentLocationIfGranted().then(geo => {
      if (geo && geo.success) {
        setGeoData({ latitude: geo.latitude, longitude: geo.longitude, detectedLocation: geo.detectedLocation })
        if (geo.city || geo.detectedLocation) {
          setFormData(prev => ({ ...prev, location: prev.location || geo.city || geo.detectedLocation }))
        }
      }
    })
  }, [])

  const validate = () => {
    const newErrors = {}
    const nameErr = validateName(formData.name)
    if (nameErr) newErrors.name = nameErr

    const phoneErr = validatePhone(formData.phone)
    if (phoneErr) newErrors.phone = phoneErr

    if (!formData.location || !formData.location.trim()) {
      newErrors.location = 'Please provide an event location'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setIsSubmitting(true)
    
    try {
      bookingService.submitRequest({
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        type: 'call_request',
        formType: 'quick_booking',
        formName: 'Quick Contact Modal',
        formLink: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}${window.location.search || ''}#quick-contact` : '',
        latitude: geoData.latitude,
        longitude: geoData.longitude,
        detectedLocation: geoData.detectedLocation
      })
      if (typeof window !== 'undefined') {
        localStorage.setItem('magnevents-form-filled', 'true')
        window.dispatchEvent(new Event('form-filled'))
      }
      setIsSuccess(true)
    } catch (err) {
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255, 224, 50, 0.15)', color: '#FFE032', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '32px' }}>
          ✓
        </div>
        <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '22px', fontWeight: '700' }}>Request Received!</h4>
        <p style={{ margin: '0', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>We will contact you shortly with the best options.</p>
        <button 
          onClick={onClose}
          className="lux-btn-primary"
          style={{ marginTop: '24px', width: '100%', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #FFE032 0%, #d4af37 100%)', color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer' }}
        >
          Close
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="lux-modal-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="lux-form-group">
        <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Full Name *</label>
        <input 
          type="text" 
          className="lux-input"
          placeholder="Your Full Name"
          value={formData.name}
          onChange={e => {
            setFormData({...formData, name: e.target.value});
            if (errors.name) setErrors({...errors, name: null});
          }}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: errors.name ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
        />
        {errors.name && <span style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
      </div>

      <div className="lux-form-group">
        <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Mobile Number *</label>
        <input 
          type="tel" 
          className="lux-input"
          placeholder="+91 98765 43210"
          value={formData.phone}
          onChange={e => {
            setFormData({...formData, phone: e.target.value});
            if (errors.phone) setErrors({...errors, phone: null});
          }}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: errors.phone ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
        />
        {errors.phone && <span style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.phone}</span>}
      </div>

      <div className="lux-form-group">
        <label style={{ display: 'block', color: 'rgba(255, 255, 255, 0.8)', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>Event Location *</label>
        <input 
          type="text" 
          className="lux-input"
          placeholder="e.g. Delhi NCR, Mumbai..."
          value={formData.location}
          onChange={e => {
            setFormData({...formData, location: e.target.value});
            if (errors.location) setErrors({...errors, location: null});
          }}
          style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.05)', border: errors.location ? '1px solid #ff4d4d' : '1px solid rgba(255, 255, 255, 0.15)', color: '#fff' }}
        />
        {errors.location && <span style={{ color: '#ff4d4d', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.location}</span>}
      </div>

      <button 
        type="submit" 
        className="lux-btn-primary" 
        disabled={isSubmitting}
        style={{ width: '100%', marginTop: '8px', padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg, #FFE032 0%, #d4af37 100%)', color: '#000', fontWeight: '800', border: 'none', cursor: 'pointer' }}
      >
        {isSubmitting ? 'Submitting...' : 'Submit Request'}
      </button>
    </form>
  )
}
