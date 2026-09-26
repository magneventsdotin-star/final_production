"use client";

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { bookingService } from '@/app/services/bookingService';
import '@/app/styles/components/SEOLandingHero.css';

const DEFAULT_FALLBACK_IMAGE = "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp";

// Helper to format default date to next week
const getNextWeekDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 7);
  return d.toISOString().split('T')[0];
};

const getMinDate = () => {
  return new Date().toISOString().split('T')[0];
};

export default function SEOLandingHero({
  heroTitle,
  heroSubtitle,
  category = "Artist",
  city = "Bhubaneswar",
  subCategory = "",
  topArtists = []
}) {
  const formRef = useRef(null);
  const phoneInputRef = useRef(null);

  const [selectedEventType, setSelectedEventType] = useState("Wedding / Reception");
  const [eventDate, setEventDate] = useState(getNextWeekDate());
  const [selectedBudget, setSelectedBudget] = useState("₹20,000 - ₹45,000 (Most Popular)");
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  // Quick 1-step phone modal for pricing tier check availability
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [activeTier, setActiveTier] = useState(null);
  const [quickPhone, setQuickPhone] = useState("");
  const [quickPhoneError, setQuickPhoneError] = useState("");
  const [quickSubmitting, setQuickSubmitting] = useState(false);
  const [quickSubmitted, setQuickSubmitted] = useState(false);
  const quickPhoneRef = useRef(null);

  const eventTypes = useMemo(() => [
    "Wedding / Reception",
    "Ghazal / Sufi Mehfil",
    "Private House Party",
    "Corporate Event",
    "Cocktail & Sangeet"
  ], []);

  const budgetTiers = useMemo(() => [
    {
      id: "solo",
      title: "Solo Acoustic / Harmonium",
      price: "₹10,000 - ₹20,000",
      desc: "Solo Ghazal & Sufi vocalist with harmonium or guitar. Perfect for intimate mehfils & home gatherings.",
      features: ["Vocalist + Instrument", "Up to 2.5 hrs live performance", "Ideal for 20-50 guests", "Direct sound guidance"]
    },
    {
      id: "trio",
      title: "Classic Ghazal & Sufi Trio",
      price: "₹20,000 - ₹45,000",
      isPopular: true,
      desc: "Lead Ghazal Singer + Tabla Master + Flute/Keyboardist. Most requested for wedding functions & Sangeet.",
      features: ["3-Piece Master Ensemble", "Up to 3 hrs live mehfil", "Ideal for 50-250 guests", "Full acoustic coordination"]
    },
    {
      id: "ensemble",
      title: "Grand Stage Ensemble / Band",
      price: "₹50,000 - ₹1,50,000+",
      desc: "Full 5-6 piece live ensemble with percussion, sound engineer & stage mics for grand celebrations.",
      features: ["Full 5-6 Piece Live Band", "Grand event sound setup", "Ideal for 250+ guests / luxury galas", "Celebrity performer option"]
    }
  ], []);

  // WhatsApp click handler
  const handleWhatsAppQuote = () => {
    const artistText = selectedArtist ? ` Preferred Performer: ${selectedArtist.name} (Fee: ~₹${selectedArtist.price_min?.toLocaleString('en-IN')}).` : '';
    const text = `Hi Magnevents! I want to check availability & get a price list for a ${category} in ${city}.${artistText} Event Type: ${selectedEventType}, Tentative Date: ${eventDate}, Budget: ${selectedBudget}. Please share available profiles and performance clips.`;
    window.open(`https://wa.me/918076515257?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Direct 1-Step Form Submission
  const handleInlineSubmit = async (e) => {
    e.preventDefault();
    setPhoneError("");

    // Validate 10-digit phone
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setPhoneError("Please enter a valid 10-digit mobile number");
      if (phoneInputRef.current) phoneInputRef.current.focus();
      return;
    }

    setIsSubmitting(true);

    try {
      await bookingService.submitRequest({
        name: name.trim() || 'Event Host',
        phone: cleanPhone,
        eventType: selectedEventType,
        date: eventDate,
        budget: selectedBudget,
        selectedArtist: selectedArtist ? selectedArtist.name : null,
        category: category,
        city: city,
        service: `${category} in ${city}`,
        formName: `SEO Instant Lead Engine - ${category} in ${city}`,
        formLink: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#instant-lead` : '',
        formType: 'booking',
        message: `Direct SEO Lead for ${category} in ${city}. Event: ${selectedEventType} on ${eventDate}. Budget: ${selectedBudget}.${selectedArtist ? ` Preferred Performer: ${selectedArtist.name}.` : ''}`
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error("Booking submission error:", err);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Select an artist and focus phone input
  const handleSelectArtist = (artist) => {
    setSelectedArtist(artist);
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setTimeout(() => {
      if (phoneInputRef.current) phoneInputRef.current.focus();
    }, 400);
  };

  // Select a tier and open 1-step quick phone modal
  const handleSelectTier = (tier) => {
    setActiveTier(tier);
    setSelectedBudget(`${tier.title} (${tier.price})`);
    setQuickPhone(phone || "");
    setQuickPhoneError("");
    setQuickSubmitted(false);
    setTierModalOpen(true);
    setTimeout(() => {
      if (quickPhoneRef.current) quickPhoneRef.current.focus();
    }, 150);
  };

  const handleQuickTierSubmit = async (e) => {
    e.preventDefault();
    setQuickPhoneError("");

    const clean = (quickPhone || '').replace(/[^0-9]/g, '');
    if (clean.length < 10) {
      setQuickPhoneError("Please enter a valid 10-digit mobile number");
      return;
    }

    setQuickSubmitting(true);
    try {
      await bookingService.submitRequest({
        name: name.trim() || 'Event Host',
        phone: quickPhone,
        eventType: `${activeTier?.title || category} Booking`,
        budget: activeTier?.price || 'TBD',
        selectedPlan: activeTier ? {
          name: activeTier.title,
          price: activeTier.price,
          tagline: activeTier.desc,
          features: activeTier.features
        } : null,
        category: category,
        city: city,
        keywords: `${category}, ${activeTier?.title || ''}, ${city}`,
        formName: `Pricing Tier Quick Check - ${activeTier?.title || 'Package'} in ${city}`,
        formLink: typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}#pricing` : '',
        formType: 'booking',
        message: `Package Inquiry for ${activeTier?.title} (${activeTier?.price}) in ${city}. Features: ${activeTier?.features?.join(', ')}. Checking live artist availability.`
      });

      setQuickSubmitted(true);
    } catch (err) {
      console.error("Quick tier submission error:", err);
      setQuickSubmitted(true);
    } finally {
      setQuickSubmitting(false);
    }
  };

  const handleImageError = (artistId) => {
    setImageErrors(prev => ({ ...prev, [artistId]: true }));
  };

  return (
    <section className="seo-hero-root">
      <div className="seo-hero-backdrop-glow" aria-hidden="true" />

      <div className="seo-hero-container">
        {/* ==========================================================================
           1. Top Trust & Social Proof: 5,000+ Events Done Across India Banner
           ========================================================================== */}
        <div className="seo-5k-badge-wrap">
          <div className="seo-5k-events-badge">
            <div className="seo-avatar-stack">
              {topArtists && topArtists.length > 0 ? (
                topArtists.slice(0, 4).map((a, i) => (
                  <img
                    key={a.id || i}
                    src={a.img || DEFAULT_FALLBACK_IMAGE}
                    alt={a.name}
                    className="seo-stack-avatar"
                  />
                ))
              ) : (
                <img
                  src={DEFAULT_FALLBACK_IMAGE}
                  alt="Artist"
                  className="seo-stack-avatar"
                />
              )}
              <span className="seo-avatar-count">+5k</span>
            </div>
            <div className="seo-5k-text">
              <strong>We Have Done 5,000+ Events Across India</strong>
              <span>⭐ 4.9/5 Rating (5,000+ Live Bookings) · Verified Performers</span>
            </div>
          </div>
        </div>

        {/* Location & Trust Badges */}
        <div className="seo-trust-strip">
          <span className="seo-pill-badge highlight">
            <span className="seo-pill-pulse" />
            Verified Performers · {city}
          </span>
          <span className="seo-pill-badge verified">
            ✓ 100% Artist Arrival Guarantee
          </span>
          <span className="seo-pill-badge">
            ⚡ Direct Pricing · 0% Agency Markup
          </span>
        </div>

        {/* Hero Header & Title */}
        <div className="seo-hero-header">
          <h1 className="seo-hero-title">
            <span className="seo-hero-gradient-text">{heroTitle}</span>
          </h1>
          <p className="seo-hero-subtitle">
            {heroSubtitle || `Book verified, celebrated ${category}s directly for weddings, private mehfils, corporate galas & celebrations in ${city}. Over 5,000+ live events successfully executed across India.`}
          </p>

          {/* Social Proof & Urgency Bar */}
          <div className="seo-live-social-proof">
            <span className="seo-live-dot" />
            <span className="seo-live-text">
              🔥 <strong>4 Event Hosts</strong> in {city} requested quotes this week · Avg reply <strong>6 mins</strong>
            </span>
          </div>

          {/* Quick Query Pills */}
          <div className="seo-query-pills" role="tablist" aria-label="Event category options">
            {eventTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedEventType(type)}
                className={`seo-query-chip ${selectedEventType === type ? 'active' : ''}`}
              >
                <span>{type === 'Wedding / Reception' ? '💍' : type.includes('Ghazal') ? '🍷' : type.includes('Corporate') ? '🏢' : '🎵'}</span>
                <span>{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ==========================================================================
           2. Top 5 Verified Artists Showcase Section (SHOWN AT THE TOP FIRST WITH IMAGES!)
           ========================================================================== */}
        {topArtists && topArtists.length > 0 && (
          <div className="seo-top-artists-section">
            <div className="seo-section-head-v2">
              <div>
                <span className="badge">👑 TOP 5 CURATED PERFORMERS</span>
                <h2>Top 5 Verified {category}s for {city}</h2>
                <p>Browse real photos, audience ratings & live booking fees from our active database.</p>
              </div>
              <Link href="/artists" className="seo-browse-all-link">
                <span>Browse All 500+ Artists</span>
                <span>→</span>
              </Link>
            </div>

            {/* 5 Cards Grid with Images */}
            <div className="seo-artists-cards-grid">
              {topArtists.map((artist, idx) => {
                const isSelected = selectedArtist?.id === artist.id;
                const imgSrc = (imageErrors[artist.id] || !artist.img)
                  ? DEFAULT_FALLBACK_IMAGE
                  : artist.img;

                return (
                  <article
                    key={artist.id || idx}
                    className={`seo-artist-card ${isSelected ? 'is-active-selection' : ''}`}
                    onClick={() => handleSelectArtist(artist)}
                  >
                    {/* Image Area */}
                    <div className="seo-card-img-wrap">
                      <Image
                        src={imgSrc}
                        alt={`Photo of ${artist.name}`}
                        fill
                        sizes="(max-width: 768px) 260px, (max-width: 1200px) 25vw, 20vw"
                        style={{ objectFit: 'cover' }}
                        onError={() => handleImageError(artist.id)}
                        loading={idx < 3 ? "eager" : "lazy"}
                      />
                      <div className="seo-card-gradient-overlay" />

                      {/* Floating City / Travel Tag */}
                      <span className={`seo-card-floating-badge ${artist.isFromCity ? 'local' : 'travel'}`}>
                        {artist.isFromCity ? `📍 In ${city}` : `✈️ Performs in ${city}`}
                      </span>

                      {/* Floating Rating Badge */}
                      <span className="seo-card-rating-badge">
                        <span>★</span>
                        <span>{Number(artist.rating || 5).toFixed(1)}</span>
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="seo-card-body">
                      <div>
                        <span className="seo-card-category-tag" title={artist.subCategory || artist.category}>
                          {artist.subCategory ? artist.subCategory.split(',').slice(0, 2).join(' · ') : artist.category}
                        </span>
                        <h3 className="seo-card-name" title={artist.name}>
                          {artist.name}
                        </h3>
                        <div className="seo-card-city">
                          <span>📍 {artist.city || 'India'}</span>
                          <span>·</span>
                          <span>{artist.successful_bookings || 15}+ Events</span>
                        </div>
                      </div>

                      {/* Price Row */}
                      <div className="seo-card-price-row">
                        <span className="seo-card-price-label">Starting Fee</span>
                        <span className="seo-card-price-val">
                          ₹{artist.price_min ? artist.price_min.toLocaleString('en-IN') : '10,000'}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="seo-card-actions">
                        <button
                          type="button"
                          className="seo-card-btn-book"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectArtist(artist);
                          }}
                        >
                          <span>⚡ Book</span>
                        </button>

                        <Link
                          href={`/artist/${artist.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="seo-card-btn-profile"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Profile
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* ==========================================================================
           3. Direct 1-Step Lead Engine (NO MODAL NEEDED TO SUBMIT!)
           ========================================================================== */}
        <div ref={formRef} id="seo-lead-form" className="seo-interactive-booking-card">
          {!isSubmitted ? (
            <form onSubmit={handleInlineSubmit}>
              <div className="seo-booking-header">
                <div className="seo-booking-title-group">
                  <h3>
                    <span>⚡ Get Instant {category} Price List & Availability in {city}</span>
                  </h3>
                  <p>Direct artist rates sent to your WhatsApp in 5 minutes · Zero spam</p>
                </div>
                <div className="seo-fast-response-tag">
                  <span>⏱️ 5-Min WhatsApp Reply</span>
                </div>
              </div>

              {/* If user clicked an artist to feature in inquiry */}
              <AnimatePresence>
                {selectedArtist && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="seo-selected-artist-bar"
                  >
                    <span>
                      🎯 Target Performer Selected: <strong>{selectedArtist.name}</strong> (~₹{selectedArtist.price_min?.toLocaleString('en-IN')})
                    </span>
                    <button type="button" onClick={() => setSelectedArtist(null)}>
                      Clear selection
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Input Grid */}
              <div className="seo-booking-grid">
                {/* Mobile / WhatsApp Number (PRIMARY HIGH-CONVERTING INPUT) */}
                <div className="seo-input-group">
                  <label htmlFor="seo-phone">
                    <span>WhatsApp / Mobile Number *</span>
                  </label>
                  <div className="seo-phone-input-wrap">
                    <span className="seo-phone-prefix">🇮🇳 +91</span>
                    <input
                      ref={phoneInputRef}
                      id="seo-phone"
                      type="tel"
                      maxLength={15}
                      placeholder="Enter 10-digit mobile"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (phoneError) setPhoneError("");
                      }}
                      className="seo-phone-input"
                      required
                    />
                  </div>
                  {phoneError && <span className="seo-input-error">{phoneError}</span>}
                </div>

                {/* Event Type */}
                <div className="seo-input-group">
                  <label htmlFor="seo-event-type">
                    <span>Event Type</span>
                  </label>
                  <select
                    id="seo-event-type"
                    value={selectedEventType}
                    onChange={(e) => setSelectedEventType(e.target.value)}
                    className="seo-input-control"
                  >
                    {eventTypes.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                {/* Event Date */}
                <div className="seo-input-group">
                  <label htmlFor="seo-event-date">
                    <span>Event Date</span>
                  </label>
                  <input
                    id="seo-event-date"
                    type="date"
                    min={getMinDate()}
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="seo-input-control"
                  />
                </div>

                {/* Name (Optional for zero-friction) */}
                <div className="seo-input-group">
                  <label htmlFor="seo-name">
                    <span>Your Name (Optional)</span>
                  </label>
                  <input
                    id="seo-name"
                    type="text"
                    placeholder="E.g. Rajesh Kumar"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="seo-input-control"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="seo-booking-actions">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="seo-btn-submit"
                >
                  {isSubmitting ? (
                    <span>⏳ Checking Availability...</span>
                  ) : (
                    <span>⚡ Send Me Available Artists & Price List</span>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleWhatsAppQuote}
                  className="seo-btn-whatsapp"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.437 0 9.857-4.403 9.86-9.809.001-2.618-1.01-5.08-2.858-6.93C16.528 2.015 14.07 1.006 11.453 1.006c-5.434 0-9.852 4.403-9.855 9.81-.001 2.062.54 4.079 1.566 5.86l-.99 3.613 3.712-.977zm11.304-6.816c-.302-.15-1.788-.882-2.066-.983-.277-.101-.478-.15-.678.15-.2.3-.775.983-.95 1.185-.175.201-.35.227-.652.076-.302-.15-1.274-.469-2.427-1.498-.897-.8-1.502-1.788-1.678-2.09-.175-.302-.019-.465.132-.615.136-.135.302-.35.454-.526.15-.176.2-.302.302-.503.101-.2.05-.376-.026-.526-.075-.15-.678-1.636-.93-2.243-.244-.59-.493-.51-.678-.518-.176-.008-.377-.01-.578-.01-.2 0-.527.075-.803.376-.277.301-1.055 1.031-1.055 2.516 0 1.485 1.079 2.921 1.229 3.122.15.2 2.125 3.245 5.148 4.549.719.311 1.28.497 1.717.637.722.23 1.38.197 1.901.12.58-.087 1.788-.73 2.04-1.435.252-.703.252-1.306.176-1.435-.076-.13-.277-.201-.578-.352z"/>
                  </svg>
                  <span>Chat Directly on WhatsApp</span>
                </button>
              </div>

              <div className="seo-form-guarantee-note">
                <span>🔒 100% Free Service</span>
                <span>•</span>
                <span>🛡️ Direct Artist Pricing</span>
                <span>•</span>
                <span>⚡ Zero Spam Policy</span>
              </div>
            </form>
          ) : (
            /* Instant Animated Success Confirmation Screen */
            <div className="seo-success-box">
              <div className="seo-success-icon">✓</div>
              <h3>Inquiry Received for {city}!</h3>
              <p>
                Thank you{name ? `, ${name}` : ''}! Our dedicated {city} entertainment manager is preparing available {category} profiles, video clips, and customized price packages for your event on {eventDate}.
              </p>
              <div className="seo-success-actions">
                <button
                  type="button"
                  onClick={handleWhatsAppQuote}
                  className="seo-btn-whatsapp"
                  style={{ minWidth: '240px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.437 0 9.857-4.403 9.86-9.809.001-2.618-1.01-5.08-2.858-6.93C16.528 2.015 14.07 1.006 11.453 1.006c-5.434 0-9.852 4.403-9.855 9.81-.001 2.062.54 4.079 1.566 5.86l-.99 3.613 3.712-.977zm11.304-6.816c-.302-.15-1.788-.882-2.066-.983-.277-.101-.478-.15-.678.15-.2.3-.775.983-.95 1.185-.175.201-.35.227-.652.076-.302-.15-1.274-.469-2.427-1.498-.897-.8-1.502-1.788-1.678-2.09-.175-.302-.019-.465.132-.615.136-.135.302-.35.454-.526.15-.176.2-.302.302-.503.101-.2.05-.376-.026-.526-.075-.15-.678-1.636-.93-2.243-.244-.59-.493-.51-.678-.518-.176-.008-.377-.01-.578-.01-.2 0-.527.075-.803.376-.277.301-1.055 1.031-1.055 2.516 0 1.485 1.079 2.921 1.229 3.122.15.2 2.125 3.245 5.148 4.549.719.311 1.28.497 1.717.637.722.23 1.38.197 1.901.12.58-.087 1.788-.73 2.04-1.435.252-.703.252-1.306.176-1.435-.076-.13-.277-.201-.578-.352z"/>
                  </svg>
                  <span>Open WhatsApp to Fast-Track</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '12px 20px', borderRadius: '12px', cursor: 'pointer', fontSize: '13px' }}
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ==========================================================================
           4. Interactive 3-Tier Price Guide (Answers "How much does it cost?")
           ========================================================================== */}
        <div className="seo-pricing-guide-section">
          <div className="seo-section-head-v2" style={{ textAlign: 'center', justifyContent: 'center' }}>
            <div>
              <span className="badge">TRANSPARENT PRICING</span>
              <h2>{category} Pricing Packages in {city}</h2>
              <p>Direct artist fees with no hidden charges. Select a package to check live availability.</p>
            </div>
          </div>

          <div className="seo-pricing-cards-grid">
            {budgetTiers.map((tier) => (
              <div key={tier.id} className={`seo-tier-card ${tier.isPopular ? 'featured-tier' : ''}`}>
                {tier.isPopular && <span className="seo-tier-badge">Most Popular in {city}</span>}
                <div className="seo-tier-header">
                  <h4>{tier.title}</h4>
                  <div className="seo-tier-price">{tier.price}</div>
                  <p className="seo-tier-desc">{tier.desc}</p>
                </div>

                <ul className="seo-tier-features">
                  {tier.features.map((feat, idx) => (
                    <li key={idx}>
                      <span>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => handleSelectTier(tier)}
                  className="seo-tier-btn"
                >
                  Select & Check Availability
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* ==========================================================================
           5. Trust & Guarantee Bar
           ========================================================================== */}
        <div className="seo-guarantee-bar">
          <div className="seo-guarantee-item">
            <div className="seo-guarantee-icon">🛡️</div>
            <div className="seo-guarantee-text">
              <h4>100% Artist Arrival Guarantee</h4>
              <p>Direct legally-backed artist contracts with emergency backup arrangements.</p>
            </div>
          </div>

          <div className="seo-guarantee-item">
            <div className="seo-guarantee-icon">🎙️</div>
            <div className="seo-guarantee-text">
              <h4>Full Stage & Sound Assistance</h4>
              <p>Technical rider coordination, professional audio & mics setup for your venue.</p>
            </div>
          </div>

          <div className="seo-guarantee-item">
            <div className="seo-guarantee-icon">🔒</div>
            <div className="seo-guarantee-text">
              <h4>Secure Escrow Payments</h4>
              <p>Your advance is safe in escrow and only disbursed post performance completion.</p>
            </div>
          </div>

          <div className="seo-guarantee-item">
            <div className="seo-guarantee-icon">⚡</div>
            <div className="seo-guarantee-text">
              <h4>Dedicated Event Coordinator</h4>
              <p>Personal manager assigned to handle timing, song choices, and artist arrival.</p>
            </div>
          </div>
        </div>

      </div>

      {/* ==========================================================================
         6. Mobile Sticky Action Bar
         ========================================================================== */}
      <div className="seo-mobile-sticky-bar">
        <button
          type="button"
          onClick={() => {
            if (formRef.current) {
              formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            if (phoneInputRef.current) phoneInputRef.current.focus();
          }}
          className="seo-sticky-btn-quote"
        >
          <span>⚡ Get Instant Free Quote</span>
        </button>

        <button
          type="button"
          onClick={handleWhatsAppQuote}
          className="seo-sticky-btn-wa"
        >
          <span>💬 WhatsApp Rates</span>
        </button>
      </div>

      {/* ==========================================================================
         7. Quick Tier Availability Modal (1-Step Phone Only Form)
         ========================================================================== */}
      <AnimatePresence>
        {tierModalOpen && activeTier && (
          <motion.div
            className="seo-tier-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setTierModalOpen(false)}
          >
            <motion.div
              className="seo-tier-modal-card"
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                className="seo-tier-modal-close"
                onClick={() => setTierModalOpen(false)}
                aria-label="Close dialog"
              >
                ✕
              </button>

              {!quickSubmitted ? (
                <form onSubmit={handleQuickTierSubmit}>
                  <div className="seo-tier-modal-tag">
                    <span>⚡ INSTANT AVAILABILITY CHECK</span>
                  </div>

                  <h3 className="seo-tier-modal-title">
                    Check Live Availability
                  </h3>
                  <p className="seo-tier-modal-sub">
                    Direct artist pricing with 0% middleman fees. Enter your phone number to receive instant quote & live availability in {city}.
                  </p>

                  <div className="seo-tier-selected-box">
                    <div className="seo-tier-selected-left">
                      <h5>{activeTier.title}</h5>
                      <span>📍 {city} • {category}</span>
                    </div>
                    <div className="seo-tier-selected-price">
                      {activeTier.price}
                    </div>
                  </div>

                  <label className="seo-tier-phone-label" htmlFor="seo-quick-phone">
                    Your Mobile Number (For Instant WhatsApp Quotes) *
                  </label>

                  <div className="seo-tier-phone-wrap">
                    <div className="seo-tier-phone-flag">
                      <span>🇮🇳</span>
                      <span>+91</span>
                    </div>
                    <input
                      ref={quickPhoneRef}
                      id="seo-quick-phone"
                      type="tel"
                      value={quickPhone}
                      onChange={(e) => {
                        setQuickPhone(e.target.value);
                        if (quickPhoneError) setQuickPhoneError("");
                      }}
                      placeholder="e.g. 98765 43210"
                      className="seo-tier-phone-input"
                      maxLength={14}
                      autoFocus
                    />
                  </div>

                  {quickPhoneError && (
                    <span className="seo-tier-phone-err">{quickPhoneError}</span>
                  )}

                  <button
                    type="submit"
                    disabled={quickSubmitting}
                    className="seo-tier-submit-btn"
                  >
                    {quickSubmitting ? (
                      <span>⏳ Checking Live Availability...</span>
                    ) : (
                      <>
                        <span>Check Availability & Send Quotes</span>
                        <span>→</span>
                      </>
                    )}
                  </button>

                  <div className="seo-tier-guarantee-note">
                    <span>🔒 100% Free Service</span>
                    <span>•</span>
                    <span>⚡ Reply in 6 Mins</span>
                    <span>•</span>
                    <span>🛡️ Direct Artist Fees</span>
                  </div>
                </form>
              ) : (
                <div className="seo-tier-success-box">
                  <div className="seo-tier-success-icon">✓</div>
                  <h3 className="seo-tier-modal-title" style={{ color: '#10b981' }}>
                    Availability Request Sent!
                  </h3>
                  <p className="seo-tier-modal-sub">
                    We received your check for <strong>{activeTier.title}</strong> ({activeTier.price}) in <strong>{city}</strong>. Our artist coordinator will WhatsApp verified singer availability and video clips to <strong>{quickPhone}</strong> within 6 minutes.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '20px' }}>
                    <a
                      href={`https://wa.me/918076515257?text=${encodeURIComponent(`Hi Magnevents, I just requested availability for ${activeTier.title} (${activeTier.price}) in ${city}. Please share available artists.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="seo-btn-whatsapp"
                      style={{ width: '100%', justifyContent: 'center' }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.458L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.725 1.451 5.437 0 9.857-4.403 9.86-9.809.001-2.618-1.01-5.08-2.858-6.93C16.528 2.015 14.07 1.006 11.453 1.006c-5.434 0-9.852 4.403-9.855 9.81-.001 2.062.54 4.079 1.566 5.86l-.99 3.613 3.712-.977zm11.304-6.816c-.302-.15-1.788-.882-2.066-.983-.277-.101-.478-.15-.678.15-.2.3-.775.983-.95 1.185-.175.201-.35.227-.652.076-.302-.15-1.274-.469-2.427-1.498-.897-.8-1.502-1.788-1.678-2.09-.175-.302-.019-.465.132-.615.136-.135.302-.35.454-.526.15-.176.2-.302.302-.503.101-.2.05-.376-.026-.526-.075-.15-.678-1.636-.93-2.243-.244-.59-.493-.51-.678-.518-.176-.008-.377-.01-.578-.01-.2 0-.527.075-.803.376-.277.301-1.055 1.031-1.055 2.516 0 1.485 1.079 2.921 1.229 3.122.15.2 2.125 3.245 5.148 4.549.719.311 1.28.497 1.717.637.722.23 1.38.197 1.901.12.58-.087 1.788-.73 2.04-1.435.252-.703.252-1.306.176-1.435-.076-.13-.277-.201-.578-.352z"/>
                      </svg>
                      <span>Fast-Track on WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setTierModalOpen(false)}
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,0.2)',
                        color: '#cbd5e1',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}
                    >
                      Done / Close
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
