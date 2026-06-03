"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';
import '@/app/styles/pages/ArtistProfile.css';

// A mock rating component for UI
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

export default function ArtistProfilePage({ params }) {
  const [artist, setArtist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // The id from params could be a uuid, an alias, or a userName
  const decodedId = decodeURIComponent(params.id);

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      try {
        // 1. Try fetching from artists table first
        const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(decodedId);
        
        let query = supabase.from('artists').select('*, artist_images(image_url)');
        
        if (isUUID) {
          query = query.eq('id', decodedId);
        } else {
          query = query.or(`alias.ilike.%${decodedId}%,name.ilike.%${decodedId}%`);
        }

        let { data, error } = await query.limit(1).single();

        if (data) {
          setArtist(data);
          // If we found the artist, let's fetch their videos
          const { data: vids } = await supabase
            .from('service_videos')
            .select('*')
            .or(`userName.ilike.%${data.alias || data.name}%,artistName.ilike.%${data.alias || data.name}%`);
          
          if (vids && vids.length > 0) {
            setVideos(vids);
          } else if (data.video_url) {
            // Fallback to their profile video_url strings
            const urls = data.video_url.split(',').map(u => u.trim());
            setVideos(urls.map((url, idx) => ({ id: idx, video_url: url })));
          }
        } else {
          // 2. If not found in artists, check service_videos to see if they exist there
          const { data: svData, error: svError } = await supabase
            .from('service_videos')
            .select('*')
            .or(`userName.ilike.%${decodedId}%,artistName.ilike.%${decodedId}%`);

          if (svData && svData.length > 0) {
            const firstVideo = svData[0];
            // Mock an artist object based on the video info
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

  if (loading) {
    return (
      <div className="artist-profile-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ animation: 'pulse 1.5s infinite', color: '#E7286A', fontWeight: 'bold' }}>Loading Profile...</div>
      </div>
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
  const categories = [artist.category, artist.sub_category].filter(Boolean).join(', ');
  const coverImage = artist.artist_images && artist.artist_images.length > 0 
    ? artist.artist_images[0].image_url 
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop'; // fallback stage image

  return (
    <main className="artist-profile-wrapper">
      <div className="artist-container">
        
        {/* HERO SECTION */}
        <section className="artist-hero-card">
          <img src={coverImage} alt={name} className="hero-banner-image" />
          <div className="hero-gradient-overlay" />
          
          <div className="hero-content">
            <div className="hero-text-area">
              <div className="artist-badges">
                <span className="badge-item">★ Emerging Artist</span>
                {artist.category && <span className="badge-item" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'transparent' }}>{artist.category}</span>}
              </div>
              
              <h1 className="artist-name">{name}</h1>
              
              <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: '700', margin: '0' }}>
                {categories || 'Live Performer'}
              </p>

              <div className="hero-actions">
                <button className="btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: { name } } }))}>
                  Book Performance
                </button>
                <button className="btn-secondary" onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: { name } } }))}>
                  Contact Now
                </button>
              </div>
            </div>

            <div className="hero-stats">
              <div className="stat-item">
                <div className="stat-value">5</div>
                <StarRating rating={5} />
                <div className="stat-label">Rating</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">{videos.length * 10 + 23}</div>
                <div style={{ height: '16px' }} /> {/* Spacer */}
                <div className="stat-label">Shows</div>
              </div>
            </div>
          </div>
        </section>

        {/* ARTIST INFORMATION SECTION */}
        <section className="info-section">
          <h2 className="section-title">Artist Information</h2>
          
          <div className="info-grid">
            <div className="info-card">
              <span className="info-label">Location</span>
              <span className="info-value">{artist.city || 'Global'}</span>
            </div>
            
            <div className="info-card">
              <span className="info-label">Category</span>
              <span className="info-value">{artist.category || 'Live Musician'}</span>
            </div>
            
            <div className="info-card">
              <span className="info-label">Languages</span>
              <span className="info-value">{artist.performing_language || 'English, Hindi'}</span>
            </div>
            
            <div className="info-card">
              <span className="info-label">Original Price</span>
              <span className="info-value price-strike">₹{artist.price_min ? (artist.price_min + 5000).toLocaleString() : '15,000'}</span>
            </div>
            
            <div className="info-card">
              <span className="info-label">Exclusive Price</span>
              <span className="info-value price-exclusive">₹{artist.price_min ? artist.price_min.toLocaleString() : '10,000'}</span>
            </div>
          </div>

          <div className="bio-block">
            <h2 className="section-title">Professional Bio</h2>
            <p>{artist.bio || "This artist is a spectacular performer known for bringing high energy and unforgettable moments to every stage. Whether it's a corporate event, a private wedding, or a grand festival, their versatile talent ensures the crowd is always engaged and amazed."}</p>
          </div>
        </section>

        {/* PHOTO GALLERY SECTION */}
        {artist.artist_images && artist.artist_images.length > 0 && (
          <section className="info-section">
            <h2 className="section-title">Photo Gallery</h2>
            <div className="gallery-grid">
              {artist.artist_images.map((img, idx) => (
                <div key={idx} className="gallery-item">
                  <img src={img.image_url} alt={`${name} gallery ${idx + 1}`} className="gallery-image" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* VIDEOS & PERFORMANCE SECTION */}
        <section className="info-section" style={{ marginTop: '80px' }}>
          <h2 className="section-title">Performance Formats & Videos</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '30px', marginTop: '30px' }}>
            {videos.length > 0 ? videos.map((vid, idx) => {
              const url = vid.video_url;
              // Extract YT ID
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
              const match = url?.match(regExp);
              const ytId = (match && match[2].length === 11) ? match[2] : null;

              return (
                <div key={idx} style={{ 
                  borderRadius: '16px', overflow: 'hidden', background: '#000', 
                  border: '1px solid rgba(255,40,126,0.2)', aspectRatio: '9/16',
                  position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
                }}>
                  {ytId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&controls=0&showinfo=0`}
                      style={{ border: 'none', objectFit: 'cover', width: '100%', height: '100%', transform: 'scale(1.2)' }}
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      src={url}
                      controls={false}
                      autoPlay
                      muted
                      loop
                      playsInline
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  )}
                  <div style={{
                    position: 'absolute', bottom: 0, left: 0, right: 0, padding: '30px 20px 20px',
                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', color: 'white',
                    fontWeight: '700', fontSize: '15px'
                  }}>
                    {vid.topic || 'Live Performance'}
                  </div>
                </div>
              )
            }) : (
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>No videos available for this artist yet.</p>
            )}
          </div>
        </section>

      </div>
    </main>
  );
}
