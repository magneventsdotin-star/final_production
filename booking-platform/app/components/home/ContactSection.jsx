"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import { validateName, validateEmail, validatePhone } from '@helpers/validation';

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    const submissionData = { ...formData };

    const nameErr = validateName(submissionData.name);
    if (nameErr) return setFormError(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return setFormError(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return setFormError(phoneErr);

    setIsSubmitting(true);
    try {
      fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...submissionData, type: 'call_request' }),
      }).catch(error => {
        console.error("Failed to send contact inquiry:", error);
      });
      
      setTimeout(() => {
        setSubmitted(true);
        setIsSubmitting(false);

        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
          window.gtag('event', 'generate_lead', {
            event_category: 'form',
            event_label: 'contact_section_submit'
          });
        }

        setFormData({ name: '', email: '', phone: '' });
        setTimeout(() => setSubmitted(false), 3000);
      }, 300);
    } catch (error) {
      console.error("Unexpected error:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <FadeSection className="hp-shell hp-block hp-contact" id="contact">
      <div className="hp-section-head">
        <p className="hp-eyebrow">✉️ Quick Contact</p>
        <h2>Get in Touch</h2>
      </div>
      <div className="hp-contact-inner">
        <div className="hp-contact-info">

          <div className="hp-contact-channels">
            <a href="tel:+918076515257" className="hp-channel-card">
              <span className="hp-channel-icon">📱</span>
              <div>
                <strong>Phone</strong>
                <span>+91 8076515257</span>
              </div>
            </a>
            <a href="mailto:magneventsdotin@gmail.com" className="hp-channel-card">
              <span className="hp-channel-icon">✉️</span>
              <div>
                <strong>Email</strong>
                <span>magneventsdotin@gmail.com</span>
              </div>
            </a>
            <a href="https://wa.me/918076515257" target="_blank" rel="noreferrer" className="hp-channel-card">
              <span className="hp-channel-icon">💬</span>
              <div>
                <strong>Connect on WhatsApp</strong>
                <span>WhatsApp</span>
              </div>
            </a>
          </div>

          <div className="hp-contact-social">
            <a href="https://youtube.com/@magnevents?si=QsPkahKK-fjSUTe4" target="_blank" rel="noreferrer" className="hp-social-link">YouTube</a>
            <a href="https://www.instagram.com/magnevents.in?igsh=MXY2NmtjMm82bTFnaA==" target="_blank" rel="noreferrer" className="hp-social-link">Instagram</a>
          </div>
        </div>

        <div className="hp-quote-form">
          <h3 className="hp-quote-title">Request a call</h3>
          <form className="hp-contact-form" onSubmit={handleSubmit}>
            {formError && (
              <div style={{ color: '#ff4d4f', background: 'rgba(255, 77, 79, 0.1)', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', border: '1px solid rgba(255, 77, 79, 0.2)' }} role="alert">
                {formError}
              </div>
            )}
            <div className="hp-form-field">
              <label htmlFor="contact-name">Name *</label>
              <input 
                id="contact-name"
                name="name"
                type="text" 
                placeholder="Your full name" 
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required 
              />
            </div>
            <div className="hp-form-field">
              <label htmlFor="contact-email">Email *</label>
              <input 
                id="contact-email"
                name="email"
                type="email" 
                placeholder="your@email.com" 
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                required 
              />
            </div>
            <div className="hp-form-field">
              <label htmlFor="contact-phone">Phone *</label>
              <input 
                id="contact-phone"
                name="phone"
                type="tel" 
                placeholder="Your phone number" 
                value={formData.phone}
                onChange={handleChange}
                autoComplete="tel"
                required 
              />
            </div>
            <motion.button
              type="submit"
              className="hp-btn hp-btn-primary hp-form-submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : (submitted ? 'Request Sent!' : 'Send Inquiry')}
            </motion.button>
          </form>
        </div>
      </div>
    </FadeSection>
  )
}
