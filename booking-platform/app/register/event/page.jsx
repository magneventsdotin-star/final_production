"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { bookingService } from '@/app/services/bookingService'
import '@/app/styles/components/ContactModal.css'
import '@/app/styles/pages/Register.css'
import { validateName, validateEmail, validatePhone } from '@helpers/validation';

export default function EventRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formError, setFormError] = useState('')
  const [selectedArtistTypes, setSelectedArtistTypes] = useState([])

  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    date: '',
    location: '',
    budget: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const submissionData = {
      ...formData,
      artistType: selectedArtistTypes,
    }

    const nameErr = validateName(submissionData.name);
    if (nameErr) return setFormError(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return setFormError(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return setFormError(phoneErr);

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
    <main className="lux-page register-page">
      <div className="lux-container">
        <div className="register-card-container" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="registration-success-box"
              style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.05)', borderRadius: '20px' }}
            >
              <div className="lux-success-ring" style={{ borderColor: '#FFE032', margin: '0 auto 20px', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #FFE032' }}>
                 <div className="lux-success-check" style={{ color: '#FFE032', fontSize: '24px' }}>✓</div>
              </div>
              <h2 style={{ color: '#fff', marginBottom: '16px' }}>Booking Requested!</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>Your event details have been securely sent. A booking concierge will reach out to you within 24 hours.</p>
              <button onClick={() => window.location.href = '/'} className="btn-submit-premium" style={{ background: 'var(--brand-primary)', color: 'var(--bg-main)' }}>
                <span className="btn-text">Return to Home</span>
              </button>
            </motion.div>
          ) : (
            <div className="lux-modal-content register is-page" style={{ maxWidth: '600px', width: '100%', background: 'rgba(20,20,20,0.8)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="lux-modal-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p className="header-badge" style={{ background: 'rgba(255, 224, 50, 0.1)', color: '#FFE032', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>DIRECT SUPPORT</p>
                  <button 
                    type="button"
                    onClick={copyToClipboard}
                    style={{ background: 'transparent', border: '1px solid rgba(255, 224, 50, 0.3)', color: '#FFE032', borderRadius: '12px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 224, 50, 0.1)'; e.currentTarget.style.borderColor = '#FFE032'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(255, 224, 50, 0.3)'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    Copy Link
                  </button>
                </div>
                <h2 className="lux-modal-title" style={{ fontSize: '32px', color: '#fff', marginBottom: '8px' }}>Register Event</h2>
                <p className="lux-modal-desc" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Tell us your vision, and we will find the perfect stage presence for you.</p>
              </div>

              <form className="lux-modal-form" onSubmit={handleEventSubmit}>
                {formError && (
                  <div style={{ color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(255, 77, 79, 0.2)' }} role="alert">
                    {formError}
                  </div>
                )}
                <div className="lux-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="lux-form-group">
                    <label htmlFor="evtpg-name" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>YOUR NAME</label>
                    <input
                      id="evtpg-name"
                      name="name"
                      type="text" required placeholder="e.g. Arjun Sharma"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <div className="lux-form-group">
                    <label htmlFor="evtpg-phone" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>PHONE NUMBER</label>
                    <input
                      id="evtpg-phone"
                      name="phone"
                      type="tel" required placeholder="+91 9XXX-XXXXXX"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div className="lux-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="lux-form-group">
                    <label htmlFor="evtpg-email" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>EMAIL ADDRESS</label>
                    <input
                      id="evtpg-email"
                      name="email"
                      type="email" required placeholder="name@email.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <div className="lux-form-group">
                    <label htmlFor="evtpg-type" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>EVENT TYPE</label>
                    <select
                      id="evtpg-type"
                      name="eventType"
                      required
                      value={formData.eventType}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
                    >
                      <option value="" disabled>Select event type...</option>
                      <option value="Wedding">Wedding</option>
                      <option value="Sangeet">Sangeet</option>
                      <option value="Corporate">Corporate Event</option>
                      <option value="College">College Fest</option>
                      <option value="Private">Private Party</option>
                      <option value="Concert">Concert / Festival</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="lux-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="lux-form-group">
                    <label htmlFor="evtpg-date">Event Date</label>
                    <input
                      id="evtpg-date"
                      name="date"
                      type="date" required
                      min={new Date().toISOString().split('T')[0]}
                      max="2030-12-31"
                      value={formData.date}
                      onChange={handleChange}
                      onClick={(e) => e.target.showPicker && e.target.showPicker()}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', colorScheme: 'dark' }}
                    />
                  </div>
                  <div className="lux-form-group">
                    <label htmlFor="evtpg-location" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>LOCATION</label>
                    <input
                      id="evtpg-location"
                      name="location"
                      type="text" required placeholder="Delhi, Mumbai, Lucknow..."
                      value={formData.location}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div className="lux-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="lux-form-group full-width">
                    <label style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>ARTIST TYPE (Multiple allowed)</label>
                    <div className="artist-type-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
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
                          style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            border: `1px solid ${selectedArtistTypes.includes(type) ? '#FFE032' : 'rgba(255,255,255,0.2)'}`,
                            background: selectedArtistTypes.includes(type) ? 'rgba(255,224,50,0.1)' : 'transparent',
                            color: selectedArtistTypes.includes(type) ? '#FFE032' : 'rgba(255,255,255,0.7)',
                            cursor: 'pointer',
                            fontSize: '12px',
                            transition: 'all 0.2s'
                          }}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="lux-form-group" style={{ marginTop: '16px' }}>
                    <label htmlFor="evtpg-budget" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>BUDGET RANGE</label>
                    <select
                      id="evtpg-budget"
                      name="budget"
                      required
                      value={formData.budget}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    >
                      <option value="" disabled>Select Budget</option>
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

                <div className="lux-modal-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
                  <button type="submit" className="btn-submit-premium" style={{ width: '100%', padding: '16px', background: 'var(--brand-primary)', border: 'none', borderRadius: '12px', color: 'var(--bg-main)', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 224, 50, 0.15)' }} disabled={isSubmitting}>
                    <span className="btn-text">{isSubmitting ? 'Processing...' : 'Request Event Booking'}</span>
                  </button>

                  <a
                    href={`https://wa.me/918076515257?text=Hi%20Magnevents,%20I'm%20interested%20in%20booking%20an%20artist!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp-premium"
                    style={{ width: '100%', height: '54px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontSize: '16px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', textDecoration: 'none', background: 'rgba(255,255,255,0.05)' }}
                  >
                    <span className="whatsapp-icon" style={{ marginRight: '8px', display: 'flex', alignItems: 'center', color: '#25D366' }}>
                      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.437 0 9.857-4.403 9.86-9.809.001-2.618-1.01-5.08-2.858-6.93C16.528 2.015 14.07 1.006 11.453 1.006c-5.434 0-9.852 4.403-9.855 9.81-.001 2.062.54 4.079 1.566 5.86l-.99 3.613 3.712-.977zm11.304-6.816c-.302-.15-1.788-.882-2.066-.983-.277-.101-.478-.15-.678.15-.2.3-.775.983-.95 1.185-.175.201-.35.227-.652.076-.302-.15-1.274-.469-2.427-1.498-.897-.8-1.502-1.788-1.678-2.09-.175-.302-.019-.465.132-.615.136-.135.302-.35.454-.526.15-.176.2-.302.302-.503.101-.2.05-.376-.026-.526-.075-.15-.678-1.636-.93-2.243-.244-.59-.493-.51-.678-.518-.176-.008-.377-.01-.578-.01-.2 0-.527.075-.803.376-.277.301-1.055 1.031-1.055 2.516 0 1.485 1.079 2.921 1.229 3.122.15.2 2.125 3.245 5.148 4.549.719.311 1.28.497 1.717.637.722.23 1.38.197 1.901.12.58-.087 1.788-.73 2.04-1.435.252-.703.252-1.306.176-1.435-.076-.13-.277-.201-.578-.352z"/>
                      </svg>
                    </span>
                    <span className="btn-text">Or Chat on WhatsApp</span>
                  </a>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
