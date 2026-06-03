"use client";

/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [groupedVideos, setGroupedVideos] = useState({});
  const [backgroundVideo, setBackgroundVideo] = useState(null);
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
          
          // Set background video first if available
          const bgVideo = data.find(v => v.topic === 'Live Performance Background');
          if (bgVideo) setBackgroundVideo(bgVideo);

          data.forEach((video) => {
            if (video.topic === 'Live Performance Background') {
              return;
            }

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

  const finalGroups = groupedVideos;

  return (
    <div>
      <section className="reels-hero-section" style={{ position: 'relative', overflow: 'hidden', minHeight: '65vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '100px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        {backgroundVideo && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}>
            {getYoutubeId(backgroundVideo.video_url) ? (
              <iframe
                src={`https://www.youtube.com/embed/${getYoutubeId(backgroundVideo.video_url)}?rel=0&modestbranding=1&controls=0&showinfo=0&autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(backgroundVideo.video_url)}`}
                style={{ border: 'none', objectFit: 'cover', width: '100%', height: '100vw', transform: 'scale(1.5)', pointerEvents: 'none' }}
                allow="autoplay; encrypted-media"
              />
            ) : (
              <video 
                src={backgroundVideo.video_url}
                autoPlay
                muted
                loop
                playsInline
                style={{ objectFit: 'cover', width: '100%', height: '100%' }}
              />
            )}
            {/* Subtle gradient to ensure text readability without hiding the video */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 40%, rgba(5,5,5,0.8) 100%)' }} />
          </div>
        )}
        
        <div style={{ position: 'relative', zIndex: 1, padding: '20px', maxWidth: '1000px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          <div style={{ 
            marginBottom: '20px',
            padding: '8px 20px',
            background: 'linear-gradient(90deg, rgba(231,40,106,0.15) 0%, rgba(255,138,171,0.05) 100%)',
            border: '1px solid rgba(231,40,106,0.3)',
            borderRadius: '100px',
            color: '#ff8aab',
            fontSize: '13px',
            fontWeight: '800',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 0 20px rgba(231,40,106,0.2)'
          }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#E7286A', boxShadow: '0 0 10px #E7286A' }}></span>
            Premium Artists
          </div>

          <h1 className="reels-page-title" style={{ 
            fontSize: 'clamp(32px, 5vw, 56px)', 
            marginBottom: '20px', 
            letterSpacing: '-0.02em', 
            fontWeight: '900',
            textShadow: '0 10px 30px rgba(0,0,0,0.8), 0 2px 10px rgba(0,0,0,0.5)',
            lineHeight: '1.2'
          }}>
            Hire Live Musicians & Singers for <br />
            <span style={{ 
              background: 'linear-gradient(135deg, #E7286A, #ff8aab)', 
              WebkitBackgroundClip: 'text', 
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              textShadow: 'none',
              filter: 'drop-shadow(0 4px 15px rgba(231,40,106,0.4))'
            }}>Parties, Weddings & Events</span>
          </h1>
          
          <p className="reels-page-subtitle" style={{ 
            fontSize: 'clamp(16px, 1.5vw, 20px)', 
            color: 'rgba(255,255,255,0.95)', 
            lineHeight: '1.6', 
            maxWidth: '800px',
            margin: '0 auto',
            fontWeight: '400',
            textShadow: '0 4px 15px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,1)' 
          }}>
            At Magnevents, we make it easy to hire live musicians for parties, weddings, and special events. From solo singers for hire near you to full bands and soulful Sufi acts, we have the perfect artist to match your vibe.
          </p>

          <button style={{
            marginTop: '30px',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            padding: '16px 40px',
            borderRadius: '100px',
            fontSize: '15px',
            fontWeight: '900',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(231, 40, 106, 0.15)';
            e.currentTarget.style.borderColor = 'rgba(231, 40, 106, 0.5)';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(231, 40, 106, 0.2)';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          >
            Book Now
            <span style={{ fontSize: '18px' }}>→</span>
          </button>
        </div>
      </section>

      <section className="reels-content-section" style={{ padding: '60px 0', background: '#050505' }}>
      
      {(() => {
        const categoryDescriptions = {
          'Singers & Vocalists': 'Looking to hire a singer for a party or wedding? Our solo singers for hire are handpicked for their talent, stage presence, and ability to light up any event. Whether you need an acoustic guitarist singer for hire or a powerhouse vocalist, we’ve got you covered.',
          'Live Bands': 'Turn your party or corporate gathering into an unforgettable experience. Hire a band for your party and enjoy a full, energetic live sound that gets every guest on their feet. Our live musicians for hire know how to read the crowd and keep the vibes just right.',
          'Sufi Bands': 'Add a spiritual touch to your event with our authentic Sufi bands. Hire live musicians for soulful evenings, cultural nights, or traditional gatherings that create unforgettable memories.',
          'Club DJs': 'Looking to hire a DJ for an unforgettable night? Our club DJs bring high-energy beats and keep the dance floor packed.',
          'Anchors & Talents': 'Hire professional anchors, emcees, and talents to host your event and keep your audience fully engaged.',
          'Featured Showcases': 'Discover our premium selection of top-tier talent and exclusive performances curated just for you.'
        };
        
        return Object.entries(finalGroups).map(([category, videos]) => {
          // Filter videos to only show those that are explicitly featured (toggled ON)
          const visibleVideos = [...videos].filter((vid) => vid.main_headingvideo === true);

          if (visibleVideos.length === 0) return null; // Don't show category if no videos are toggled ON

          return (
          <div className="reels-container" key={category} style={{ marginBottom: '80px' }}>
          <div className="reels-header">
            {/* First Row: Scrolling Text (Marquee) */}
            <div className="marquee-container">
              <div className="marquee-content">
                ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM ★ RECOMMENDED ★ TRENDING ★ EXCLUSIVE ★ TOP RATED ★ PREMIUM
              </div>
            </div>

            {/* Second Row: Main Heading, Badge, and Button */}
            <div className="reels-header-content">
              <div className="reels-header-left" style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #E7286A, #ff8aab)',
                  color: '#fff',
                  padding: '4px 12px',
                  borderRadius: '100px',
                  fontSize: '10px',
                  fontWeight: '900',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  boxShadow: '0 4px 15px rgba(231, 40, 106, 0.4)'
                }}>
                  ★ Trending
                </div>
                <h2 className="reels-title" style={{ margin: 0, fontSize: 'clamp(24px, 4vw, 36px)', lineHeight: '1.2', fontWeight: '900' }}>{category}</h2>
                {categoryDescriptions[category] && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: 'rgba(255,255,255,0.6)', maxWidth: '600px', lineHeight: '1.6' }}>
                    {categoryDescriptions[category]}
                  </p>
                )}
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
                    const artistName = vid.userName || vid.artistName || `Performer from ${category}`;
                    window.dispatchEvent(new CustomEvent('open-contact-modal', { 
                      detail: { type: 'booking', artist: { name: artistName } } 
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
                  
                  {/* Play Overlay */}
                  <div className="play-overlay">
                    <svg viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
          );
        });
      })()}

      {/* SEO / How to Book Section */}
      <div className="reels-container" style={{ marginTop: '40px', marginBottom: '80px' }}>
        <div style={{
          background: 'rgba(20, 20, 25, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          borderRadius: '24px',
          padding: '40px 40px',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <h2 style={{ 
            fontSize: '32px', 
            fontWeight: '900', 
            marginBottom: '16px',
            background: 'linear-gradient(135deg, #fff, #ff8aab)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            How to book a singer or a live band?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '16px', lineHeight: '1.6', maxWidth: '800px', marginBottom: '40px' }}>
            If you are still wondering how to book a singer or a live band and hire live musicians near you with zero hassle. Our team is here to help you find the perfect match, so your party, wedding, or event is nothing short of amazing. You can do this in four simple steps:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '24px' }}>
            {[
              { num: '1', title: 'Click Book Now', desc: 'Select your favorite artist and hit the book button.' },
              { num: '2', title: 'Fill the Form', desc: 'Provide us with your event details and dates.' },
              { num: '3', title: 'Speak to Expert', desc: 'Our artist expert will help finalize the perfect match.' },
              { num: '4', title: 'Enjoy the Show', desc: 'Pay the booking amount, sit back, and relax!' }
            ].map((step, idx) => (
              <div key={idx} style={{
                background: 'rgba(0,0,0,0.2)',
                border: '1px solid rgba(255,40,126,0.1)',
                padding: '24px',
                borderRadius: '16px',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  position: 'absolute', top: '-10px', right: '-10px', 
                  fontSize: '80px', fontWeight: '900', color: 'rgba(231,40,106,0.05)', lineHeight: '1' 
                }}>
                  {step.num}
                </div>
                <div style={{ 
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #E7286A, #ff8aab)',
                  color: 'white', fontWeight: 'bold', fontSize: '14px', marginBottom: '16px'
                }}>
                  {step.num}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#fff' }}>{step.title}</h3>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', margin: 0, lineHeight: '1.5' }}>{step.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', paddingTop: '40px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center' }}>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '18px', fontWeight: '600' }}>
              Are you ready for our musicians?
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', maxWidth: '600px', margin: '8px auto 0' }}>
              Discover the best live musicians for hire near you. Book solo singers for hire, hire a band for your party, or bring in soulful Sufi musicians for weddings and events.
            </p>
          </div>
        </div>
      </div>

      </section>
    </div>
  );
}
