"use client";

import React, { useState, useEffect } from 'react';
import '@/app/styles/components/PromotionalOfferSection.css';

export default function PromotionalOfferSection({ className = "" }) {
  const [headline, setHeadline] = useState("Get Up to 60% OFF on Your First Event Booking!");
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 19, seconds: 15 });

  useEffect(() => {
    fetch('/api/settings/top-ad', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.textDesktop) {
          setHeadline(data.textDesktop.replace(/^[🎉\s]+/, ''));
        }
      })
      .catch(() => {});
  }, []);

  // Midnight countdown
  useEffect(() => {
    const getNextMidnight = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
    };

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = getNextMidnight() - now;
      if (diff > 0) {
        setTimeLeft({
          hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((diff % (1000 * 60)) / 1000)
        });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleClaimOffer = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'offer' } }));
    }
  };

  const pad = (n) => n.toString().padStart(2, '0');

  return (
    <section className={`lux-promo-section-wrap ${className}`} aria-label="Limited Time Offer">
      <div className="lux-promo-section-card">
        <div className="lux-promo-bg-glow" aria-hidden="true" />
        <div className="lux-promo-bg-glow-left" aria-hidden="true" />

        {/* Left column */}
        <div className="lux-promo-left-col">
          <div className="lux-promo-badge-row">
            <span className="lux-promo-pill">
              <span className="lux-promo-live-dot" />
              <span>Limited Time Offer</span>
            </span>
            <span className="lux-promo-code-pill">
              Code: FIRSTEVENT60
            </span>
          </div>

          <h2 className="lux-promo-headline">
            🎉 <span className="lux-promo-headline-grad">{headline}</span>
          </h2>

          <p className="lux-promo-desc">
            Book verified live singers, bands, or DJs across India with 0% middleman fees and our legally binding 100% Artist Arrival Guarantee.
          </p>

          <div className="lux-promo-perks-row">
            <span className="lux-promo-perk">
              <span className="icon">🛡️</span> 100% Arrival Guarantee
            </span>
            <span className="lux-promo-perk">
              <span className="icon">💎</span> 0% Agency Markup
            </span>
            <span className="lux-promo-perk">
              <span className="icon">🎙️</span> Full Sound Rider Setup
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="lux-promo-right-col">
          <div className="lux-promo-timer-card">
            <span className="lux-promo-timer-label">Ends in:</span>
            <div className="lux-promo-timer-digits">
              <span className="lux-promo-digit-box">{pad(timeLeft.hours)}</span>
              <span>:</span>
              <span className="lux-promo-digit-box">{pad(timeLeft.minutes)}</span>
              <span>:</span>
              <span className="lux-promo-digit-box">{pad(timeLeft.seconds)}</span>
            </div>
          </div>

          <div className="lux-promo-actions-group">
            <button
              type="button"
              onClick={handleClaimOffer}
              className="lux-promo-main-btn"
            >
              <span>Claim 60% OFF Now</span>
              <span>→</span>
            </button>
            <a
              href="https://wa.me/918076515257?text=Hi%20Magnevents!%20I%20want%20to%20claim%20the%2060%25%20OFF%20first%20booking%20discount%20for%20my%20event."
              target="_blank"
              rel="noopener noreferrer"
              className="lux-promo-wa-btn"
            >
              <span>💬 WhatsApp Offer</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
