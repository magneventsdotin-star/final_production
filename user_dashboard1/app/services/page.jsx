"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/app/lib/supabase'
import '@/app/styles/pages/ServicesPage.css'

// Parse YouTube video ID cleanly
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Premium luxury SVG Icons to replace cheap standard emojis
const SparklesIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lux-svg-icon">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z"/>
    <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5Z"/>
    <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z"/>
  </svg>
);

const MicIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lux-svg-icon">
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
    <line x1="12" x2="12" y1="19" y2="22"/>
  </svg>
);

const GuitarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lux-svg-icon">
    <path d="M18.8 6c.4-.4.4-1 0-1.4l-1.4-1.4c-.4-.4-1-.4-1.4 0l-5.6 5.6a4 4 0 1 0 5.6 5.6l5.6-5.6Z"/>
    <path d="m14 6-2 2"/>
    <path d="M2 22s5.5-1.5 8-4"/>
  </svg>
);

const DJIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lux-svg-icon">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="4"/>
    <path d="M12 2a10 10 0 0 1 8 4"/>
    <circle cx="12" cy="12" r="1"/>
  </svg>
);

const MaskIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lux-svg-icon">
    <path d="M2 10s3-3 10-3 10 3 10 3v4c0 3.8-3.1 7-7 7H9c-3.9 0-7-3.2-7-7v-4Z"/>
    <path d="M6 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
    <path d="M18 12a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"/>
  </svg>
);

const CATEGORIES = [
  { id: 'all', label: 'All Services', icon: <SparklesIcon /> },
  { id: 'singer', label: 'Singers', icon: <MicIcon /> },
  { id: 'band', label: 'Live Bands', icon: <GuitarIcon /> },
  { id: 'dj', label: 'Club DJs', icon: <DJIcon /> },
  { id: 'anchor', label: 'Anchors & Talents', icon: <MaskIcon /> }
];

// Map stages dynamically based on subcategories and titles
const getCategoryPoster = (category, topic, videoUrl) => {
  const ytId = getYoutubeId(videoUrl);
  if (ytId) {
    return `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
  }
  
  const text = (category || topic || '').toLowerCase();
  if (text.includes('sing') || text.includes('voice') || text.includes('vocalist')) {
    return '/assets/lux-singer-session.webp';
  }
  if (text.includes('band') || text.includes('wedding') || text.includes('symphony') || text.includes('collective')) {
    return '/assets/lux-live-band-concert.jpg';
  }
  if (text.includes('dj') || text.includes('music') || text.includes('percussion')) {
    return '/assets/lux-percussion-dj-thumb.jpg';
  }
  if (text.includes('anchor') || text.includes('magician') || text.includes('emcee') || text.includes('stage')) {
    return '/assets/wedding-anchor-stage.jpg';
  }
  return '/assets/lux-hero-artist.jpg';
};

// Clean dummy/test data entered via Admin dashboard (e.g. "asdf", "N;LSDFA") to keep page beautiful
const sanitizeVideoData = (video) => {
  const isDummy = (str) => {
    if (!str) return true;
    const s = str.toLowerCase();
    return s.includes('asdf') || s.includes('test') || s.includes('qwerty') || s.length < 3;
  };

  let userName = video.user_name;
  if (isDummy(userName)) {
    const cat = (video.category || '').toLowerCase();
    if (cat.includes('sing')) userName = 'Swaresh & The Sufi Kings';
    else if (cat.includes('band')) userName = 'Premium Symphony Orchestra';
    else if (cat.includes('dj')) userName = 'DJ Roy & The Neon Beats';
    else userName = 'Anchor Rohit Kapoor';
  }

  let category = video.category;
  if (isDummy(category) || category === 'Other' || category === 'N;LSDFA') {
    const topic = (video.topic || '').toLowerCase();
    if (topic.includes('sing') || topic.includes('voice')) category = 'Singers';
    else if (topic.includes('band') || topic.includes('wedding')) category = 'Live Bands';
    else if (topic.includes('dj') || topic.includes('music')) category = 'Club DJs';
    else category = 'Anchors & Talents';
  }

  let topic = video.topic;
  if (isDummy(topic)) {
    topic = `Live Luxury Performance`;
  }

  return {
    ...video,
    user_name: userName,
    category: category,
    topic: topic
  };
};

const VideoCard = ({ video, onPlay }) => {
  const poster = getCategoryPoster(video.category, video.topic, video.video_url);
  const isYoutube = !!getYoutubeId(video.video_url);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="premium-video-card"
      onClick={() => onPlay(video)}
      style={{
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        background: '#0d0d0f',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        cursor: 'pointer',
        aspectRatio: '16/10',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)',
      }}
    >
      {/* Background Poster Image */}
      <div 
        className="card-poster"
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${poster})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      />
      
      {/* Premium Dark Gradient Overlay */}
      <div 
        className="card-gradient"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(6, 6, 8, 0.95) 0%, rgba(6, 6, 8, 0.3) 60%, rgba(6, 6, 8, 0.1) 100%)',
          zIndex: 1
        }}
      />

      {/* Floating Category Tag */}
      <div 
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 2,
          display: 'flex',
          gap: '8px'
        }}
      >
        <span 
          style={{
            fontSize: '10px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            background: 'rgba(6, 6, 8, 0.75)',
            backdropFilter: 'blur(10px)',
            color: '#fff',
            padding: '5px 14px',
            borderRadius: '100px',
            border: '1px solid rgba(255, 255, 255, 0.12)'
          }}
        >
          {video.category}
        </span>
        {isYoutube && (
          <span 
            style={{
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              background: 'rgba(239, 68, 68, 0.85)',
              backdropFilter: 'blur(10px)',
              color: '#fff',
              padding: '5px 14px',
              borderRadius: '100px',
              border: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            YouTube
          </span>
        )}
      </div>

      {/* Pulsing Play Button */}
      <div 
        className="play-btn-wrapper"
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}
      >
        <div 
          className="lux-play-ring"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: isYoutube ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 224, 50, 0.1)',
            backdropFilter: 'blur(10px)',
            border: isYoutube ? '1.5px solid rgba(239, 68, 68, 0.45)' : '1.5px solid rgba(255, 224, 50, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: isYoutube ? '0 8px 32px rgba(239, 68, 68, 0.2)' : '0 8px 32px rgba(255, 224, 50, 0.15)',
          }}
        >
          <svg 
            width="18" 
            height="20" 
            viewBox="0 0 20 22" 
            fill="none" 
            style={{ marginLeft: '3px', filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.3))' }}
          >
            <path d="M18.6667 11L1.99999 20.6667L1.99999 1.33334L18.6667 11Z" fill={isYoutube ? '#ef4444' : '#ffe032'} />
          </svg>
        </div>
      </div>

      {/* Bottom Information */}
      <div 
        className="card-details"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '24px',
          zIndex: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: '6px'
        }}
      >
        <h4 
          className="card-title"
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#fff',
            fontFamily: 'Outfit, var(--font-display), sans-serif',
            letterSpacing: '-0.01em'
          }}
        >
          {video.user_name}
        </h4>
        <span style={{ color: '#a1a1aa', fontSize: '13px', fontWeight: '400' }}>
          {video.topic}
        </span>
      </div>
    </motion.div>
  );
};

export default function ServicesPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState(null);
  const [selectedTab, setSelectedTab] = useState('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('service_videos')
        .select('id, topic, video_url, category, user_name')
        .order('created_at', { ascending: false });

      if (error) {
        if (error.code === '42P01' || error.message?.includes('find the table') || error.code?.startsWith('PGRST')) {
          setVideos([]);
          return;
        }
        throw error;
      }

      // Map and sanitize the videos list
      const cleanData = (data || []).map(sanitizeVideoData);
      setVideos(cleanData);
    } catch (error) {
      console.error("Error fetching videos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();

    // BACKGROUND SYNC PROPER: Subscribe to Supabase Realtime changes!
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_videos' },
        (payload) => {
          console.log('Realtime sync event received:', payload);
          fetchVideos(); // Reload background automatically!
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getFilteredVideos = () => {
    let list = [...videos];
    
    // Add default fallbacks if database is empty or has only dummy items
    if (list.length === 0) {
      list = [
        {
          id: 'backup-1',
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4',
          user_name: 'Swaresh & The Sufi Kings',
          category: 'Singers',
          topic: 'Live Sufi Sessions for House Parties'
        },
        {
          id: 'backup-2',
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-band-performing-on-stage-at-a-concert-34371-large.mp4',
          user_name: 'Premium Symphony Collective',
          category: 'Live Bands',
          topic: 'Luxury Wedding Live Orchestra'
        },
        {
          id: 'backup-3',
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-dj-playing-music-at-a-club-34384-large.mp4',
          user_name: 'DJ Roy & The Neon Beats',
          category: 'Club DJs',
          topic: 'High-Energy DJ Sets for Events'
        },
        {
          id: 'backup-4',
          video_url: 'https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4',
          user_name: 'Anchor Rohit Kapoor',
          category: 'Anchors & Talents',
          topic: 'Elite Host and Celebrity Emcee'
        }
      ];
    }

    if (selectedTab === 'all') return list;
    
    return list.filter(v => {
      const field = (v.category || v.topic || '').toLowerCase();
      if (selectedTab === 'singer') return field.includes('sing') || field.includes('voice') || field.includes('vocalist');
      if (selectedTab === 'band') return field.includes('band') || field.includes('collective') || field.includes('symphony');
      if (selectedTab === 'dj') return field.includes('dj') || field.includes('music');
      if (selectedTab === 'anchor') return field.includes('anchor') || field.includes('emcee') || field.includes('magician') || field.includes('talent');
      return true;
    });
  };

  const currentVideos = getFilteredVideos();
  // Safe extraction of spotlight video
  const spotlightVideo = currentVideos[0] || {
    video_url: 'https://assets.mixkit.co/videos/preview/mixkit-singer-performing-on-stage-with-microphone-34374-large.mp4',
    user_name: 'Featured VIP Performance',
    category: 'Featured',
    topic: 'Live Music Session Showcase'
  };

  const spotlightYoutubeId = getYoutubeId(spotlightVideo.video_url);
  const activeYoutubeId = activeVideo ? getYoutubeId(activeVideo.video_url) : null;

  return (
    <main className="services-page-layout" style={{ background: '#050507', color: '#fff', overflow: 'hidden', position: 'relative', minHeight: '100vh' }}>
      
      {/* Sleek Cinematic Background Ambient Radial Orbs */}
      <div style={{ position: 'absolute', top: '0', left: '15%', width: isMobile ? '300px' : '600px', height: isMobile ? '300px' : '600px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 224, 50, 0.04) 0%, transparent 70%)', filter: 'blur(120px)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '15%', right: '5%', width: isMobile ? '350px' : '700px', height: isMobile ? '350px' : '700px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(225, 29, 72, 0.03) 0%, transparent 70%)', filter: 'blur(140px)', pointerEvents: 'none', zIndex: 0 }} />

      <div className="lux-container" style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '30px 16px' : '40px 24px' }}>
        
        {/* PREMIUM MINIMALIST HERO */}
        <header className="services-header" style={{ marginBottom: isMobile ? '30px' : '50px', textAlign: 'center' }}>
          <span 
            style={{ 
              fontSize: '9px', 
              fontWeight: '900', 
              color: '#ffe032', 
              background: 'rgba(255, 224, 50, 0.08)', 
              padding: '6px 18px', 
              borderRadius: '100px', 
              border: '1px solid rgba(255, 224, 50, 0.15)', 
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              display: 'inline-block'
            }}
          >
            Exclusive Showreel
          </span>
          <h1 style={{ fontFamily: 'Outfit, serif', fontSize: isMobile ? '32px' : 'clamp(44px, 5.5vw, 68px)', fontWeight: '900', color: '#fff', letterSpacing: '-0.03em', margin: isMobile ? '12px 0 10px 0' : '20px 0 14px 0' }}>
            Watch Us <span className="text-gradient" style={{ background: 'linear-gradient(90deg, #ffe032 0%, #ffffff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Live</span>
          </h1>
          <p style={{ color: '#a1a1aa', fontSize: isMobile ? '14px' : '17px', maxWidth: '620px', margin: '0 auto', lineHeight: '1.6', fontWeight: '400' }}>
            Experience the vibrant luxury performance staging of our premium singers, live wedding bands, corporate showcases, and elite DJs.
          </p>
        </header>

        {/* ELEGANT COMPACT SPOTLIGHT BANNER */}
        <section 
          onClick={() => setActiveVideo(spotlightVideo)}
          style={{
            position: 'relative',
            width: '100%',
            height: isMobile ? '260px' : '350px',
            borderRadius: isMobile ? '20px' : '28px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.06)',
            marginBottom: isMobile ? '35px' : '50px',
            background: '#0a0a0c',
            cursor: 'pointer',
            boxShadow: '0 25px 60px rgba(0, 0, 0, 0.75)'
          }}
          className="spotlight-banner-wrap"
        >
          {/* Loop silent preview in background */}
          {spotlightYoutubeId ? (
            <iframe
              src={`https://www.youtube.com/embed/${spotlightYoutubeId}?autoplay=1&loop=1&playlist=${spotlightYoutubeId}&mute=1&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1`}
              style={{
                position: 'absolute',
                top: '50%', left: '50%', width: '100%', height: '100%',
                transform: 'translate(-50%, -50%) scale(1.35)',
                pointerEvents: 'none',
                opacity: 0.3,
                transition: 'opacity 0.4s ease'
              }}
            />
          ) : (
            <video 
              src={spotlightVideo.video_url}
              autoPlay
              loop
              muted
              playsInline
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                objectFit: 'cover',
                opacity: 0.35,
                transition: 'opacity 0.4s ease'
              }}
            />
          )}
          {/* Subtle vignette overlays */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5, 5, 7, 0.95) 0%, rgba(5, 5, 7, 0.5) 60%, rgba(0, 0, 0, 0.1) 100%)', zIndex: 1 }} />
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 15% 50%, rgba(5, 5, 7, 0.9) 0%, rgba(5, 5, 7, 0) 70%)', zIndex: 1 }} />

          {/* Spotlight content */}
          <div 
            style={{
              position: 'absolute',
              bottom: 0, left: 0, right: 0, top: 0,
              padding: isMobile ? '20px' : '40px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              zIndex: 2,
              maxWidth: '600px'
            }}
          >
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: isMobile ? '6px' : '14px' }}>
              <span style={{ fontSize: '8px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.12em', background: 'rgba(255, 224, 50, 0.18)', color: '#ffe032', padding: '3px 10px', borderRadius: '100px', border: '1px solid rgba(255, 224, 50, 0.25)' }}>
                ★ Featured Session
              </span>
            </div>
            <h2 style={{ fontSize: isMobile ? '20px' : 'clamp(26px, 3.5vw, 38px)', fontWeight: '900', color: '#fff', margin: '0 0 6px 0', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.02em', lineHeight: '1.2' }}>
              {spotlightVideo.user_name}
            </h2>
            <p style={{ color: '#d4d4d8', fontSize: isMobile ? '11px' : '15px', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Click to launch this exclusive performance showreel in cinematic high-definition audio.
            </p>

            <div>
              <button 
                style={{
                  background: '#ffe032',
                  color: '#000',
                  padding: isMobile ? '9px 20px' : '13px 32px',
                  borderRadius: '100px',
                  fontWeight: '900',
                  border: 'none',
                  fontSize: isMobile ? '10px' : '13px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(255, 224, 50, 0.3)',
                  transition: 'all 0.3s ease'
                }}
              >
                ▶ Watch Spotlight Live
              </button>
            </div>
          </div>
        </section>

        {/* HIGH-END INTERACTIVE SVG FILTER BAR (SWEET EDGE-TO-EDGE HORIZONTAL CAROUSEL ON MOBILE) */}
        <section 
          className="hide-scrollbar"
          style={{ 
            display: 'flex', 
            justifyContent: isMobile ? 'flex-start' : 'center', 
            gap: '10px', 
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: isMobile ? '12px' : '0px',
            marginBottom: isMobile ? '30px' : '45px',
            width: isMobile ? 'calc(100% + 32px)' : '100%',
            marginLeft: isMobile ? '-16px' : '0',
            paddingLeft: isMobile ? '16px' : '0',
            paddingRight: isMobile ? '16px' : '0'
          }}
        >
          {CATEGORIES.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              style={{
                background: selectedTab === tab.id ? '#fff' : 'rgba(255, 255, 255, 0.02)',
                color: selectedTab === tab.id ? '#000' : '#a1a1aa',
                border: selectedTab === tab.id ? '1px solid #fff' : '1px solid rgba(255, 255, 255, 0.08)',
                padding: isMobile ? '9px 18px' : '11px 24px',
                borderRadius: '100px',
                fontSize: isMobile ? '12px' : '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: selectedTab === tab.id ? '0 8px 20px rgba(255,255,255,0.08)' : 'none',
                flexShrink: isMobile ? 0 : 1
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </section>

        {/* DENSE GRID PANEL (FULLY RESPONSIVE LAYOUT COLUMNS TO PREVENT COMPRESSION) */}
        {loading ? (
          <div style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '50%', border: '2px solid rgba(255,255,255,0.05)', borderTopColor: '#ffe032', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: '12px', color: '#71717a', letterSpacing: '0.1em' }}>STAGE TUNING...</div>
            </div>
          </div>
        ) : (
          <motion.div 
            layout
            className="hover-video-grid" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(340px, 1fr))', 
              gap: isMobile ? '20px' : '28px',
              minHeight: '200px',
              paddingBottom: '80px'
            }}
          >
            <AnimatePresence mode="popLayout">
              {currentVideos.map((vid, index) => (
                <VideoCard 
                  key={vid.id || index} 
                  video={vid} 
                  onPlay={setActiveVideo}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* Cinematic Lightbox Modal (DYNAMICALLY SCALED FOR MOBILE PHONE SCREENPORTS) */}
      <AnimatePresence>
        {activeVideo && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveVideo(null)}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(3, 3, 5, 0.97)',
              backdropFilter: 'blur(20px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: isMobile ? '12px' : '20px'
            }}
          >
            <motion.div 
              initial={{ scale: 0.96, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.96, y: 20 }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: '100%',
                maxWidth: '920px',
                borderRadius: isMobile ? '20px' : '28px',
                overflow: 'hidden',
                background: '#09090b',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 30px 60px rgba(0, 0, 0, 0.9)'
              }}
            >
              {/* Cinematic Video Player Container */}
              <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#000' }}>
                {activeYoutubeId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${activeYoutubeId}?autoplay=1&rel=0&modestbranding=1`}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={activeVideo.video_url} 
                    autoPlay
                    controls 
                    controlsList="nodownload"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
                
                {/* Close Button */}
                <button 
                  onClick={() => setActiveVideo(null)}
                  style={{
                    position: 'absolute',
                    top: isMobile ? '12px' : '20px',
                    right: isMobile ? '12px' : '20px',
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'rgba(0, 0, 0, 0.75)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                    zIndex: 10
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Lightbox Details Panel */}
              <div 
                style={{ 
                  padding: isMobile ? '20px 24px' : '30px 36px', 
                  background: 'linear-gradient(to bottom, #0b0b0d 0%, #050507 100%)', 
                  display: 'flex', 
                  alignItems: isMobile ? 'stretch' : 'center', 
                  justifyContent: 'space-between',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '16px' : '24px'
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ fontSize: '9px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', background: 'rgba(255, 224, 50, 0.15)', color: '#ffe032', padding: '4px 10px', borderRadius: '100px', border: '1px solid rgba(255, 224, 50, 0.2)' }}>
                      {activeVideo.category}
                    </span>
                    <span style={{ color: '#52525b', fontSize: '12px' }}>•</span>
                    <span style={{ color: '#a1a1aa', fontSize: '12px', fontWeight: '500' }}>
                      {activeVideo.topic}
                    </span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: isMobile ? '20px' : '24px', fontWeight: '800', color: '#fff', fontFamily: 'Outfit, sans-serif', letterSpacing: '-0.01em' }}>
                    {activeVideo.user_name}
                  </h3>
                </div>

                <button 
                  onClick={() => {
                    setActiveVideo(null);
                    window.dispatchEvent(new CustomEvent('open-contact-modal', { 
                      detail: { type: 'booking', artist: { name: activeVideo.user_name } } 
                    }));
                  }}
                  style={{
                    background: '#ffe032',
                    color: '#000',
                    padding: isMobile ? '12px 24px' : '14px 34px',
                    borderRadius: '100px',
                    fontWeight: '900',
                    fontSize: '13px',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 8px 24px rgba(255, 224, 50, 0.3)',
                    transition: 'all 0.2s',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    width: isMobile ? '100%' : 'auto'
                  }}
                >
                  Book This Performer
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <style jsx global>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spotlight-banner-wrap:hover video {
          opacity: 0.45 !important;
          transform: scale(1.01);
        }
        .spotlight-banner-wrap:hover button {
          background: #fff !important;
          color: #000 !important;
          box-shadow: 0 12px 30px rgba(255,255,255,0.2) !important;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </main>
  )
}
