"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import '@/app/styles/pages/AISearch.css';

export default function CityAISearchBox({ city = "Varanasi", defaultCategory = "Live Singer" }) {
  const router = useRouter();
  const [query, setQuery] = useState(`Top verified live singers and bands in ${city} for event`);
  const [selectedEventType, setSelectedEventType] = useState("All Occasions");

  const quickPrompts = [
    {
      label: `🌹 Ghazal Singer in ${city}`,
      query: `Soulful ghazal and sufi singer in ${city} for intimate event under ₹30,000`
    },
    {
      label: `💍 Bollywood Wedding Band in ${city}`,
      query: `Energetic 4-piece Bollywood live band for wedding in ${city} with complete sound setup`
    },
    {
      label: `🎧 Corporate Party DJ in ${city}`,
      query: `Commercial EDM & Bollywood DJ with percussionist for corporate party in ${city}`
    },
    {
      label: `🎸 Acoustic Cafe / House Party in ${city}`,
      query: `Acoustic guitar duo and singer for private party in ${city} under ₹20,000`
    },
    {
      label: `🎂 Birthday House Singer`,
      query: `Versatile live singer for private birthday house party in ${city} with portable sound setup`
    }
  ];

  const eventTypes = [
    "All Occasions",
    "Wedding / Sangeet",
    "Private House Party",
    "Corporate Event",
    "Birthday Soiree",
    "Anniversary Dinner",
    "Cocktail & Reception"
  ];

  const handleSearch = (customQuery = null) => {
    const q = (customQuery || query).trim() || `Top verified live singers in ${city} for event`;
    router.push(`/ai-search?q=${encodeURIComponent(q)}`);
  };

  return (
    <section className="city-ai-matcher-section" style={{ margin: '40px 0 50px' }}>
      <div className="lux-ai-hero" style={{ padding: '0 0 32px' }}>
        <div className="lux-ai-badge" style={{ marginBottom: '20px' }}>
          <span className="lux-ai-badge-dot" />
          <span>AI Search · Official Event Intelligence · {city.toUpperCase()}</span>
        </div>

        <h2 className="lux-ai-title" style={{ fontSize: 'clamp(28px, 4vw, 44px)', marginBottom: '12px' }}>
          AI Search <span className="lux-ai-title-highlight">Artist Matcher</span>
        </h2>

        <p className="lux-ai-subtitle" style={{ fontSize: '15px', maxWidth: '640px', marginBottom: '24px' }}>
          Describe your event in everyday natural language. AI Search understands Indian event vibes, sound rider setups, direct 0% commission artist pricing in {city}, and instant bookings.
        </p>

        {/* Trust signals */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px',
          flexWrap: 'wrap',
          marginBottom: '28px',
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          {[['1,500+', 'Verified Artists'], ['0%', 'Commission'], ['100%', 'Arrival Guarantee'], ['⚡', 'Instant Match']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: '900', color: '#FFE032', letterSpacing: '-0.02em' }}>{val}</div>
              <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.45)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search Card */}
        <div className="lux-ai-searchbox-card" style={{ textAlign: 'left' }}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
          >
            <div className="lux-ai-input-wrapper">
              <span className="lux-ai-search-icon">✨</span>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`e.g. Need a Ghazal and Sufi singer in ${city} for wedding anniversary under ₹30,000...`}
                className="lux-ai-textarea"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
              />
              <button
                type="submit"
                className="lux-ai-search-submit-btn"
              >
                <span>Search with AI</span>
                <span>→</span>
              </button>
            </div>

            {/* Filter Controls */}
            <div className="lux-ai-filters-row">
              <div className="lux-ai-select" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '8px 14px', borderRadius: '10px', color: '#FFE032', fontWeight: '700', fontSize: '12.5px' }}>
                📍 {city}
              </div>

              <select
                value={selectedEventType}
                onChange={(e) => setSelectedEventType(e.target.value)}
                className="lux-ai-select"
                aria-label="Filter by Event Type"
              >
                {eventTypes.map((t) => (
                  <option key={t} value={t} style={{ background: '#121017' }}>
                    🎉 {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Prompts */}
            <div className="lux-ai-chips-wrap">
              <span className="lux-ai-chips-label">Try Examples:</span>
              {quickPrompts.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => {
                    setQuery(p.query);
                    handleSearch(p.query);
                  }}
                  className="lux-ai-prompt-chip"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
