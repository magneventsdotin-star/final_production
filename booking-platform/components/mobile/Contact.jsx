"use client";

import React from 'react';

function MobileContact() {
  return (
    <section className="mobile-shell" style={{ marginBottom: '60px' }}>
      <div style={{ 
        background: 'linear-gradient(135deg, #FFE032 0%, #EECE3B 100%)',
        borderRadius: '16px',
        padding: '32px 20px',
        textAlign: 'center',
        color: '#000'
      }}>
        <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: '700' }}>Ready to Book?</h2>
        <p style={{ margin: '0 0 24px', fontSize: '15px', opacity: 0.8 }}>
          Speak with our event concierge to find the perfect artist.
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <a href="tel:+918076515257" style={{
            background: '#000',
            color: '#fff',
            padding: '16px',
            borderRadius: '12px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '16px'
          }}>
            Call +91 80765 15257
          </a>
          <button 
            onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'general' } }))}
            style={{
              background: 'transparent',
              color: '#000',
              border: '2px solid #000',
              padding: '14px',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px'
            }}
          >
            Request Callback
          </button>
        </div>
      </div>
    </section>
  );
}

export default React.memo(MobileContact);
