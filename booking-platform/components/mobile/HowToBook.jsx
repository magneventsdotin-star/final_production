import React from 'react';

const STEPS = [
  { step: '1', title: 'Browse Artists', desc: 'Find the perfect talent for your event using our filters.' },
  { step: '2', title: 'Check Availability', desc: 'Select your date and view instant pricing.' },
  { step: '3', title: 'Book Securely', desc: 'Confirm your booking with a secure advance payment.' },
];

function MobileHowToBook() {
  return (
    <section className="mobile-shell" style={{ marginBottom: '40px' }}>
      <div className="mobile-section-head">
        <h2>How It Works</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative' }}>
        {/* Simple vertical line connecting steps */}
        <div style={{ position: 'absolute', left: '20px', top: '20px', bottom: '20px', width: '2px', background: 'rgba(255, 224, 50, 0.2)', zIndex: 0 }} />

        {STEPS.map((step, i) => (
          <div key={i} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div style={{ 
              width: '42px', height: '42px', borderRadius: '50%', 
              background: '#FFE032', color: '#000', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 'bold', fontSize: '18px', flexShrink: 0
            }}>
              {step.step}
            </div>
            <div style={{ paddingTop: '8px' }}>
              <h3 style={{ margin: '0 0 4px', fontSize: '18px', color: '#fff' }}>{step.title}</h3>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.4' }}>{step.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default React.memo(MobileHowToBook);
