"use client"
import Link from 'next/link'
import { useReveal } from '@/app/hooks/useReveal'
import BrandMark from '@/app/components/common/BrandMark'
import '@/app/styles/components/Footer.css'

const SHOP_LINKS = [
  ['Wedding Live Bands', '/artists?category=band'],
  // ['Corporate Music Shows', '/services'],
  // ['Occasion Experiences', '/services'],
  ['Pricing Plans', '/pricing'],
  ['Featured Singers', '/artists?category=singer'],
  // ['Stage and Sound Setup', '/services'],
  ['Last Minute Booking', '/book'],
]

const EXPLORE_LINKS = [
  ['Artist Categories', '/artists'],
  ['Live Search', '/search'],
  ['Markets', '/markets'],
  ['Live Gallery', '/gallery'],
  ['Events Calendar', '/events'],
]

const COMPANY_LINKS = [
  ['Blog Post', '/blog-post'],
  ['Contact Us', '/contact'],
  ['Become an Artist', '/onboarding'],
  ['Booking Support', '/book'],
]

const LEGAL_LINKS = [
  ['Privacy Policy', '/privacy'],
  ['Terms of Use', '/terms'],
  ['Contact Us', 'mailto:magneventsdotin@gmail.com'],
]

function FooterLink({ to, children }) {
  const external = to.startsWith('mailto:') || to.startsWith('http')
  if (external) return <a href={to}>{children}</a>
  return <Link href={to}>{children}</Link>
}

function SocialLink({ href, label, icon, platform }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={`lux-footer-social-btn is-${platform}`}
    >
      {icon}
    </a>
  )
}

export default function Footer() {
  const revealRef = useReveal(0.06)
  const currentYear = new Date().getFullYear()

  return (
    <footer className="lux-footer">
      <div className="lux-footer-bg" aria-hidden="true" />
      <div ref={revealRef} className="lux-footer-inner">
        <section className="lux-footer-hero reveal-child fx-soft-card">
          <div>
            <p className="lux-footer-kicker">Built for unforgettable events</p>
            <h3>Your stage deserves more than a playlist.</h3>
            <p className="lux-footer-copy">
              Artist-first booking for weddings, corporate nights, and concerts with transparent rates and fast confirmations.
            </p>
            <div className="lux-footer-metrics" aria-label="Magnevents highlights">
              <span><strong>18+</strong> cities live</span>
              <span><strong>2K+</strong> artists onboarded</span>
              <span><strong>24h</strong> booking response</span>
            </div>
          </div>
          <button onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))} className="lux-footer-hero-cta fx-glow-button">
            Start live inquiry
          </button>
        </section>


        <section className="lux-footer-grid reveal-child">
          <div className="lux-footer-brand-col">
            <div className="lux-footer-brand-wrap">
              <BrandMark size="sm" light={false} hideText={true} />
              <span className="lux-footer-brand-name">Magnevents</span>
            </div>
            <p>Connecting event hosts with world-class singers, bands, and production teams across India.</p>
            <div className="lux-footer-social-row">
              <SocialLink
                href="https://www.instagram.com/magnevents.in?igsh=MXY2NmtjMm82bTFnaA=="
                label="Instagram"
                platform="instagram"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" /></svg>}
              />
              <SocialLink
                href="https://x.com/magnevents94"
                label="X (Twitter)"
                platform="twitter"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 22.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>}
              />
              <SocialLink
                href="https://youtube.com/@magnevents?si=QsPkahKK-fjSUTe4"
                label="YouTube"
                platform="youtube"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12z" /></svg>}
              />
              <SocialLink
                href="https://linkedin.com"
                label="LinkedIn"
                platform="linkedin"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>}
              />
            </div>
          </div>

          <div className="lux-footer-links-col">
            <h5>Shop</h5>
            {SHOP_LINKS.map(([label, to]) => <FooterLink key={label} to={to}>{label}</FooterLink>)}
          </div>

          <div className="lux-footer-links-col">
            <h5>Explore</h5>
            {EXPLORE_LINKS.map(([label, to]) => <FooterLink key={label} to={to}>{label}</FooterLink>)}
          </div>

          <div className="lux-footer-links-col">
            <h5>Company</h5>
            {COMPANY_LINKS.map(([label, to]) => <FooterLink key={label} to={to}>{label}</FooterLink>)}
          </div>

          <div className="lux-footer-links-col">
            <h5>Legal</h5>
            {LEGAL_LINKS.map(([label, to]) => <FooterLink key={label} to={to}>{label}</FooterLink>)}
          </div>
        </section>

        <section className="lux-footer-bottom reveal-child">
          <span className="lux-footer-copyright">Copyright {currentYear} Magnevents. Live music booking done right.</span>
          <div className="lux-footer-bottom-links">
            <span>Live Artists</span>
            <span>Stage Production</span>
            <span>Event Concierge</span>
          </div>
        </section>
      </div>
    </footer>
  )
}
