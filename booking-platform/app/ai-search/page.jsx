"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import AllCitiesSection, { ALL_CITIES_DIRECTORY } from '@/app/components/common/AllCitiesSection';
import '@/app/styles/pages/AISearch.css';

const QUICK_PROMPTS = [
  {
    label: "🌹 Ghazal Singer in Bhubaneswar",
    query: "Soulful ghazal and sufi singer in Bhubaneswar for intimate wedding anniversary dinner under ₹30,000",
    city: "Bhubaneswar",
    eventType: "Anniversary"
  },
  {
    label: "💍 Bollywood Wedding Band",
    query: "Energetic 4-piece Bollywood live band for wedding sangeet in Delhi with complete sound setup",
    city: "Delhi",
    eventType: "Wedding / Sangeet"
  },
  {
    label: "🎧 Corporate Party DJ",
    query: "Commercial EDM & Bollywood DJ with percussionist for corporate annual celebration in Bangalore",
    city: "Bangalore",
    eventType: "Corporate Gala"
  },
  {
    label: "🎸 Acoustic Cafe Launch",
    query: "Acoustic guitar duo and singer for outdoor cafe launch party in Mumbai under ₹20,000",
    city: "Mumbai",
    eventType: "Cafe Launch"
  },
  {
    label: "🎂 House Party Singer",
    query: "Versatile live singer for private birthday house party with wireless mic and portable sound setup",
    city: "All Cities",
    eventType: "House Party"
  }
];

const CITIES = [
  "All Cities",
  ...ALL_CITIES_DIRECTORY.map(c => c.name)
];

const EVENT_TYPES = [
  "All Occasions",
  "Wedding / Sangeet",
  "Private House Party",
  "Corporate Event",
  "Birthday Soiree",
  "Anniversary Dinner",
  "Cocktail & Reception"
];

function AISearchContent() {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(urlQuery);
  const [selectedCity, setSelectedCity] = useState("All Cities");
  const [selectedEventType, setSelectedEventType] = useState("All Occasions");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [results, setResults] = useState(null);

  const runAISearch = async (searchText, city = selectedCity, eventType = selectedEventType) => {
    const finalQuery = (searchText || query).trim();
    if (!finalQuery && city === "All Cities" && eventType === "All Occasions") {
      setErrorMsg("Please type what kind of music, singer, or event vibe you are looking for!");
      return;
    }

    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: finalQuery,
          city: city !== "All Cities" ? city : "",
          eventType: eventType !== "All Occasions" ? eventType : ""
        })
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to process AI search");
      }

      setResults(data);
    } catch (err) {
      console.error("AI Search failed:", err);
      setErrorMsg(err.message || "Could not complete AI search. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Run on mount if URL has search param
  useEffect(() => {
    if (urlQuery) {
      setQuery(urlQuery);
      runAISearch(urlQuery);
    } else {
      // Default initial query for immediate rich experience
      runAISearch("Soulful ghazal singer in Bhubaneswar with sound system", "Bhubaneswar", "Anniversary Dinner");
    }
  }, [urlQuery]);

  const handlePromptClick = (item) => {
    setQuery(item.query);
    setSelectedCity(item.city);
    setSelectedEventType(item.eventType);
    runAISearch(item.query, item.city, item.eventType);
  };

  const handleBookArtist = (artistName) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-contact-modal', {
        detail: { type: 'booking', artistName }
      }));
    }
  };

  const handleClaimOffer = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('open-contact-modal', {
        detail: { type: 'offer' }
      }));
    }
  };

  return (
    <div className="lux-ai-search-page">
      <div className="lux-ai-ambient-glow-1" aria-hidden="true" />
      <div className="lux-ai-ambient-glow-2" aria-hidden="true" />

      <div className="lux-ai-container">
        {/* Hero */}
        <section className="lux-ai-hero">
          <div className="lux-ai-badge">
            <span className="lux-ai-badge-dot" />
            <span>AI Search · Official Event Intelligence · Deep Artist Reasoning</span>
          </div>

          <h1 className="lux-ai-title">
            AI Search <span className="lux-ai-title-highlight">Artist Matcher</span>
          </h1>

          <p className="lux-ai-subtitle">
            Describe your event in everyday natural language. AI Search understands Indian event vibes, sound rider setups, direct 0% commission artist pricing, and instant bookings.
          </p>

          {/* Trust signals */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '28px',
            flexWrap: 'wrap',
            marginBottom: '36px',
            padding: '14px 24px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '16px',
            backdropFilter: 'blur(10px)'
          }}>
            {[['1,500+', 'Verified Artists'], ['0%', 'Commission'], ['100%', 'Arrival Guarantee'], ['⚡', 'Instant Match']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '900', color: '#FFE032', letterSpacing: '-0.02em' }}>{val}</div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>

          <div className="lux-ai-searchbox-card">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                runAISearch(query);
              }}
            >
              <div className="lux-ai-input-wrapper">
                <span className="lux-ai-search-icon">✨</span>
                <textarea
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Need a Ghazal and Sufi singer in Bhubaneswar for a 50-guest wedding anniversary dinner under ₹30,000..."
                  className="lux-ai-textarea"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      runAISearch(query);
                    }
                  }}
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="lux-ai-search-submit-btn"
                >
                  <span>{isLoading ? "Analyzing..." : "Search with AI"}</span>
                  <span>→</span>
                </button>
              </div>

              {/* Filter Controls */}
              <div className="lux-ai-filters-row">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="lux-ai-select"
                  aria-label="Filter by City"
                >
                  {CITIES.map((c) => (
                    <option key={c} value={c} style={{ background: '#121017' }}>
                      📍 {c}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedEventType}
                  onChange={(e) => setSelectedEventType(e.target.value)}
                  className="lux-ai-select"
                  aria-label="Filter by Event Type"
                >
                  {EVENT_TYPES.map((t) => (
                    <option key={t} value={t} style={{ background: '#121017' }}>
                      🎉 {t}
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Prompts */}
              <div className="lux-ai-chips-wrap">
                <span className="lux-ai-chips-label">Try Examples:</span>
                {QUICK_PROMPTS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => handlePromptClick(p)}
                    className="lux-ai-prompt-chip"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </form>

            {errorMsg && (
              <p style={{ color: '#ff6b6b', marginTop: '14px', fontSize: '13px' }}>
                ⚠️ {errorMsg}
              </p>
            )}
          </div>
        </section>

        {/* Loading / Thinking State */}
        {isLoading && (
          <div className="lux-ai-thinking-card">
            <div className="lux-ai-thinking-spinner" />
            <h3 className="lux-ai-thinking-title">Deep AI Event Reasoning Active</h3>
            <p className="lux-ai-thinking-desc">
              Analyzing vibe, acoustic setup requirements, and cross-matching 1,500+ verified performers in database...
            </p>
            <div className="lux-ai-steps-list">
              {['🧠 Parsing Event Vibe', '📍 Scanning City Artists', '💰 Calculating Direct Rates', '🎙️ Generating Sound Rider'].map((step, i) => (
                <span key={step} className="lux-ai-step-pill" style={{ animationDelay: `${i * 0.18}s`, animation: 'fadeInUp 0.5s ease both' }}>
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!isLoading && results && (
          <div className="lux-ai-results-section">
            {/* AI Event Strategy Card */}
            {results.analysis && (
              <div className="lux-ai-strategy-card">
                <div className="lux-ai-strategy-header">
                  <h2 className="lux-ai-strategy-title">
                    <span>⚡ AI Event Curation Breakdown</span>
                  </h2>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {results.analysis.eventType && (
                      <span className="lux-ai-event-meta-badge">
                        {results.analysis.eventType}
                      </span>
                    )}
                    {results.analysis.detectedCity && (
                      <span className="lux-ai-event-meta-badge" style={{ borderColor: '#8B5CF6', color: '#c084fc' }}>
                        📍 {results.analysis.detectedCity}
                      </span>
                    )}
                  </div>
                </div>

                <div className="lux-ai-strategy-grid">
                  <div className="lux-ai-strategy-block">
                    <h4>✨ Event Vibe & Atmosphere</h4>
                    <p>{results.analysis.vibeSummary}</p>
                  </div>

                  <div className="lux-ai-strategy-block">
                    <h4>🎙️ Recommended Sound Setup</h4>
                    <p>{results.analysis.soundAdvice}</p>
                  </div>

                  <div className="lux-ai-strategy-block">
                    <h4>🎵 Suggested Setlist & Flow</h4>
                    <p>{results.analysis.setlistTips}</p>
                  </div>

                  <div className="lux-ai-strategy-block">
                    <h4>💎 0% Commission Budget Advantage</h4>
                    <p>{results.analysis.budgetGuidance}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 60% OFF Promo Banner */}
            <div className="lux-ai-promo-banner">
              <div className="lux-ai-promo-text">
                <span className="lux-ai-promo-icon">🎁</span>
                <div>
                  <h4 className="lux-ai-promo-title">Claim Up to 60% OFF First Booking Platform Fee</h4>
                  <p className="lux-ai-promo-subtitle">
                    Use code <strong>FIRSTEVENT60</strong> when finalizing your inquiry for matched artists today.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClaimOffer}
                className="lux-ai-claim-offer-btn"
              >
                Claim 60% OFF Now →
              </button>
            </div>

            {/* Recommended Artists Header */}
            <div className="lux-ai-artists-header">
              <h3>Verified Artists Matching Your AI Query</h3>
              <p>100% Direct artist pricing · No middleman markup · Backed by 100% Arrival Guarantee</p>
            </div>

            {/* Artists Grid */}
            <div className="lux-ai-artists-grid">
              {results.artists && results.artists.length > 0 ? (
                results.artists.map((artist) => (
                  <div key={artist.id} className="lux-ai-artist-card">
                    <div className="lux-ai-artist-thumb-wrap">
                      <Image
                        src={artist.img || "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp"}
                        alt={artist.name}
                        width={400}
                        height={260}
                        className="lux-ai-artist-img"
                        unoptimized
                      />
                      <div className="lux-ai-artist-badge-row">
                        <span className="lux-ai-verified-tag">
                          <span>✓</span> Verified Pro
                        </span>
                        <span className="lux-ai-rating-tag">
                          ★ {artist.rating?.toFixed(1) || "5.0"}
                        </span>
                      </div>
                    </div>

                    <div className="lux-ai-artist-card-body">
                      <h4 className="lux-ai-artist-name">{artist.name}</h4>
                      
                      <div className="lux-ai-artist-category-row">
                        <span>{artist.category}</span>
                        <span>•</span>
                        <span className="lux-ai-artist-city">📍 {artist.city || "India"}</span>
                      </div>

                      <p className="lux-ai-artist-genres">
                        {artist.subCategory || "Bollywood, Ghazals, Sufi, Live Performance"}
                      </p>

                      <div className="lux-ai-artist-pricing-box">
                        <span className="lux-ai-price-label">Direct Rate</span>
                        <span className="lux-ai-price-value">
                          ₹{artist.price_min ? Number(artist.price_min).toLocaleString('en-IN') : "10,000"} - ₹{artist.price_max ? Number(artist.price_max).toLocaleString('en-IN') : "25,000"}
                        </span>
                      </div>

                      <div className="lux-ai-artist-card-actions">
                        <button
                          type="button"
                          onClick={() => handleBookArtist(artist.name)}
                          className="lux-ai-card-btn primary"
                        >
                          Book Artist
                        </button>
                        <a
                          href={`https://wa.me/918076515257?text=Hi%20Magnevents!%20I%20found%20${encodeURIComponent(artist.name)}%20via%20AI%20Search%20and%20want%20to%20check%20video%20samples%20and%20availability.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lux-ai-card-btn secondary"
                        >
                          Samples / WA
                        </a>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '40px', gridColumn: '1 / -1' }}>
                  <p>No direct matches found. Try broadening your city or genre filter!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* All Cities AI Exploration Section */}
        <AllCitiesSection 
          onCitySelect={(city) => {
            const cityPrompt = `Top verified live singers and bands in ${city.name} for event`;
            setQuery(cityPrompt);
            setSelectedCity(city.name);
            runAISearch(cityPrompt, city.name);
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
        />

        {/* SEO FAQ Section */}
        <section className="lux-ai-faq-box">
          <h3 className="lux-ai-faq-title">Frequently Asked Questions About AI Musician Matching</h3>
          <div className="lux-ai-faq-grid">
            <div className="lux-ai-faq-item">
              <h5>How does the Magnevents AI Search engine work?</h5>
              <p>
                Our AI analyzes natural language event prompts, identifying your event type, required audio equipment rider, song setlists, and budget. It then queries verified performers from our nationwide database to provide curated recommendations with authentic pricing.
              </p>
            </div>
            <div className="lux-ai-faq-item">
              <h5>Can artists travel to Bhubaneswar, Cuttack, and other cities?</h5>
              <p>
                Yes! Over 80% of our verified live bands and singers perform outstation. Magnevents manages travel logistics, local transit, and stay accommodations end-to-end.
              </p>
            </div>
            <div className="lux-ai-faq-item">
              <h5>What is the 100% Artist Arrival Guarantee?</h5>
              <p>
                Every booking on Magnevents is backed by a legal contract and escrow security. In any unforeseen emergency, Magnevents guarantees an immediate verified replacement performer of equal or superior caliber at no extra cost.
              </p>
            </div>
            <div className="lux-ai-faq-item">
              <h5>Are sound systems and microphones included?</h5>
              <p>
                Our AI recommends the exact acoustic setup for your guest size. Magnevents provides complete professional stage audio, mixers, monitors, and an on-site sound engineer at special discounted rates.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function AISearchPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0a090e' }} />}>
      <AISearchContent />
    </Suspense>
  );
}
