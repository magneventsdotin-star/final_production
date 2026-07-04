"use client";

import { useState, useEffect } from 'react'
import Link from 'next/link'
import BrandMark from '@/app/components/common/BrandMark'
import { NAV_LINKS } from '@/app/constants'

export default function MobilePanel({ isOpen, onClose, isLight, pathname, onOpenContactModal }) {
  const [showiOSGuide, setShowiOSGuide] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [expandedCategory, setExpandedCategory] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.deferredPrompt) {
      setIsInstallable(true)
    }

    const handleInstallable = () => {
      setIsInstallable(true)
    }

    window.addEventListener('pwa-installable', handleInstallable)
    return () => window.removeEventListener('pwa-installable', handleInstallable)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  function isLinkActive(path) {
    return pathname === path
  }

  const handleInstallClick = async () => {

    if (typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches) {
      alert("Magnevents is already running as an installed App! 🎉")
      return
    }

    const promptEvent = window.deferredPrompt
    if (promptEvent) {
      promptEvent.prompt()
      const { outcome } = await promptEvent.userChoice
      if (outcome === 'accepted') {
        window.deferredPrompt = null
        setIsInstallable(false)
      }
    } else {

      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream
      if (isIOS) {
        setShowiOSGuide(true)
        setTimeout(() => setShowiOSGuide(false), 8000)
      } else {
        alert("PWA Install Ready! Simply click the '+' or 'Install App' option in your browser's address bar to install Magnevents. 📲")
      }
    }
  }

  return (
    <>
      <aside className={`lux-mobile-panel ${isOpen ? 'open' : ''} ${isLight ? 'is-light' : 'is-dark'}`}>
        <div className="lux-mobile-panel-head">
          <BrandMark size="sm" light={false} />
          <button
            type="button"
            className="lux-mobile-close"
            onClick={onClose}
            aria-label="Close menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <nav className="lux-mobile-links-container">
          {NAV_LINKS.map(link => {
            const isCategory = link.label.toLowerCase() === 'artists';

            if (isCategory) {
              return (
                <div key={link.label}>
                  <button
                    type="button"
                    className={`lux-mobile-link ${expandedCategory ? 'is-active' : ''}`}
                    onClick={() => setExpandedCategory(!expandedCategory)}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'transparent',
                      border: 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      outline: 'none',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  >
                    <span>{link.label}</span>
                    <span style={{ fontSize: '11px', transition: 'transform 0.3s ease', transform: expandedCategory ? 'rotate(180deg)' : 'rotate(0deg)', opacity: 0.7 }}>
                      ▼
                    </span>
                  </button>

                  {expandedCategory && (
                    <div className="lux-mobile-submenu">
                      <Link
                        href="/artists"
                        onClick={onClose}
                        style={{
                          fontWeight: 'bold',
                          color: 'var(--brand-gold, #FFE032)',
                          borderBottom: '1px dashed rgba(255, 224, 50, 0.2)',
                          paddingBottom: '8px',
                          marginBottom: '4px',
                          display: 'block'
                        }}
                      >
                        All Categories 📑
                      </Link>
                      {link.children.map(child => (
                        <Link key={child.path} href={child.path} onClick={onClose}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div key={link.label}>
                <Link
                  href={link.label === 'Contact Us' ? '#' : link.path}
                  className={`lux-mobile-link ${isLinkActive(link.path) ? 'is-active' : ''}`}
                  onClick={(e) => {
                    if (link.label === 'Contact Us') {
                      e.preventDefault();
                      onOpenContactModal('contact');
                      onClose();
                    } else {
                      onClose();
                    }
                  }}
                >
                  {link.label}
                </Link>
              </div>
            );
          })}
        </nav>

        <div className="lux-mobile-actions" style={{ marginTop: '36px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative' }}>
          <button
            onClick={handleInstallClick}
            className="lux-mobile-cta pwa-install-trigger"
            style={{
              background: 'linear-gradient(135deg, var(--brand-gold, #FFE032) 0%, #d4af37 100%)',
              color: '#000',
              fontWeight: '900',
              border: 'none',
              letterSpacing: '0.05em',
              boxShadow: '0 8px 20px rgba(255, 224, 50, 0.15)'
            }}
          >
            📲 Install Web App
          </button>

          <button
            onClick={() => {
              onOpenContactModal('contact');
              onClose();
            }}
            className="lux-mobile-cta secondary"
          >
            Contact Us
          </button>

          <button
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-register-modal'));
              onClose();
            }}
            className="lux-mobile-cta"
          >
            Register
          </button>

          {showiOSGuide && (
            <div className="ios-install-guide-toast">
              <p>To install: Tap the share button <span style={{fontSize: '16px'}}>📤</span> in Safari & select <strong>&ldquo;Add to Home Screen&rdquo;</strong> <span style={{fontSize: '16px'}}>📲</span>!</p>
            </div>
          )}
        </div>
      </aside>
      {isOpen && <button type="button" className="lux-mobile-backdrop" aria-label="Close menu" onClick={onClose} />}
    </>
  )
}
