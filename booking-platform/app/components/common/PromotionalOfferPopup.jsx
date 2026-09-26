"use client";

import React, { useState, useEffect } from 'react';
import '@/app/styles/components/PromotionalOfferPopup.css';

export default function PromotionalOfferPopup() {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [discountText, setDiscountText] = useState("Get Up to 60% OFF on Your First Booking!");
  const [timeLeft, setTimeLeft] = useState({ hours: 1, minutes: 19, seconds: 15 });

  useEffect(() => {
    fetch('/api/settings/top-ad', { cache: 'no-store' })
      .then(res => res.json())
      .then(data => {
        if (data && data.textDesktop) {
          setDiscountText(data.textDesktop);
        }
      })
      .catch(() => {});
  }, []);

  // Midnight countdown timer
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

  if (isDismissed) return null;

  return (
    <div className="lux-promo-offer-root" role="region" aria-label="Special Booking Offer">
      {isMinimized ? (
        <div 
          className="lux-promo-minimized-pill" 
          onClick={() => setIsMinimized(false)}
          title="Click to view 60% OFF Offer"
        >
          <span className="lux-promo-mini-icon">🎁</span>
          <span className="lux-promo-mini-text">Claim 60% OFF</span>
        </div>
      ) : (
        <div className="lux-promo-card">
          <div className="lux-promo-glow" />
          
          <div className="lux-promo-icon-badge">
            🎉
          </div>

          <div className="lux-promo-body">
            <div className="lux-promo-title-row">
              <span className="lux-promo-tag">LIMITED OFFER</span>
              <p className="lux-promo-title">{discountText}</p>
            </div>
            
            <div className="lux-promo-timer">
              <span>Ends in:</span>
              <div className="lux-promo-timer-blocks">
                <span>{pad(timeLeft.hours)}</span>:
                <span>{pad(timeLeft.minutes)}</span>:
                <span>{pad(timeLeft.seconds)}</span>
              </div>
            </div>
          </div>

          <button 
            type="button" 
            onClick={handleClaimOffer} 
            className="lux-promo-claim-btn"
          >
            <span>Claim Now</span>
            <span>→</span>
          </button>

          <button 
            type="button" 
            onClick={() => setIsMinimized(true)} 
            className="lux-promo-close-btn"
            aria-label="Minimize offer"
            title="Minimize"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
