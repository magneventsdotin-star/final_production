"use client"

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { HomeIcon, ServicesIcon, AboutIcon, ContactIcon, RegisterIcon, ArtistsIcon, PricingIcon, ProfileIcon } from '@/app/components/icons/NavigationIcons'
import { useScrollDirection } from '@/app/hooks/useScrollDirection'

function Tab({ path, icon, label, isActive }) {
  const iconColor = isActive ? '#FFE032' : '#8a8f98'

  return (
    <Link
      href={path}
      className={`booking-tab-btn ${isActive ? 'is-active' : ''}`}
      style={{
        flex: 1,
        border: 'none',
        background: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        color: isActive ? '#FFE032' : '#8a8f98',
        padding: '10px 4px 6px',
        cursor: 'pointer',
        WebkitTapHighlightColor: 'transparent',
        transition: 'all 200ms ease',
        opacity: isActive ? 1 : 0.7,
        textDecoration: 'none'
      }}
    >
      {icon(iconColor)}
      <span className="booking-tab-label" style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
    </Link>
  )
}

export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  function active(path) {
    return pathname === path
  }

  const scrollDirection = useScrollDirection()

  return (
    <>
      <div className="booking-bottom-nav" style={{
        position: 'fixed',
        left: '12px',
        right: '12px',
        bottom: '12px',
        zIndex: 170,
        height: '68px',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(18, 18, 18, 0.85)',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        display: 'flex',
        padding: '0 8px',
        transform: scrollDirection === 'down' ? 'translateY(150%)' : 'translateY(0)',
        transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1)',
      }}>
        {/* Slot 1: Home */}
        <Tab path="/" icon={(color) => <HomeIcon color={color} />} label="Home" isActive={active('/')} />
        
        {/* Slot 2: Artists */}
        <Tab path="/artists" icon={(color) => <ArtistsIcon color={color} />} label="Artists" isActive={active('/artists')} />
        
        {/* Slot 3: Center Elevated Register FAB */}
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
          height: '100%',
          zIndex: 180
        }}>
          <button
            className="booking-tab-btn register-center-fab"
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-register-modal'));
            }}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -55%)',
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF2E93 0%, #FF8A00 100%)',
              border: '3px solid #1d1c1c',
              boxShadow: '0 8px 25px rgba(255, 46, 147, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
          >
            <RegisterIcon color="#fff" />
            <span style={{ fontSize: '8px', fontWeight: '900', color: '#fff', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '1px' }}>Register</span>
          </button>
        </div>

        {/* Slot 4: Blog */}
        <Tab path="/blog-post" icon={(color) => <AboutIcon color={color} />} label="Blog" isActive={active('/blog-post')} />
        
        {/* Slot 5: Pricing */}
        <Tab
          path="/pricing"
          icon={(color) => <PricingIcon color={color} />}
          label="Pricing"
          isActive={active('/pricing')}
        />
      </div>

      <div className="booking-bottom-nav-spacer" style={{ height: 'calc(62px + env(safe-area-inset-bottom))' }} />

      <style>{`
        .booking-bottom-nav .booking-tab-btn:not(.register-center-fab) {
          color: #8a8f98 !important;
          opacity: 0.7 !important;
        }

        .booking-bottom-nav .booking-tab-btn:not(.register-center-fab).is-active {
          color: #FFE032 !important;
          opacity: 1 !important;
        }

        .booking-bottom-nav .booking-tab-btn .booking-tab-label {
          color: currentColor !important;
        }

        .booking-bottom-nav .register-center-fab {
          opacity: 1 !important;
          color: #fff !important;
        }

        .booking-bottom-nav .register-center-fab:hover,
        .booking-bottom-nav .register-center-fab:active {
          transform: translate(-50%, -64%) scale(1.08) !important;
          box-shadow: 0 12px 30px rgba(255, 46, 147, 0.65), inset 0 2px 4px rgba(255, 255, 255, 0.4) !important;
          background: linear-gradient(135deg, #ff1a84 0%, #ff7b00 100%) !important;
        }

        @media (min-width: 768px) {
          .booking-bottom-nav,
          .booking-bottom-nav-spacer {
            display: none !important;
          }
        }

        body.modal-open .booking-bottom-nav,
        body.modal-open .booking-bottom-nav-spacer {
          display: none !important;
        }
      `}</style>
    </>
  )
}
