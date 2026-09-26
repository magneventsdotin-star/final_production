"use client";

import React from 'react';
import Link from 'next/link';

export const ALL_CITIES_DIRECTORY = [
  { name: "Varanasi", slug: "varanasi", tag: "Classical & Ghazal", icon: "🪕", badge: "Trending" },
  { name: "Delhi NCR", slug: "delhi", tag: "Live Bands & Sufi", icon: "🎸", badge: "Popular" },
  { name: "Mumbai", slug: "mumbai", tag: "Bollywood & Pop", icon: "🎙️", badge: "Popular" },
  { name: "Bangalore", slug: "bangalore", tag: "Rock & Indie Acoustic", icon: "⚡", badge: "Popular" },
  { name: "Bhubaneswar", slug: "bhubaneswar", tag: "Live Mehfils & Ghazal", icon: "🌹", badge: "Popular" },
  { name: "Kolkata", slug: "kolkata", tag: "Acoustic & Folk Live", icon: "🎻", badge: "Popular" },
  { name: "Pune", slug: "pune", tag: "Club DJs & Singers", icon: "🎧" },
  { name: "Hyderabad", slug: "hyderabad", tag: "Grand Wedding Bands", icon: "💍" },
  { name: "Jaipur", slug: "jaipur", tag: "Royal Folk & Sufi", icon: "👑" },
  { name: "Lucknow", slug: "lucknow", tag: "Ghazal & Nawabi Mehfil", icon: "✨" },
  { name: "Chandigarh", slug: "chandigarh", tag: "Punjabi Live Beats", icon: "🥁" },
  { name: "Ahmedabad", slug: "ahmedabad", tag: "Garba & Pop Nights", icon: "🪘" },
  { name: "Goa", slug: "goa", tag: "Beach Acoustic & Jazz", icon: "🌴" },
  { name: "Cuttack", slug: "cuttack", tag: "Live Melodies", icon: "🎵" },
  { name: "Indore", slug: "indore", tag: "House Party Live", icon: "🏠" },
  { name: "Surat", slug: "surat", tag: "Sangeet & Weddings", icon: "💃" },
  { name: "Patna", slug: "patna", tag: "Folk & Ghazals", icon: "🎤" },
  { name: "Bhopal", slug: "bhopal", tag: "Acoustic Nights", icon: "🎶" },
  { name: "Agra", slug: "agra", tag: "Sufi & Qawwali", icon: "🕌" },
  { name: "Kanpur", slug: "kanpur", tag: "Live Orchestra", icon: "🎺" },
  { name: "Guwahati", slug: "guwahati", tag: "Indie Rock Band", icon: "🎸" },
  { name: "Dehradun", slug: "dehradun", tag: "Mountain Vibes", icon: "🌲" },
  { name: "Ranchi", slug: "ranchi", tag: "Celebration Live", icon: "🎉" },
  { name: "Coimbatore", slug: "coimbatore", tag: "Fusion & Carnatic", icon: "🪈" },
  { name: "Kochi", slug: "kochi", tag: "Acoustic Indie", icon: "⛵" },
  { name: "Udaipur", slug: "udaipur", tag: "Destination Weddings", icon: "🏰" },
  { name: "Amritsar", slug: "amritsar", tag: "Sufi & Punjabi", icon: "🪕" },
  { name: "Raipur", slug: "raipur", tag: "Live Bands & DJs", icon: "🌟" }
];

export default function AllCitiesSection({
  currentCity = "",
  onCitySelect = null,
  title = null,
  subtitle = null,
  className = ""
}) {
  const displayTitle = title || (
    currentCity 
      ? `Explore Live Artists in ${currentCity} & Other Major Cities` 
      : "Explore Live Artists Across 30+ Major Cities"
  );

  const displaySubtitle = subtitle || "Instant AI matchmaking with local sound rider setups, verified talent availability, and direct 0% commission rates.";

  return (
    <section className={`lux-ai-cities-section ${className}`}>
      <div className="lux-ai-cities-header">
        <div className="lux-ai-cities-pill">
          <span>📍</span>
          <span>NATIONWIDE EVENT INTELLIGENCE</span>
        </div>
        <h3 className="lux-ai-cities-title">
          {displayTitle.includes("30+ Major Cities") ? (
            <>Explore Live Artists Across <span className="lux-ai-title-highlight">30+ Major Cities</span></>
          ) : (
            displayTitle
          )}
        </h3>
        <p className="lux-ai-cities-subtitle">
          {displaySubtitle}
        </p>
      </div>

      <div className="lux-ai-cities-grid">
        {ALL_CITIES_DIRECTORY.map((city) => {
          const isCurrent = currentCity && city.name.toLowerCase() === currentCity.toLowerCase();
          
          return (
            <div key={city.name} className={`lux-ai-city-card ${isCurrent ? 'is-active-city' : ''}`}>
              <div className="lux-ai-city-card-head">
                <span className="lux-ai-city-icon">{city.icon}</span>
                <div className="lux-ai-city-meta">
                  <h4 className="lux-ai-city-name">{city.name}</h4>
                  <span className="lux-ai-city-tag">{city.tag}</span>
                </div>
                {city.badge && (
                  <span className="lux-ai-city-badge">{city.badge}</span>
                )}
              </div>

              <div className="lux-ai-city-actions">
                {onCitySelect ? (
                  <button
                    type="button"
                    onClick={() => onCitySelect(city)}
                    className="lux-ai-city-action-btn primary"
                  >
                    <span>✨ AI Match</span>
                    <span>➔</span>
                  </button>
                ) : (
                  <Link
                    href={`/ai-search?q=${encodeURIComponent(`Top verified live singers and bands in ${city.name} for event`)}`}
                    className="lux-ai-city-action-btn primary"
                  >
                    <span>✨ AI Match</span>
                    <span>➔</span>
                  </Link>
                )}
                
                <Link href={`/city/${city.slug}`} className="lux-ai-city-action-btn secondary">
                  City Hub
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
