"use client"

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@database/connection/supabase';
import Image from 'next/image';
import '@/app/styles/pages/ArtistProfile.css';

const CLOUDFLARE_BASE = process.env.NEXT_PUBLIC_CLOUDFLARE_BASE_URL || 'https://customer-placeholder.cloudflarestream.com/';

const constructCloudflareUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${CLOUDFLARE_BASE}${url}/watch`;
};

const StarRating = ({ rating }) => {
  return (
    <div style={{ display: 'flex', gap: '4px', color: '#FFE032' }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill={i < rating ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
};

const InteractiveVideoCard = ({ vid }) => {
  const [isMuted, setIsMuted] = useState(true);
  
  const url = vid.video_url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url?.match(regExp);
  const ytId = (match && match[2].length === 11) ? match[2] : null;

  const toggleMute = (e) => {
    e.stopPropagation();
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    const iframe = e.currentTarget.parentElement.querySelector('iframe');
    const nativeVideo = e.currentTarget.parentElement.querySelector('video');
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: newMutedState ? 'mute' : 'unMute',
        args: []
      }), '*');
    }
    if (nativeVideo) {
      nativeVideo.muted = newMutedState;
    }
  };

  return (
    <div className="modern-video-card" style={{ 
      borderRadius: '20px', overflow: 'hidden', background: '#0a0a0a', 
      border: '1px solid rgba(255,255,255,0.05)', aspectRatio: '9/16',
      position: 'relative', boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      {ytId ? (
        <div style={{ position: 'absolute', inset: -40, pointerEvents: 'none' }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&controls=0&autoplay=1&mute=1&playsinline=1&iv_load_policy=3&fs=0&loop=1&playlist=${ytId}&enablejsapi=1`}
            style={{ width: '100%', height: '100%', border: 'none', objectFit: 'cover', transform: 'scale(1.4)' }}
            allow="autoplay; encrypted-media"
            allowFullScreen
          />
        </div>
      ) : (
        <video 
          src={url}
          autoPlay
          muted={isMuted}
          loop
          playsInline
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }}
        />
      )}
      
      {/* Invisible overlay to catch clicks */}
      <div 
        onClick={toggleMute}
        style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: 'pointer' }}
      >
        <div style={{ 
          position: 'absolute', top: '16px', right: '16px', 
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)',
          borderRadius: '50%', width: '36px', height: '36px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '18px'
        }}>
          {isMuted ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><line x1="23" y1="9" x2="17" y2="15"></line><line x1="17" y1="9" x2="23" y2="15"></line></svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
          )}
        </div>
      </div>
      
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, padding: '40px 20px 24px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 60%, transparent 100%)', 
        color: 'white', fontWeight: '800', fontSize: '16px', zIndex: 11,
        letterSpacing: '0.02em', textTransform: 'uppercase',
        pointerEvents: 'none'
      }}>
        {vid.topic || 'Live Performance'}
      </div>
    </div>
  );
};

const ExpandableBio = ({ bio }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bioText = bio || "This artist is a spectacular performer known for bringing high energy and unforgettable moments to every stage. Whether it's a corporate event, a private wedding, or a grand festival, their versatile talent ensures the crowd is always engaged and amazed.";
  
  const shouldClamp = bioText.length > 150;
  
  return (
    <div className="bio-block">
      <h2 className="section-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
        Professional Bio
      </h2>
      <div style={{ position: 'relative' }}>
        <p className={`bio-text-content ${!isExpanded ? 'clamped' : ''}`}>
          {bioText}
        </p>
        
        {shouldClamp && (
          <button 
            className="bio-see-more-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : 'See More'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default function ArtistProfilePage({ params }) {
  const [artist, setArtist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);

  const decodedId = decodeURIComponent(params.id);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      try {
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decodedId);
        
        let query = supabase.from('artists').select('*, artist_images(image_url)').eq('is_live', true);
        
        if (isUUID) {
          query = query.eq('id', decodedId);
        } else {
          // Allow SEO slugs (e.g., neha-kakkar) to match database names (Neha Kakkar)
          const searchTerm = decodedId.replace(/-/g, ' ');
          query = query.or(`alias.ilike.%${searchTerm}%,name.ilike.%${searchTerm}%`);
        }

        let { data, error } = await query.limit(1).single();

        if (data) {
          setArtist(data);
          const { data: vids } = await supabase
            .from('service_videos')
            .select('*')
            .or(`userName.ilike.%${data.alias || data.name}%,artistName.ilike.%${data.alias || data.name}%`);
          
          let allVids = [];
          if (data.cloudflare_video_url) {
            const cfUrls = data.cloudflare_video_url.split(',').map(u => u.trim()).filter(Boolean);
            allVids = [...allVids, ...cfUrls.map((url, idx) => ({ id: `cf-${idx}`, video_url: constructCloudflareUrl(url) }))];
          }
          if (vids && vids.length > 0) {
            allVids = [...allVids, ...vids];
          } else if (data.video_url) {
            const ytUrls = data.video_url.split(',').map(u => u.trim()).filter(Boolean);
            allVids = [...allVids, ...ytUrls.map((url, idx) => ({ id: `yt-${idx}`, video_url: url }))];
          }
          setVideos(allVids);
        } else {
          const { data: svData, error: svError } = await supabase
            .from('service_videos')
            .select('*')
            .or(`userName.ilike.%${decodedId}%,artistName.ilike.%${decodedId}%`);

          if (svData && svData.length > 0) {
            const firstVideo = svData[0];
            setArtist({
              name: firstVideo.userName,
              category: firstVideo.category,
              sub_category: firstVideo.artistType,
              bio: firstVideo.artistBio || 'A highly talented performer ready to elevate your event.',
              city: 'Global',
              state: '',
              performing_language: 'English, Regional',
              price_min: null,
              exclusive_price: null,
              artist_images: []
            });
            setVideos(svData);
          }
        }
      } catch (err) {
        console.error("Error fetching artist profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [decodedId]);

  useEffect(() => {
    if (artist && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('book') === 'true') {
        const name = artist.alias || artist.name;
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: { name, category: artist.category } } }));
        }, 100);
      }
    }
  }, [artist]);

  if (loading) {
    return (
      <main className="artist-profile-wrapper">
        <style>{`
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .skeleton-box {
            background: linear-gradient(90deg, #1A1D24 25%, #2A2E39 50%, #1A1D24 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 8px;
          }
          @media (max-width: 768px) {
            .skeleton-hero-bg { height: 120vw !important; }
            .skeleton-stats { display: none !important; }
          }
        `}</style>
        <div className="artist-container">
          <section className="artist-hero-card" style={{ background: '#0F1117' }}>
            <div className="skeleton-box skeleton-hero-bg" style={{ width: '100%', height: '600px', position: 'absolute', top: 0, left: 0 }} />
            <div className="hero-gradient-overlay" />
            
            <div className="hero-content">
              <div className="hero-text-area" style={{ zIndex: 4, width: '100%', maxWidth: '600px' }}>
                <div className="artist-badges">
                  <div className="skeleton-box" style={{ width: '100px', height: '24px', borderRadius: '100px' }} />
                  <div className="skeleton-box" style={{ width: '80px', height: '24px', borderRadius: '100px' }} />
                </div>
                
                <div className="skeleton-box" style={{ width: '80%', height: 'clamp(48px, 6vw, 84px)', marginBottom: '24px', borderRadius: '12px' }} />
                
                <div className="artist-genres">
                  <div className="skeleton-box" style={{ width: '120px', height: '26px', borderRadius: '100px' }} />
                  <div className="skeleton-box" style={{ width: '90px', height: '26px', borderRadius: '100px' }} />
                </div>

                <div className="hero-actions">
                  <div className="skeleton-box" style={{ width: '160px', height: '48px', borderRadius: '100px' }} />
                  <div className="skeleton-box" style={{ width: '140px', height: '48px', borderRadius: '100px' }} />
                </div>
              </div>

              <div className="skeleton-box skeleton-stats" style={{ width: '320px', height: '120px', borderRadius: '24px', zIndex: 4 }} />
            </div>
          </section>
        </div>
      </main>
    );
  }

  if (!artist) {
    return (
      <div className="artist-profile-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <h1 style={{ color: 'white' }}>Artist not found</h1>
      </div>
    );
  }

  const name = artist.alias || artist.name;
  const categories = [artist.category, artist.sub_category, artist.genre, artist.genres, artist.tags].filter(Boolean).join(', ');
  const coverImage = artist.artist_images && artist.artist_images.length > 0 
    ? artist.artist_images[0].image_url 
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop'; 

  return (
    <main className="artist-profile-wrapper">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Person",
            "name": name,
            "description": artist.bio || `Hire ${name}, a professional ${artist.category || 'artist'} from ${artist.city || 'India'} for your next event.`,
            "image": coverImage,
            "jobTitle": artist.category || "Live Performer",
            "url": typeof window !== 'undefined' ? window.location.href : '',
            "sameAs": [],
            "aggregateRating": artist.successful_bookings > 0 ? {
              "@type": "AggregateRating",
              "ratingValue": (artist.rating || 4.5).toFixed(1),
              "reviewCount": artist.successful_bookings || 10
            } : undefined
          })
        }}
      />
      <div className="artist-container">
        
        <section className="artist-hero-card">
          <div className="hero-bg-image" style={{ backgroundImage: `url(${coverImage})` }} />
          <div className="hero-gradient-overlay" />
          
          <div className="hero-content">
            <div className="hero-text-area">
              <div className="artist-badges">
                <span className="badge-item glass-badge">★ Premium Artist</span>
                {artist.category && <span className="badge-item glass-badge">{artist.category}</span>}
              </div>
              
              <h1 className="artist-name">{name}</h1>
              
              <div className="artist-genres">
                {categories ? categories.split(',').filter(cat => cat.trim() !== '').map((cat, i) => (
                  <span key={i} className="genre-pill">{cat.trim()}</span>
                )) : (
                  <span className="genre-pill">Live Performer</span>
                )}
              </div>

              <div className="hero-actions">
                <button className="btn-primary-elegant" onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: { name } } }))}>
                  Book Performance
                </button>
                <button className="btn-secondary-elegant" onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: { name } } }))}>
                  Contact Now
                </button>
              </div>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">{(artist.rating || 0).toFixed(1)}</div>
                <div className="stat-label" style={{ marginTop: '4px' }}>
                  <StarRating rating={Math.round(artist.rating || 0)} />
                </div>
                <div className="stat-sublabel">Rating</div>
              </div>
              {artist.successful_bookings > 0 && (
                <>
                  <div className="stat-divider" />
                  <div className="stat-item">
                    <div className="stat-value">{artist.successful_bookings}</div>
                    <div style={{ height: '14px' }} />
                    <div className="stat-sublabel">SHOWS</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        <section className="info-section" style={{ marginTop: '40px' }}>
          <h2 className="section-title">Performance Formats & Videos</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', marginTop: '20px' }}>
            {videos.length > 0 ? videos.map((vid, idx) => (
              <InteractiveVideoCard key={idx} vid={vid} />
            )) : (
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>No videos available for this artist yet.</p>
            )}
          </div>
        </section>

        <section className="info-section" style={{ marginTop: '40px' }}>
          <h2 className="section-title">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            Artist Information
          </h2>
          
          <div className="info-grid">
            <div className="info-card">
              <div className="info-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
              </div>
              <span className="info-label">Location</span>
              <span className="info-value">{artist.city || 'Global'}</span>
            </div>
            
            <div className="info-card">
              <div className="info-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>
              <span className="info-label">Category</span>
              <span className="info-value">{artist.category || 'Live Musician'}</span>
            </div>
            
            <div className="info-card">
              <div className="info-icon-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.54 15H17a2 2 0 0 0-2 2v4.54"></path><path d="M7 3.34V5a3 3 0 0 0 3 3v0a2 2 0 0 1 2 2v0c0 1.1.9 2 2 2v0a2 2 0 0 0 2-2v0c0-1.1.9-2 2-2h3.17"></path><path d="M11 21.95V18a2 2 0 0 0-2-2v0a2 2 0 0 1-2-2v-1a2 2 0 0 0-2-2H2.05"></path><circle cx="12" cy="12" r="10"></circle></svg>
              </div>
              <span className="info-label">Languages</span>
              <span className="info-value">{artist.performing_language || 'English, Hindi'}</span>
            </div>
            
            {((artist.original_price || artist.price_min) && artist.exclusive_price) && (
              <>
                <div className="info-card">
                  <div className="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                  <span className="info-label">Original Price</span>
                  <span className="info-value price-strike">₹{(artist.original_price || artist.price_min).toLocaleString()}</span>
                </div>
                
                <div className="info-card">
                  <div className="info-icon-wrapper">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                  </div>
                  <span className="info-label">Exclusive Price</span>
                  <span className="info-value price-exclusive">₹{artist.exclusive_price.toLocaleString()}</span>
                </div>
              </>
            )}
          </div>

          <ExpandableBio bio={artist.bio} />
        </section>
        {artist.artist_images && artist.artist_images.length > 0 && (
          <section className="info-section">
            <h2 className="section-title">Photo Gallery</h2>
            <div className="gallery-grid">
              {artist.artist_images.map((img, idx) => (
                <div key={idx} className="gallery-item" onClick={() => setSelectedImage(img.image_url)} style={{ cursor: 'pointer', aspectRatio: '1/1', position: 'relative' }}>
                  <Image src={img.image_url} alt={`${name} gallery ${idx + 1}`} fill sizes="(max-width: 768px) 50vw, 25vw" style={{objectFit: 'cover'}} className="gallery-image" />
                </div>
              ))}
            </div>
          </section>
        )}


        <section className="share-section" style={{ marginTop: '60px', padding: '40px', background: 'linear-gradient(135deg, rgba(231,40,106,0.1), rgba(15,17,23,0.8))', borderRadius: '24px', border: '1px solid rgba(231,40,106,0.3)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h2 className="section-title" style={{ marginBottom: '16px', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            Share Profile
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '24px', maxWidth: '400px' }}>
            Love this artist? Share their profile with friends and event organizers!
          </p>
          <button 
            className="btn-primary-elegant"
            onClick={(e) => {
              navigator.clipboard.writeText(window.location.href);
              const originalText = e.target.innerHTML;
              e.target.innerHTML = 'Link Copied!';
              setTimeout(() => { e.target.innerHTML = originalText; }, 2000);
            }}
          >
            Copy Profile Link
          </button>
        </section>
      </div>

      {selectedImage && typeof document !== 'undefined' && createPortal(
        <div 
          className="lightbox-overlay"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="lightbox-close"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
            aria-label="Close"
          >
            &times;
          </button>
          
          {artist?.artist_images && artist.artist_images.findIndex((img) => img.image_url === selectedImage) > 0 && (
            <button
              className="lightbox-prev"
              onClick={(e) => {
                e.stopPropagation();
                const idx = artist.artist_images.findIndex((img) => img.image_url === selectedImage);
                if (idx > 0) setSelectedImage(artist.artist_images[idx - 1].image_url);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </button>
          )}

          <div className="lightbox-image-container relative w-[90vw] h-[90vh]">
            <Image 
              src={selectedImage} 
              alt="Expanded view" 
              fill
              style={{objectFit: 'contain'}}
              className="lightbox-image"
              onClick={(e) => e.stopPropagation()} 
            />
          </div>
          
          {artist?.artist_images && artist.artist_images.findIndex((img) => img.image_url === selectedImage) < artist.artist_images.length - 1 && (
            <button
              className="lightbox-next"
              onClick={(e) => {
                e.stopPropagation();
                const idx = artist.artist_images.findIndex((img) => img.image_url === selectedImage);
                if (idx < artist.artist_images.length - 1) setSelectedImage(artist.artist_images[idx + 1].image_url);
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          )}
        </div>,
        document.body
      )}
    </main>
  );
}
