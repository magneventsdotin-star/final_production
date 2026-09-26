"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/styles/components/AISingerBookingCard.css';

export default function AISingerBookingCard({ className = "", city = "", category = "Live Singer" }) {
  const router = useRouter();
  const [aiPrompt, setAiPrompt] = useState("");

  const placeholderText = city 
    ? `e.g. Ghazal or Sufi singer in ${city} under ₹25k...` 
    : "e.g. Ghazal singer in Delhi under 25k...";

  const handleAISubmit = (e) => {
    e?.preventDefault();
    const q = aiPrompt.trim() || (city ? `Top verified ${category} in ${city} for event` : "Top verified live singer for event");
    router.push(`/ai-search?q=${encodeURIComponent(q)}`);
  };

  const handleOpenConcierge = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-ai-chatbot', { 
        detail: { prompt: aiPrompt.trim() || (city ? `Find top verified artists in ${city}` : '') } 
      }));
    }
  };

  return (
    <div className={`lux-fancy-ai-card ${className}`} role="region" aria-label="Why Choose Magnevents & AI Search">
      <div className="lux-fancy-ai-glow" aria-hidden="true" />

      {/* MAJOR AREA: WHY CHOOSE MAGNEVENTS */}
      <div className="lux-why-major-area">
        <div className="lux-why-header-row">
          <div className="lux-why-mic-badge">🎤</div>
          <div className="lux-why-header-text">
            <h3 className="lux-why-title">Why Choose Magnevents?</h3>
            <span className="lux-why-sub">{city ? `India's 1st AI Music Network · ${city}` : "India's 1st AI-Powered Live Music Network"}</span>
          </div>
        </div>

        <ul className="lux-why-bullets">
          <li>
            <span className="lux-why-gold-check">✓</span>
            <div className="lux-why-item-content">
              <strong>Smart AI-Based Artist Search</strong>
              <span>Instant AI matching by genre, language, city &amp; budget</span>
            </div>
          </li>
          <li>
            <span className="lux-why-gold-check">✓</span>
            <div className="lux-why-item-content">
              <strong>Pan India Talent</strong>
              <span>1500+ verified singers &amp; bands across 40+ cities</span>
            </div>
          </li>
          <li>
            <span className="lux-why-gold-check">✓</span>
            <div className="lux-why-item-content">
              <strong>100% Artist Arrival Guarantee</strong>
              <span>Backed by instant emergency artist replacement</span>
            </div>
          </li>
          <li>
            <span className="lux-why-gold-check">✓</span>
            <div className="lux-why-item-content">
              <strong>Instant Quotes (0% Markup)</strong>
              <span>Direct transparent artist pricing with zero middlemen</span>
            </div>
          </li>
          <li>
            <span className="lux-why-gold-check">✓</span>
            <div className="lux-why-item-content">
              <strong>Transparent Pricing &amp; Escrow</strong>
              <span>Secure deposits &amp; flexible milestone payments</span>
            </div>
          </li>
          <li>
            <span className="lux-why-gold-check">✓</span>
            <div className="lux-why-item-content">
              <strong>Dedicated Event Manager</strong>
              <span>24/7 expert support &amp; sound coordination</span>
            </div>
          </li>
        </ul>
      </div>

      {/* MINOR AREA: SLEEK COMPACT AI SEARCH MATCHER */}
      <div className="lux-ai-minor-area">
        <div className="lux-ai-minor-header">
          <span className="lux-ai-minor-tag">✨ AI SEARCH MATCHER</span>
          <button
            type="button"
            onClick={handleOpenConcierge}
            className="lux-ai-minor-chat-btn"
          >
            💬 Open Chatbot
          </button>
        </div>

        <form onSubmit={handleAISubmit} className="lux-ai-minor-form">
          <div className="lux-ai-minor-input-wrap">
            <span className="lux-ai-minor-icon">✨</span>
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder={placeholderText}
              className="lux-ai-minor-input"
              aria-label="Search with AI"
            />
            <button type="submit" className="lux-ai-minor-btn">
              <span>Match</span>
              <span>➔</span>
            </button>
          </div>
        </form>
      </div>

      {/* Trust Mini-Footer */}
      <div className="lux-fancy-ai-trust">
        <span>🛡️ 100% Verified Talent</span>
        <span>•</span>
        <span>⚡ 0% Commission</span>
        <span>•</span>
        <span>⭐ 4.9★ (2500+ Reviews)</span>
      </div>
    </div>
  );
}



