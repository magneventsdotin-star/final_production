import React from 'react';

export default function RoleSelector({ setView }) {
  return (
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
  );
}
