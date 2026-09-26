"use client";

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { HomeIcon, ArtistsIcon, PhoneIcon, AIIcon, PricingIcon } from '@/app/components/icons/NavigationIcons';
import '@/app/styles/components/BottomNav.css';

function Tab({ path, icon, label, isActive, isHighlight = false, badgeText = null, badgeBg = null, onClick = null }) {
  const iconColor = isActive ? '#FFE032' : isHighlight ? '#c084fc' : '#a8a8b8';

  const handleClick = (e) => {
    if (onClick) onClick(e);
  };

  return (
    <Link
      href={path}
      onClick={handleClick}
      className={`bnav-tab ${isActive ? 'is-active' : ''} ${isHighlight ? 'is-ai' : ''}`}
      aria-label={label}
    >
      {/* Active background pill */}
      {isActive && <span className="bnav-active-pill" />}

      <span className="bnav-icon-wrap">
        {icon(iconColor)}
        {badgeText && (
          <span
            className="bnav-badge"
            style={{ background: badgeBg || 'linear-gradient(135deg,#FF2E93,#8B5CF6)' }}
          >
            {badgeText}
          </span>
        )}
      </span>

      <span className="bnav-label" style={{ color: iconColor }}>
        {label}
      </span>
    </Link>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  function active(path) {
    return pathname === path;
  }

  const handleOpenContact = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking' } }));
    }
  };

  return (
    <>
      {/* Spacer so page content isn't hidden behind the bar */}
      <div className="bnav-spacer" />

      <nav className="bnav" role="navigation" aria-label="Main Navigation">
        {/* Subtle top border glow */}
        <div className="bnav-glow-line" />

        {/* Home */}
        <Tab path="/" icon={(c) => <HomeIcon color={c} />} label="Home" isActive={active('/')} />

        {/* Artists */}
        <Tab path="/artists" icon={(c) => <ArtistsIcon color={c} />} label="Artists" isActive={active('/artists')} />

        {/* Center FAB — Book */}
        <div className="bnav-fab-slot">
          <button
            type="button"
            className="bnav-fab"
            onClick={handleOpenContact}
            aria-label="Book Now"
          >
            <span className="bnav-fab-ring" />
            <PhoneIcon color="#fff" />
            <span className="bnav-fab-label">BOOK</span>
          </button>
        </div>

        {/* AI Search */}
        <Tab
          path="/ai-search"
          icon={(c) => <AIIcon color={c} />}
          label="AI Search"
          isActive={active('/ai-search')}
          isHighlight={true}
          badgeText="AI"
          badgeBg="linear-gradient(135deg,#FF2E93,#8B5CF6)"
        />

        {/* Pricing */}
        <Tab
          path="/pricing"
          icon={(c) => <PricingIcon color={c} />}
          label="Pricing"
          isActive={active('/pricing')}
        />
      </nav>
    </>
  );
}
