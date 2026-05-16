"use client";

import Link from 'next/link'
import BrandMark from '@/app/components/common/BrandMark'
import { NAV_LINKS } from '@/app/constants'

export default function MobilePanel({ isOpen, onClose, isLight, pathname, onOpenContactModal }) {
  function isLinkActive(path) {
    return pathname === path
  }

  return (
    <>
      <aside className={`lux-mobile-panel ${isOpen ? 'open' : ''} ${isLight ? 'is-light' : 'is-dark'}`}>
        <div className="lux-mobile-panel-head">
          <BrandMark size="sm" light={false} />
          <span>Menu</span>
        </div>

        {NAV_LINKS.map(link => (
          <div key={link.label}>
            <Link 
              href={link.label === 'Contact Us' ? '#' : link.path} 
              className={`lux-mobile-link ${isLinkActive(link.path) ? 'is-active' : ''}`}
              onClick={(e) => {
                if (link.label === 'Contact Us') {
                  e.preventDefault();
                  onOpenContactModal('contact');
                  onClose();
                } else if (!link.children) {
                  onClose();
                }
              }}
            >
              {link.label}
            </Link>
            {link.children && (
              <div className="lux-mobile-submenu">
                {link.children.map(child => (
                  <Link key={child.path} href={child.path} onClick={onClose}>
                    {child.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="lux-mobile-actions" style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            Artist Register
          </button>
        </div>
      </aside>
      {isOpen && <button type="button" className="lux-mobile-backdrop" aria-label="Close menu" onClick={onClose} />}
    </>
  )
}
