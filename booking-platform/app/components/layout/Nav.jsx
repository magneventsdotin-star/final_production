"use client";

import dynamic from 'next/dynamic';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/app/contexts/ThemeContext';
import { useScrollDirection } from '@/app/hooks/useScrollDirection';
import BrandMark from '@/app/components/common/BrandMark';
import { NAV_LINKS } from '@/app/constants';
import '@/app/styles/components/Nav.css';

const SearchOverlay = dynamic(() => import('./SearchOverlay'), { ssr: false });
const MobilePanel = dynamic(() => import('./MobilePanel'), { ssr: false });

function useScrolled(threshold = 20) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > threshold);
    };
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [threshold]);
  return scrolled;
}

export default function Nav() {
  const { resolvedTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const searchRef = useRef(null);
  const scrolled = useScrolled(20);
  const scrollDirection = useScrollDirection();
  const isLight = resolvedTheme === 'light';

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleOpenModal = () => {
      setMenuOpen(false);
    };
    window.addEventListener('open-contact-modal', handleOpenModal);
    return () => window.removeEventListener('open-contact-modal', handleOpenModal);
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    const currentQuery = searchRef.current?.value || '';
    if (!currentQuery.trim()) return;
    setSearchOpen(false);
    router.push(`/search?q=${encodeURIComponent(currentQuery.trim())}`);
    if (searchRef.current) searchRef.current.value = '';
  }

  const openContactModal = (type) => {
    window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type } }));
  };

  return (
    <>
      <nav className={`lux-nav ${isLight ? 'is-light' : 'is-dark'} ${scrolled ? 'is-scrolled' : ''}`}>
        <div className="lux-nav-glow" aria-hidden="true" />
        <div className="lux-nav-inner">

          <Link href="/" className="lux-nav-brand">
            <BrandMark size="md" light={false} />
          </Link>

          <div className="lux-nav-center">
            {NAV_LINKS.map(link => (
              <div key={link.label} className={`lux-nav-dropdown-wrap ${link.isMega ? 'is-mega' : ''}`}>
                <Link
                  href={link.path || '#'}
                  className={`lux-nav-link ${pathname === link.path ? 'is-active' : ''}`}
                >
                  {link.label} {link.children && <span className="lux-dropdown-icon">▾</span>}
                </Link>

                {link.children && (
                  <div className={`lux-nav-dropdown ${link.isMega ? 'lux-mega-menu' : ''}`}>
                    <div className="lux-dropdown-grid">
                      {link.children.map(child => (
                        <Link key={child.path} href={child.path} className="lux-nav-dropdown-link">
                          <span>{child.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="lux-nav-right">
            <button onClick={() => openContactModal('contact')} className="lux-nav-cta">
              Contact Us
            </button>

            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-register-modal'))}
              className="lux-nav-cta secondary lux-nav-register-btn"
            >
              <span className="cta-long-text">Register</span>
              <span className="cta-short-text">Register</span>
            </button>

            <button aria-label="Toggle navigation menu" className={`lux-hamburger ${menuOpen ? 'is-open' : ''}`} onClick={() => setMenuOpen(!menuOpen)}>
              <span />
              <span />
              <span />
            </button>
          </div>

        </div>
      </nav>

      <MobilePanel
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        isLight={isLight}
        pathname={pathname}
        onOpenContactModal={openContactModal}
      />

      <SearchOverlay
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        onSubmit={handleSearchSubmit}
        searchRef={searchRef}
      />
    </>
  );
}
