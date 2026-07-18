import React from 'react';

// Parse YouTube video ID cleanly
export const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ReelsHero({ backgroundVideo }) {
  return (
    <section className="reels-hero-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      {backgroundVideo && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
          {getYoutubeId(backgroundVideo.video_url) ? (
            <iframe
              src={`https://www.youtube.com/embed/${getYoutubeId(backgroundVideo.video_url)}?rel=0&modestbranding=1&controls=0&showinfo=0&autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(backgroundVideo.video_url)}`}
              style={{ border: 'none', objectFit: 'cover', width: '100%', height: '100vw', transform: 'scale(1.5)', pointerEvents: 'none' }}
              allow="autoplay; encrypted-media"
            />
          ) : (
            <video 
              src={backgroundVideo.video_url}
              autoPlay
              muted
              loop
              playsInline
              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
            />
          )}
          {/* Subtle gradient to ensure text readability without hiding the video */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(5,5,5,0.8) 100%)' }} />
        </div>
      )}
      
      <div style={{ position: 'relative', zIndex: 1, padding: '20px', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <div style={{ 
          marginBottom: '20px',
          padding: '8px 20px',
          background: 'linear-gradient(90deg, rgba(214, 80, 80,0.15) 0%, rgba(255,138,171,0.05) 100%)',
          border: '1px solid rgba(214, 80, 80,0.3)',
          borderRadius: '100px',
          color: '#e87c7c',
          fontSize: '13px',
          fontWeight: '800',
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 0 20px rgba(214, 80, 80,0.2)'
        }}>
          <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#D65050', boxShadow: '0 0 10px #D65050' }}></span>
          Premium Artists
        </div>

        <h1 className="reels-page-title" style={{ 
          fontSize: 'clamp(32px, 5vw, 56px)', 
          marginBottom: '20px', 
          letterSpacing: '-0.02em', 
          fontWeight: '900',
          textShadow: '0 10px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)',
          lineHeight: '1.2'
        }}>
          Hire Live Musicians & Singers for <br />
          <span className="text-gradient-red">Parties, Weddings & Events</span>
        </h1>
        
        <p className="reels-page-subtitle" style={{ 
          fontSize: 'clamp(16px, 1.5vw, 20px)', 
          color: 'rgba(255,255,255,0.95)', 
          lineHeight: '1.6', 
          maxWidth: '800px',
          margin: '0 auto',
          fontWeight: '400',
          textShadow: '0 4px 15px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)' 
        }}>
          At Magnevents, we make it easy to hire live musicians for parties, weddings, and special events. From solo singers for hire near you to full bands and soulful Sufi acts, we have the perfect artist to match your vibe.
        </p>

        <button style={{
          marginTop: '30px',
          background: '#D65050',
          color: 'white',
          border: 'none',
          padding: '16px 40px',
          borderRadius: '100px',
          fontSize: '15px',
          fontWeight: '900',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 4px 15px rgba(214, 80, 80, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#b53e3e';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(214, 80, 80, 0.6)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = '#D65050';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(214, 80, 80, 0.4)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onClick={() => {
          window.dispatchEvent(new CustomEvent('open-contact-modal', { 
            detail: { type: 'booking' } 
          }));
        }}
        >
          Book Now
          <span style={{ fontSize: '18px' }}>→</span>
        </button>
      </div>
    </section>
  );
}
