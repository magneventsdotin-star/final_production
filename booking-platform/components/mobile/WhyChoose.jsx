import React from 'react';

const REASONS = [
  {
    title: 'Verified Premium Talent',
    desc: 'Every artist is vetted for quality, professionalism, and experience.',
    icon: '✨'
  },
  {
    title: 'Zero Hidden Fees',
    desc: 'Transparent pricing. What you see is what you pay.',
    icon: '💸'
  },
  {
    title: 'Instant Booking',
    desc: 'Direct access to artist calendars and instant confirmation.',
    icon: '⚡'
  },
  {
    title: 'Dedicated Support',
    desc: '24/7 event concierge to ensure everything runs perfectly.',
    icon: '🎧'
  }
];

function MobileWhyChoose() {
  return (
    <section className="mobile-shell" style={{ marginBottom: '40px' }}>
      <div className="mobile-section-head">
        <h2>Why Choose Us</h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '8px' }}>
          We remove the friction from booking live entertainment.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {REASONS.map((reason, i) => (
          <div key={i} style={{ 
            display: 'flex', 
            gap: '16px', 
            background: 'rgba(255,255,255,0.03)', 
            padding: '20px', 
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <div style={{ fontSize: '24px' }}>{reason.icon}</div>
            <div>
              <h3 style={{ margin: '0 0 6px', fontSize: '16px', color: '#fff' }}>{reason.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>{reason.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(MobileWhyChoose);
