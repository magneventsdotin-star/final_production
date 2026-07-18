import React from 'react';

export default function HowToBook() {
  return (
    <div className="reels-container" style={{ marginTop: '40px', marginBottom: '80px' }}>
      <div style={{
        background: 'rgba(20, 20, 25, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '24px',
        padding: '40px 40px',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}>
        <h2 style={{ 
          fontSize: '32px', 
          fontWeight: '900', 
          marginBottom: '16px',
          background: 'linear-gradient(135deg, #fff, #e87c7c)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          How to book a singer or a live band?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.6', maxWidth: '800px', marginBottom: '40px' }}>
          If you are still wondering how to book a singer or a live band and hire live musicians near you with zero hassle. Our team is here to help you find the perfect match, so your party, wedding, or event is nothing short of amazing. You can do this in four simple steps:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
          {[
            { num: '1', title: 'Click Book Now', desc: 'Select your favorite artist and hit the book button.' },
            { num: '2', title: 'Fill the Form', desc: 'Provide us with your event details and dates.' },
            { num: '3', title: 'Speak to Expert', desc: 'Our artist expert will help finalize the perfect match.' },
            { num: '4', title: 'Enjoy the Show', desc: 'Pay the booking amount, sit back, and relax!' }
          ].map((step, idx) => (
            <div key={idx} style={{
              background: 'rgba(0,0,0,0.2)',
              border: '1px solid rgba(214, 80, 80,0.1)',
              padding: '24px',
              borderRadius: '16px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ 
                position: 'absolute', top: '-10px', right: '-10px', 
                fontSize: '80px', fontWeight: '900', color: 'rgba(214, 80, 80,0.05)', lineHeight: '1' 
              }}>
                {step.num}
              </div>
              <div style={{ 
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #D65050, #e87c7c)',
                color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px'
              }}>
                {step.num}
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff' }}>{step.title}</h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: '1.5' }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', fontWeight: '600' }}>
            Are you ready for our musicians?
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', maxWidth: '600px', margin: '8px auto 0' }}>
            Discover the best live musicians for hire near you. Book solo singers for hire, hire a band for your party, or bring in soulful Sufi musicians for weddings and events.
          </p>
        </div>
      </div>
    </div>
  );
}
