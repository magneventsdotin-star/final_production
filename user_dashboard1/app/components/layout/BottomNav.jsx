"use client"

import { useRouter, usePathname } from 'next/navigation'
import { HomeIcon, ServicesIcon, AboutIcon, ContactIcon } from '@/app/components/icons/NavigationIcons'

/**
 * Tab Component
 * Individual tab for Bottom Navigation
 */
function Tab({ path, icon, label, onNavigate, isActive }) {
  const iconColor = isActive ? '#FFE032' : '#8a8f98'

  return (
    <button
      className={`booking-tab-btn ${isActive ? 'is-active' : ''}`}
      onClick={() => onNavigate(path)}
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
      }}
    >
      {icon(iconColor)}
      <span className="booking-tab-label" style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</span>
    </button>
  )
}

/**
 * BottomNav Component
 * Mobile-only bottom navigation bar
 */
export default function BottomNav() {
  const router = useRouter()
  const pathname = usePathname()

  function active(path) {
    return pathname === path
  }

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
      }}>
        <Tab path="/" icon={(color) => <HomeIcon color={color} />} label="Home" onNavigate={(p) => router.push(p)} isActive={active('/')} />
        <Tab path="/services" icon={(color) => <ServicesIcon color={color} />} label="Services" onNavigate={(p) => router.push(p)} isActive={active('/services')} />
        <Tab path="/blog-post" icon={(color) => <AboutIcon color={color} />} label="Blog" onNavigate={(p) => router.push(p)} isActive={active('/blog-post')} />
        <Tab 
          path="/contact" 
          icon={(color) => <ContactIcon color={color} />} 
          label="Contact Us" 
          onNavigate={(p) => {
            window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'contact' } }));
          }} 
          isActive={active('/contact')} 
        />
      </div>

      <div className="booking-bottom-nav-spacer" style={{ height: 'calc(62px + env(safe-area-inset-bottom))' }} />

      <style>{`
        .booking-bottom-nav .booking-tab-btn {
          color: #8a8f98 !important;
          opacity: 0.7 !important;
        }

        .booking-bottom-nav .booking-tab-btn.is-active {
          color: #FFE032 !important;
          opacity: 1 !important;
        }

        .booking-bottom-nav .booking-tab-btn .booking-tab-label {
          color: currentColor !important;
        }

        @media (min-width: 768px) {
          .booking-bottom-nav,
          .booking-bottom-nav-spacer {
            display: none !important;
          }
        }
      `}</style>
    </>
  )
}
