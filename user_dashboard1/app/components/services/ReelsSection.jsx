"use client";

/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { supabase } from '@/app/lib/supabase';

// Parse YouTube video ID cleanly
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Beautiful Modern Icons based on category
const getCategoryIcon = (category) => {
  const cat = (category || '').toLowerCase();
  const commonProps = {
    width: "32", height: "32", viewBox: "0 0 24 24", fill: "none", 
    stroke: "url(#neon-pink-grad)", strokeWidth: "1.5", strokeLinecap: "round", strokeLinejoin: "round"
  };
  
  const defs = (
    <defs>
      <linearGradient id="neon-pink-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fff" />
        <stop offset="100%" stopColor="#E7286A" />
      </linearGradient>
    </defs>
  );

  if (cat.includes('sing') || cat.includes('voice')) {
    return (
      <svg {...commonProps}>
        {defs}
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" x2="12" y1="19" y2="22"/>
      </svg>
    );
  }
  if (cat.includes('dj')) {
    return (
      <svg {...commonProps}>
        {defs}
        <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>
      </svg>
    );
  }
  if (cat.includes('band')) {
    return (
      <svg {...commonProps}>
        {defs}
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    );
  }
  return (
    <svg {...commonProps}>
      {defs}
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
};

export default function ReelsSection() {
  const [groupedVideos, setGroupedVideos] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('service_videos')
          .select('*')
          .order('created_at', { ascending: false });

        if (data && !error) {
          const groups = {
            'Singers & Vocalists': [],
            'Live Bands': [],
            'Club DJs': [],
            'Anchors & Talents': [],
            'Featured Showcases': []
          };
          
          data.forEach((video) => {
            const catField = (video.category || '').toLowerCase();
            const topicField = (video.topic || '').toLowerCase();
            
            let matched = false;
            
            if (catField.includes('sing') || catField.includes('voice') || topicField.includes('sing')) {
               groups['Singers & Vocalists'].push(video);
               matched = true;
            }
            else if (catField.includes('band') || catField.includes('symphony') || topicField.includes('band')) {
               groups['Live Bands'].push(video);
               matched = true;
            }
            else if (catField.includes('dj') || catField.includes('music') || topicField.includes('dj')) {
               groups['Club DJs'].push(video);
               matched = true;
            }
            else if (catField.includes('anchor') || catField.includes('emcee') || catField.includes('talent') || topicField.includes('anchor')) {
               groups['Anchors & Talents'].push(video);
               matched = true;
            }
            
            if (!matched) {
               groups['Featured Showcases'].push(video);
            }
          });

          // Filter out empty groups
          const activeGroups = {};
          Object.keys(groups).forEach(key => {
            if (groups[key].length > 0) {
              activeGroups[key] = groups[key];
            }
          });
          
          setGroupedVideos(activeGroups);
        }
      } catch (err) {
        console.error("Error fetching reels:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('reels-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_videos' }, () => {
        fetchVideos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <section className="reels-section-wrapper">
        <div className="reels-page-heading" style={{ animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}>
          <div style={{ height: '60px', width: '500px', background: '#1a1a24', borderRadius: '12px', margin: '0 auto 20px auto', maxWidth: '80%' }}></div>
          <div style={{ height: '20px', width: '350px', background: '#1a1a24', borderRadius: '8px', margin: '0 auto', maxWidth: '60%' }}></div>
        </div>
        
        <div className="reels-container" style={{ marginBottom: '80px', animation: 'pulse 2s infinite cubic-bezier(0.4, 0, 0.6, 1)' }}>
          <div className="reels-header" style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div style={{ width: '300px', height: '40px', background: '#1a1a24', borderRadius: '12px' }}></div>
            <div style={{ width: '150px', height: '45px', background: '#1a1a24', borderRadius: '100px' }}></div>
          </div>
          <div className="reels-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="reel-card" style={{ background: '#1a1a24', border: 'none', boxShadow: 'none' }}></div>
            ))}
          </div>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </section>
    );
  }

  // If no videos, show some fallback data grouped
  const fallbackGroups = {
    'Singers & Vocalists': [
      { id: '1', video_url: "https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4", topic: "" },
      { id: '2', video_url: "https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4", topic: "Pov : you want that one person in your life" },
      { id: '3', video_url: "https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4", topic: "" }
    ]
  };

  const finalGroups = Object.keys(groupedVideos).length > 0 ? groupedVideos : fallbackGroups;

  return (
    <section className="reels-section-wrapper">
      <div className="reels-page-heading">
        <h1 className="reels-page-title">Live Performance Showcase</h1>
        <p className="reels-page-subtitle">Discover the incredible talent available to book for your next event.</p>
      </div>
      
      {Object.entries(finalGroups).map(([category, videos]) => {
        // Filter videos to only show those that are explicitly featured (toggled ON)
        const visibleVideos = [...videos].filter((vid) => vid.main_headingvideo === true);

        if (visibleVideos.length === 0) return null; // Don't show category if no videos are toggled ON

        return (
        <div className="reels-container" key={category} style={{ marginBottom: '80px' }}>
          <div className="reels-header">
            {/* Running Text Marquee Background */}
            <div className="marquee-container">
              <div className="marquee-content">
                ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM
              </div>
            </div>

            <div className="reels-header-left" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                background: 'linear-gradient(135deg, #E7286A, #ff8aab)',
                color: '#fff',
                padding: '6px 14px',
                borderRadius: '100px',
                fontSize: '11px',
                fontWeight: '900',
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                boxShadow: '0 4px 15px rgba(231, 40, 106, 0.4)'
              }}>
                Trending
              </div>
              <h2 className="reels-title">{category}</h2>
            </div>
            <button 
              className="quick-book-btn"
              style={{ position: 'relative', zIndex: 2 }}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-contact-modal', { 
                  detail: { type: 'booking', artist: { name: `Performer from ${category}` } } 
                }));
              }}
            >
              Quick Book
            </button>
          </div>
          <div className="reels-grid">
            {visibleVideos.slice(0, 4).map((vid) => {
              const ytId = getYoutubeId(vid.video_url);
              return (
                <div 
                  key={vid.id} 
                  className="reel-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-contact-modal', { 
                      detail: { type: 'booking', artist: { name: `Performer from ${category}` } } 
                    }));
                  }}
                >
                  {/* Invisible Overlay to catch clicks and prevent iframe from stealing them */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10 }} />
                  {ytId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&controls=0&showinfo=0&autoplay=1&mute=1&loop=1&playlist=${ytId}`}
                      className="reel-video"
                      style={{ border: 'none', objectFit: 'cover', width: '100%', height: '100%' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video 
                      src={vid.video_url}
                      controls={false}
                      autoPlay
                      muted
                      loop
                      playsInline
                      className="reel-video"
                      controlsList="nodownload"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  )}
                  <div style={{ position: 'absolute', bottom: '24px', left: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '8px', zIndex: 5 }}>
                    <h3 style={{ margin: 0, color: '#fff', fontSize: '18px', fontWeight: '800' }}>
                      {vid.user_name && vid.user_name.startsWith('{') ? (JSON.parse(vid.user_name).name || vid.user_name) : vid.user_name}
                    </h3>
                    <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', fontSize: '13px' }}>
                      {vid.topic}
                    </p>
                  </div>
                  {/* Category Logo Icon */}
                  <div 
                    className="reel-overlay-icon"
                    style={{
                      position: 'absolute',
                      bottom: '20px',
                      left: '20px',
                      zIndex: 3,
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(10px)',
                      padding: '12px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,40,126,0.3)'
                    }}
                  >
                    {getCategoryIcon(category)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        );
      })}
    </section>
  );
}
