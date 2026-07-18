"use client";
import { useState } from 'react';
import Link from 'next/link';
import BrandMark from '@/app/components/common/BrandMark';
import '@/app/styles/components/Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [openSections, setOpenSections] = useState({
    platform: false,
    company: false,
    resources: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const triggerModal = (e, type) => {
    e.preventDefault();
    window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type } }));
  };

  return (
    <footer className="lux-footer">
      <div className="lux-footer-container">
        <div className="lux-footer-grid">


          <div className="lux-footer-brand">
            <div className="lux-footer-brand-wrap">
              <Link href="/">
                <BrandMark size="md" light={true} />
              </Link>
            </div>
            <p className="lux-footer-desc">
              Curating elite live music experiences for weddings, corporate events, and private gatherings across the globe.
            </p>
            <div className="lux-footer-socials">
              <a href="https://www.instagram.com/magnevents.in?igsh=MXY2NmtjMm82bTFnaA==" target="_blank" rel="noreferrer" className="lux-footer-social-link" aria-label="Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
              <a href="https://x.com/magnevents94" target="_blank" rel="noreferrer" className="lux-footer-social-link" aria-label="X (Twitter)">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://youtube.com/@magnevents?si=QsPkahKK-fjSUTe4" target="_blank" rel="noreferrer" className="lux-footer-social-link" aria-label="YouTube">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2C5.12 19.5 12 19.5 12 19.5s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg>
              </a>
            </div>
          </div>


          <div className={`lux-footer-col ${openSections.platform ? 'is-open' : ''}`}>
            <h4 onClick={() => toggleSection('platform')} className="lux-footer-mobile-trigger">
              Platform
              <span className="lux-footer-chevron">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </h4>
            <ul className="lux-footer-links">
              <li><Link href="/artists" className="lux-footer-link">Browse Artists</Link></li>
              <li><Link href="/pricing" className="lux-footer-link">Pricing Plans</Link></li>
              <li><Link href="/gallery" className="lux-footer-link">Event Gallery</Link></li>
              <li><Link href="/how-to-book" className="lux-footer-link">How it Works</Link></li>
            </ul>
          </div>

          <div className={`lux-footer-col ${openSections.company ? 'is-open' : ''}`}>
            <h4 onClick={() => toggleSection('company')} className="lux-footer-mobile-trigger">
              Company
              <span className="lux-footer-chevron">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </h4>
            <ul className="lux-footer-links">
              <li><Link href="/blog-post" className="lux-footer-link">Blog Post</Link></li>
              <li><Link href="/why-choose" className="lux-footer-link">Why Choose Us</Link></li>
              <li><button type="button" onClick={(e) => triggerModal(e, 'contact')} className="lux-footer-link" style={{ textAlign: 'left', width: '100%', padding: 0 }}>Contact Support</button></li>
            </ul>
          </div>

          <div className={`lux-footer-col ${openSections.resources ? 'is-open' : ''}`}>
            <h4 onClick={() => toggleSection('resources')} className="lux-footer-mobile-trigger">
              Resources
              <span className="lux-footer-chevron">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </span>
            </h4>
            <ul className="lux-footer-links">
              <li><span className="lux-footer-link" style={{ cursor: 'default', opacity: 0.5 }}>Help Center</span></li>
              <li><Link href="/testimonials" className="lux-footer-link">Client Reviews</Link></li>
              <li><Link href="/search" className="lux-footer-link">Search Site</Link></li>
              <li><button type="button" onClick={(e) => triggerModal(e, 'booking')} className="lux-footer-link" style={{ textAlign: 'left', width: '100%', padding: 0 }}>Instant Booking</button></li>
            </ul>
          </div>

        </div>

        <div className="lux-footer-seo" style={{ marginTop: '40px', padding: '30px 0', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexWrap: 'wrap', gap: '8px 12px', justifyContent: 'center', textAlign: 'center' }}>
          {[
            'live singers in delhi', 'live singer for house party', 'book singer for house party',
            'singer for house party', 'guitarist near me', 'book live singer', 'sufi singers in delhi',
            'guitarist for house party', 'live bands for wedding in delhi', 'singer in delhi',
            'guitarist at home', 'live singer for house party near me', 'live singer near me',
            'live bands in delhi', 'singer for birthday party', 'live singer',
            'guitarist for birthday party in delhi', 'live music at home', 'live music singers near me',
            'singer for home party', 'live band for wedding', 'singer near me', 'singers for wedding',
            'singer at home', 'singer for house party in gurgaon', 'local singers near me'
          ].map((kw, i) => (
            <Link key={i} href="/artists" style={{ color: 'rgba(255,255,255,0.2)', fontSize: '10px', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = 'rgba(255,255,255,0.5)'} onMouseLeave={(e) => e.target.style.color = 'rgba(255,255,255,0.2)'}>
              {kw}{i !== 25 ? ' |' : ''}
            </Link>
          ))}
        </div>

        <div className="lux-footer-bottom">
          <div className="lux-footer-copyright">
            © {currentYear} Magnevents. All rights reserved. Designed for Excellence.
          </div>
          <div className="lux-footer-legal">
            <span style={{ cursor: 'default', opacity: 0.5 }}>Terms</span>
            <span style={{ cursor: 'default', opacity: 0.5 }}>Privacy</span>
            <span style={{ cursor: 'default', opacity: 0.5 }}>Cookies</span>
            <span style={{ cursor: 'default', opacity: 0.5, fontWeight: 'bold' }}>v1.1.0</span>
            <span style={{ cursor: 'default', opacity: 0.5, fontWeight: 'bold', color: '#D65050', marginLeft: '4px' }}>
              [{process.env.NEXT_PUBLIC_SERVER_ID || 'S1'}]
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
