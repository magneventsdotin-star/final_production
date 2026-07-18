import React from 'react';
import ReelCard from './ReelCard';

export default function ReelsGroup({ category, videos, displayHeading, displaySubHeading }) {
  const visibleVideos = [...videos].filter((vid) => vid.main_headingvideo === true);

  if (visibleVideos.length === 0) return null;

  return (
    <div className="reels-container" key={category} style={{ marginBottom: '80px' }}>
      <div className="reels-header">
        {/* First Row: Scrolling Text (Marquee) */}
        <div className="marquee-container">
          <div className="marquee-content">
            ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM
          </div>
        </div>

        {/* Second Row: Main Heading, Badge, and Button */}
        <div className="reels-header-content" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '70px', padding: '12px 40px' }}>
          
          {/* Centered Heading & Badge */}
          <div className="reels-header-center" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '16px', zIndex: 2 }}>
            <div style={{
              background: 'linear-gradient(135deg, #D65050, #e87c7c)',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '100px',
              fontSize: '10px',
              fontWeight: '900',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              boxShadow: '0 4px 15px rgba(214, 80, 80, 0.4)'
            }}>
              ★ Trending
            </div>
            <h2 className="reels-title" style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 40px)', lineHeight: '1.2', fontWeight: '900' }}>{displayHeading}</h2>
          </div>
          
          {/* Right Aligned Button */}
          <div style={{ position: 'absolute', right: '40px', zIndex: 2 }}>
            <button 
              className="quick-book-btn"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-contact-modal', { 
                  detail: { type: 'booking', artist: { name: `Performer from ${category}` } } 
                }));
              }}
            >
              Quick Book
            </button>
          </div>
        </div>
      </div>

      {/* Subheading in a separate centered box */}
      {displaySubHeading && (
        <div style={{
          background: 'rgba(20, 20, 25, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 30px',
          margin: '0 auto 30px auto',
          maxWidth: '900px',
          textAlign: 'center',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(20px)',
          position: 'relative',
          zIndex: 2
        }}>
          <p className="text-gradient-subheading">
            {displaySubHeading}
          </p>
        </div>
      )}

      <div className="reels-grid">
        {visibleVideos.slice(0, 4).map((vid) => (
          <ReelCard key={vid.id} vid={vid} category={category} />
        ))}
      </div>
    </div>
  );
}
