"use client";

import { useState, useRef } from 'react';
import { motion } from 'framer-motion'
import FadeSection from '@/app/components/common/FadeSection'
import { validateName, validateEmail, validatePhone } from '@/app/utils/validation';

export default function ContactSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const submissionData = {
      name: nameRef.current?.value || '',
      email: emailRef.current?.value || '',
      phone: phoneRef.current?.value || ''
    };

    const nameErr = validateName(submissionData.name);
    if (nameErr) return alert(nameErr);
    const emailErr = validateEmail(submissionData.email);
    if (emailErr) return alert(emailErr);
    const phoneErr = validatePhone(submissionData.phone);
    if (phoneErr) return alert(phoneErr);

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

        if (nameRef.current) nameRef.current.value = '';
        if (emailRef.current) emailRef.current.value = '';
        if (phoneRef.current) phoneRef.current.value = '';
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
            <div className="hp-form-field">
              <label htmlFor="contact-name">Name *</label>
              <input 
                id="contact-name"
                ref={nameRef}
                type="text" 
                placeholder="Your full name" 
                defaultValue=""
                required 
              />
            </div>
            <div className="hp-form-field">
              <label htmlFor="contact-email">Email *</label>
              <input 
                id="contact-email"
                ref={emailRef}
                type="email" 
                placeholder="your@email.com" 
                defaultValue=""
                required 
              />
            </div>
            <div className="hp-form-field">
              <label htmlFor="contact-phone">Phone *</label>
              <input 
                id="contact-phone"
                ref={phoneRef}
                type="tel" 
                placeholder="Your phone number" 
                defaultValue=""
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
