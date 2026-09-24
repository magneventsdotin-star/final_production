"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SEODynamicContent({ category, city, overviewHtml, services, faqs, relatedLinks }) {
  const [openFaq, setOpenFaq] = useState(0);

  const handleOpenBookingModal = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('open-contact-modal', {
          detail: {
            type: 'booking',
            service: `${category} in ${city}`
          }
        })
      );
    }
  };

  const handleWhatsApp = () => {
    const text = `Hi Magnevents! I am looking to hire a ${category} in ${city}. Please share pricing and available performers.`;
    window.open(`https://wa.me/918076515257?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="seo-dynamic-content" style={{ padding: '80px 20px', background: '#0a0a0d', color: '#eee', position: 'relative' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '70px' }}>
        
        {/* Overview Section */}
        <section className="seo-overview" style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '24px', 
          padding: '40px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
        }}>
          <span style={{ color: '#FFE032', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px', display: 'block' }}>
            LOCAL INSIGHTS & GUIDE
          </span>
          <h2 style={{ 
            fontFamily: 'var(--font-display, "Playfair Display", serif)',
            fontSize: 'clamp(2rem, 3.8vw, 2.8rem)', 
            marginBottom: '24px', 
            color: '#fff',
            fontWeight: '700'
          }}>
            About Hiring a {category} in {city}
          </h2>
          <div 
            style={{ lineHeight: '1.85', fontSize: '1.1rem', color: 'rgba(255,255,255,0.8)' }}
            dangerouslySetInnerHTML={{ __html: overviewHtml }} 
          />
        </section>

        {/* Services Section */}
        <section className="seo-services">
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <span style={{ color: '#FFE032', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              EVENT TYPES & PACKAGES
            </span>
            <h2 style={{ 
              fontFamily: 'var(--font-display, "Playfair Display", serif)',
              fontSize: 'clamp(2rem, 3.2vw, 2.5rem)', 
              color: '#fff', 
              marginTop: '8px'
            }}>
              Popular Services for {category}s in {city}
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {services.map((srv, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: 'rgba(18, 18, 22, 0.8)', 
                  border: '1px solid rgba(255,255,255,0.08)', 
                  padding: '32px 28px', 
                  borderRadius: '20px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.4)'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(255,224,50,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                  <CheckCircle size={26} style={{ color: '#FFE032' }} />
                </div>
                <h3 style={{ fontSize: '1.35rem', marginBottom: '12px', color: '#fff', fontWeight: '700' }}>{srv.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', fontSize: '0.98rem', margin: 0 }}>{srv.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Mid-content Quick Booking Callout */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 224, 50, 0.12) 0%, rgba(255, 140, 0, 0.05) 100%)',
          border: '1px solid rgba(255, 224, 50, 0.3)',
          borderRadius: '24px',
          padding: '36px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '24px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.7)'
        }}>
          <div>
            <h3 style={{ color: '#fff', fontSize: '1.6rem', margin: '0 0 6px 0', fontWeight: '800' }}>
              Planning an event in {city}?
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.75)', margin: 0, fontSize: '1rem', maxWidth: '600px' }}>
              Let our expert entertainment concierges match you with the perfect verified {category} tailored to your venue and budget.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={handleOpenBookingModal}
              style={{
                background: '#FFE032',
                color: '#000',
                fontWeight: '800',
                padding: '14px 26px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                boxShadow: '0 8px 20px rgba(255,224,50,0.3)'
              }}
            >
              ✨ Check Availability
            </button>
            <button
              type="button"
              onClick={handleWhatsApp}
              style={{
                background: '#25D366',
                color: '#fff',
                fontWeight: '700',
                padding: '14px 22px',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              💬 WhatsApp Us
            </button>
          </div>
        </div>

        {/* FAQs Section */}
        <section className="seo-faqs" style={{ maxWidth: '880px', margin: '0 auto', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span style={{ color: '#FFE032', fontSize: '12px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              ANSWERS & INFORMATION
            </span>
            <h2 style={{ 
              fontFamily: 'var(--font-display, "Playfair Display", serif)',
              fontSize: 'clamp(2rem, 3.2vw, 2.5rem)', 
              color: '#fff', 
              marginTop: '8px'
            }}>
              Frequently Asked Questions
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                style={{ 
                  background: openFaq === idx ? 'rgba(255,224,50,0.06)' : 'rgba(255,255,255,0.03)', 
                  border: openFaq === idx ? '1px solid rgba(255,224,50,0.35)' : '1px solid rgba(255,255,255,0.08)', 
                  borderRadius: '14px', 
                  overflow: 'hidden',
                  transition: 'all 0.25s ease'
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '20px 24px', 
                    background: 'transparent', 
                    color: openFaq === idx ? '#FFE032' : '#fff', 
                    fontSize: '1.08rem', 
                    fontWeight: '600', 
                    cursor: 'pointer', 
                    border: 'none', 
                    textAlign: 'left',
                    gap: '16px'
                  }}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s', flexShrink: 0 }} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div style={{ padding: '0 24px 22px', color: 'rgba(255,255,255,0.75)', lineHeight: '1.7', fontSize: '0.98rem' }}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <section className="seo-related" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', marginBottom: '24px', color: 'rgba(255,255,255,0.85)', fontWeight: '600' }}>
            Related Searches in {city}
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
            {relatedLinks.map((link, idx) => (
              <Link 
                key={idx} 
                href={link.url} 
                style={{ 
                  padding: '10px 22px', 
                  background: 'rgba(255,255,255,0.04)', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '30px', 
                  color: 'rgba(255,255,255,0.85)', 
                  textDecoration: 'none', 
                  fontSize: '0.92rem', 
                  transition: 'all 0.2s ease' 
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,224,50,0.12)';
                  e.currentTarget.style.borderColor = 'rgba(255,224,50,0.4)';
                  e.currentTarget.style.color = '#FFE032';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                }}
              >
                {link.title}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
