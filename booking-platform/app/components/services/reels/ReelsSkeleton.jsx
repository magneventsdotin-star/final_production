import React from 'react';

export default function ReelsSkeleton() {
  return (
    <section className="reels-section-wrapper">
      <div className="reels-page-heading" style={{ animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}>
        <div style={{ height: '60px', width: '500px', background: '#1a1a24', borderRadius: '12px', margin: '0 auto 20px auto', maxWidth: '80%' }}></div>
        <div style={{ height: '20px', width: '350px', background: '#1a1a24', borderRadius: '8px', margin: '0 auto', maxWidth: '60%' }}></div>
      </div>
      
      <div className="reels-container" style={{ marginBottom: '80px', animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}>
        <div className="reels-header" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ width: '300px', height: '40px', background: '#1a1a24', borderRadius: '12px' }}></div>
          <div style={{ width: '150px', height: '45px', background: '#1a1a24', borderRadius: '100px' }}></div>
        </div>
        <div className="reels-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="reel-card" style={{ background: '#1a1a24', border: 'none', boxShadow: 'none' }}></div>
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </section>
  );
}
