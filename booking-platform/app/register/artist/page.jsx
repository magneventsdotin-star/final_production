"use client"

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { bookingService } from '@/app/services/bookingService'
import '@/app/styles/components/ContactModal.css'
import '@/app/styles/pages/Register.css'
import { validateName, validateEmail, validatePhone } from '@helpers/validation';

export default function ArtistRegistrationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const copyToClipboard = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  const [formError, setFormError] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    category: '',
    price: '',
    portfolio: '',
    bio: '',
    customCity: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleArtistSubmit = async (e) => {
    e.preventDefault()
    setFormError('')
    const finalCity = selectedCity === 'Other' ? formData.customCity : selectedCity;
    const submissionData = {
      ...formData,
      city: finalCity || ''
    }

    const nameErr = validateName(submissionData.name);
    if (nameErr) return setFormError(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return setFormError(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return setFormError(phoneErr);
    if (!submissionData.city) return setFormError("Please select or enter your city.");

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
              <div className="lux-success-ring" style={{ borderColor: '#00d4ff', margin: '0 auto 20px', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #00d4ff' }}>
                 <div className="lux-success-check" style={{ color: '#00d4ff', fontSize: '24px' }}>✓</div>
              </div>
              <h2 style={{ color: '#fff', marginBottom: '16px' }}>Application Received!</h2>
              <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px' }}>Thank you for joining Magnevents. Our artist relations team will review your portfolio and contact you within 48 hours.</p>
              <button onClick={() => window.location.href = '/'} className="btn-submit-premium" style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0072ff 100%)' }}>
                <span className="btn-text">Return to Home</span>
              </button>
            </motion.div>
          ) : (
            <div className="lux-modal-content register is-page" style={{ maxWidth: '600px', width: '100%', background: 'rgba(20,20,20,0.8)', padding: '40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="lux-modal-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <p className="header-badge" style={{ background: 'rgba(0, 212, 255, 0.1)', color: '#00d4ff', display: 'inline-block', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', margin: 0 }}>JOIN THE ELITE</p>
                  <button 
                    onClick={copyToClipboard}
                    style={{ background: 'transparent', border: '1px solid rgba(0, 212, 255, 0.3)', color: '#00d4ff', borderRadius: '12px', padding: '6px 14px', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0, 212, 255, 0.1)'; e.currentTarget.style.borderColor = '#00d4ff'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)'; }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                    Copy Link
                  </button>
                </div>
                <h2 className="lux-modal-title" style={{ fontSize: '32px', color: '#fff', marginBottom: '8px' }}>Artist Registration</h2>
                <p className="lux-modal-desc" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Showcase your talent to the world. Join Magnevents and perform at premium venues.</p>
              </div>

              <form className="lux-modal-form" onSubmit={handleArtistSubmit}>
                {formError && (
                  <div style={{ color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(255, 77, 79, 0.2)' }} role="alert">
                    {formError}
                  </div>
                )}
                <div className="lux-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="lux-form-group">
                    <label htmlFor="artpg-name" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>FULL NAME</label>
                    <input
                      id="artpg-name"
                      name="name"
                      type="text" required placeholder="e.g. Rahul Verma"
                      value={formData.name}
                      onChange={handleChange}
                      autoComplete="name"
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <div className="lux-form-group">
                    <label htmlFor="artpg-phone" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>PHONE NUMBER</label>
                    <input
                      id="artpg-phone"
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
                    <label htmlFor="artpg-email" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>EMAIL ADDRESS</label>
                    <input
                      id="artpg-email"
                      name="email"
                      type="email" required placeholder="name@email.in"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                  <div className="lux-form-group">
                    <label htmlFor="artpg-price" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>PERFORMANCE PRICE (₹)</label>
                    <input
                      id="artpg-price"
                      name="price"
                      type="text" required placeholder="e.g. 50000 - 100000"
                      value={formData.price}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                </div>

                <div className="lux-form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div className="lux-form-group">
                    <label htmlFor="artpg-category" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>ARTIST CATEGORY</label>
                    <select
                      id="artpg-category"
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
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
                    <label htmlFor="artpg-city" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>CITY</label>
                    <select
                      id="artpg-city"
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
                      required
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    >
                      <option value="">Select City</option>
                      <option value="Mumbai">Mumbai</option>
                      <option value="Delhi">Delhi</option>
                      <option value="Bangalore">Bangalore</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Ahmedabad">Ahmedabad</option>
                      <option value="Chennai">Chennai</option>
                      <option value="Kolkata">Kolkata</option>
                      <option value="Surat">Surat</option>
                      <option value="Pune">Pune</option>
                      <option value="Jaipur">Jaipur</option>
                      <option value="Lucknow">Lucknow</option>
                      <option value="Kanpur">Kanpur</option>
                      <option value="Nagpur">Nagpur</option>
                      <option value="Indore">Indore</option>
                      <option value="Thane">Thane</option>
                      <option value="Bhopal">Bhopal</option>
                      <option value="Visakhapatnam">Visakhapatnam</option>
                      <option value="Pimpri-Chinchwad">Pimpri-Chinchwad</option>
                      <option value="Patna">Patna</option>
                      <option value="Vadodara">Vadodara</option>
                      <option value="Ghaziabad">Ghaziabad</option>
                      <option value="Ludhiana">Ludhiana</option>
                      <option value="Agra">Agra</option>
                      <option value="Nashik">Nashik</option>
                      <option value="Chandigarh">Chandigarh</option>
                      <option value="Other">Other (Add Custom)</option>
                    </select>
                  </div>
                </div>

                {selectedCity === 'Other' && (
                  <div className="lux-form-group" style={{ marginBottom: '16px' }}>
                    <label htmlFor="artpg-customcity" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>ENTER CUSTOM CITY</label>
                    <input
                      id="artpg-customcity"
                      name="customCity"
                      type="text" required placeholder="e.g. Jaipur"
                      value={formData.customCity}
                      onChange={handleChange}
                      style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                    />
                  </div>
                )}

                <div className="lux-form-group" style={{ marginBottom: '16px' }}>
                  <label htmlFor="artpg-portfolio" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>PORTFOLIO / SOCIAL LINK</label>
                  <input
                    id="artpg-portfolio"
                    name="portfolio"
                    type="url" required placeholder="Instagram, YouTube or Website"
                    value={formData.portfolio}
                    onChange={handleChange}
                    autoComplete="url"
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff' }}
                  />
                </div>

                <div className="lux-form-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor="artpg-bio" style={{ display: 'block', fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>BIO & EXPERIENCE</label>
                  <textarea
                    id="artpg-bio"
                    name="bio"
                    rows="4" required
                    placeholder="Briefly describe your performances, experience, and what makes you unique..."
                    value={formData.bio}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', resize: 'vertical' }}
                  />
                </div>

                <button type="submit" className="btn-submit-premium" style={{ width: '100%', padding: '16px', background: 'linear-gradient(135deg, #00d4ff 0%, #0072ff 100%)', border: 'none', borderRadius: '12px', color: '#fff', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 15px rgba(0, 212, 255, 0.2)' }} disabled={isSubmitting}>
                  <span className="btn-text">{isSubmitting ? 'Processing...' : 'Register as Artist'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
