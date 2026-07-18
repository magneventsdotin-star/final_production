"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@database/connection/supabase';
import Link from 'next/link';
import Image from 'next/image';
import '../styles/pages/ServicesPage.css';

// SVG Icons
const PlayIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 5v14l11-7z" />
  </svg>
);

const ScrollIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 5v14M19 12l-7 7-7-7" />
  </svg>
);

const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="#FFD166" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

// Helper for YouTube
const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Reusable Video Card Component
const VideoCard = ({ video, onSelect }) => {
  const ytId = getYoutubeId(video.video_url);

  return (
    <div 
      className="v4-video-card group" 
      onClick={() => onSelect && onSelect(video)}
      onMouseEnter={(e) => {
        const vid = e.currentTarget.querySelector('video');
        if (vid) {
          try { vid.play(); } catch (err) {}
        }
      }}
      onMouseLeave={(e) => {
        const vid = e.currentTarget.querySelector('video');
        if (vid) {
          try { 
            vid.pause(); 
            vid.currentTime = 0; 
          } catch (err) {}
        }
      }}
    >
      {ytId ? (
        <Image src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} fill sizes="(max-width: 768px) 100vw, 30vw" style={{objectFit: 'cover'}} className="v4-video-media" alt="Video thumbnail" />
      ) : (
        <video 
          src={video.video_url} 
          className="v4-video-media" 
          muted 
          loop 
          playsInline
          controls
          onClick={(e) => e.stopPropagation()}
        />
      )}
      
      <div className="v4-video-overlay">
        {video.user_name && (
          <div className="v4-video-artist-name">
            {(() => {
              try {
                const parsed = JSON.parse(video.user_name);
                return parsed.name || 'Featured Artist';
              } catch (e) {
                return video.user_name;
              }
            })()}
          </div>
        )}
        <div className="v4-video-card-footer" style={{ justifyContent: 'center' }}>
          <button className="v4-btn-book-sm">Book Now</button>
        </div>
      </div>

      <div className="v4-video-play-btn">
        <PlayIcon />
      </div>
    </div>
  );
};

export default function ServicesPage() {
  const [loading, setLoading] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(null);
  
  const [pageSettings, setPageSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [videos, setVideos] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    const fetchData = async () => {
      try {
        const { data: settingsData } = await supabase
          .from('service_page_settings')
          .select('*')
          .limit(1)
          .single();
        if (settingsData) setPageSettings(settingsData);

        const { data: catData } = await supabase
          .from('service_categories')
          .select('*')
          .order('displayOrder', { ascending: true });
        if (catData) setCategories(catData.filter(c => c.status));

        const { data: vidData } = await supabase
          .from('service_videos')
          .select('*')
          .order('created_at', { ascending: false });
        if (vidData) setVideos(vidData);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Determine Hero Video
  let heroVideo = "https://assets.mixkit.co/videos/preview/mixkit-band-performing-on-stage-at-a-concert-34371-large.mp4";
  
  const legacyBgObj = videos.find(v => v.topic === 'Live Performance Background' || v.category === 'Background Video');
  
  if (pageSettings?.hero_bg_video?.trim()) {
    heroVideo = pageSettings.hero_bg_video;
  } else if (legacyBgObj?.video_url) {
    heroVideo = legacyBgObj.video_url;
  }

  // Remove loading block, render immediately

  return (
    <div className="v4-services-wrapper">
      
      {/* =========================================
          SECTION 1: FULL SCREEN HERO (COMMENTED OUT)
          ========================================= */}
      {/* 
      <section className="v4-hero-section">
        {!heroVideo?.includes('youtube') ? (
          <video src={heroVideo} autoPlay muted loop playsInline className="v4-hero-media" />
        ) : (
          <iframe
            src={`https://www.youtube.com/embed/${getYoutubeId(heroVideo)}?autoplay=1&mute=1&loop=1&playlist=${getYoutubeId(heroVideo)}&controls=0`}
            className="v4-hero-media"
            style={{ pointerEvents: 'none', transform: 'scale(1.35)' }}
          />
        )}
        <div className="v4-hero-overlay" />
        <div className="v4-hero-glow" />
        
        <motion.div 
          className="v4-hero-content"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="v4-badge">
            <StarIcon /> PREMIUM LIVE ENTERTAINMENT
          </div>
          <h1 className="v4-hero-title">
            Book Premium Artists<br/>For Every Event
          </h1>
          <p className="v4-hero-subtitle">
            Live Singers • DJs • Bands • Anchors
          </p>
          <button className="v4-btn-primary">
            Book Now
          </button>
        </motion.div>
      </section>
      */}

      {/* =========================================
          SECTION 3: CATEGORY VIDEOS
          ========================================= */}
      <section className="v4-videos-section">
        {categories.map((cat, idx) => {
          const catVideos = videos.filter(v => v.category_id === cat.id);
          if (catVideos.length === 0) return null;

          return (
            <motion.div 
              key={cat.id} 
              id={`cat-${cat.id}`} 
              className="v4-category-row"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
            >
              <div className="v4-row-header">
                <h2 className="v4-row-title">🎤 {cat.title}</h2>
                <p className="v4-row-subtitle">Watch Top Performances</p>
              </div>
              <div className="v4-videos-scroll">
                {catVideos.map(video => (
                  <VideoCard key={video.id} video={video} onSelect={setSelectedVideo} />
                ))}
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* =========================================
          SECTION 4: ALL VIDEOS (MASONRY)
          ========================================= */}
      <section className="v4-all-videos-section">
        <motion.div 
          className="v4-row-header"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 className="v4-row-title">📺 ALL VIDEOS</h2>
          <p className="v4-row-subtitle">Explore our full library of premium entertainment.</p>
        </motion.div>
        
        <div className="v4-masonry-grid">
          {videos.map((video, idx) => (
            <motion.div 
              key={video.id} 
              className="v4-masonry-item"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
            >
              <VideoCard video={video} onSelect={setSelectedVideo} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================
          VIDEO PREVIEW MODAL
          ========================================= */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="relative w-full max-w-5xl bg-[#0F1117] rounded-3xl overflow-hidden shadow-2xl border border-white/10"
              initial={{ scale: 0.9, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 50 }}
            >
              <button 
                className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 hover:bg-[#FF3D5E] rounded-full flex items-center justify-center text-white transition-colors text-xl font-bold"
                onClick={() => setSelectedVideo(null)}
              >
                ✕
              </button>
              
              <div className="aspect-video w-full bg-black">
                {getYoutubeId(selectedVideo.video_url) ? (
                  <iframe 
                    src={`https://www.youtube.com/embed/${getYoutubeId(selectedVideo.video_url)}?autoplay=1`} 
                    className="w-full h-full"
                    allow="autoplay; fullscreen"
                  />
                ) : (
                  <video src={selectedVideo.video_url} controls autoPlay className="w-full h-full object-contain" />
                )}
              </div>

              <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 bg-[#0F1117] border-t border-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500/10 to-transparent pointer-events-none"></div>
                <div className="relative z-10">
                  <h2 className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">{
                    (() => {
                      try {
                        const parsed = JSON.parse(selectedVideo.user_name);
                        return parsed.name || selectedVideo.user_name;
                      } catch (e) {
                        return selectedVideo.user_name || "Featured Performance";
                      }
                    })()
                  }</h2>
                  {(() => {
                    let typeText = "";
                    try {
                      if (selectedVideo.user_name && selectedVideo.user_name.startsWith('{')) {
                        const parsed = JSON.parse(selectedVideo.user_name);
                        if (parsed.type) typeText = parsed.type;
                      }
                    } catch (e) {}
                    
                    return typeText ? (
                      <div className="text-[#FFD166] text-[11px] sm:text-xs uppercase tracking-[0.2em] font-extrabold bg-[#FFD166]/10 inline-block px-3 py-1.5 rounded-md border border-[#FFD166]/20 mt-2">
                        {typeText}
                      </div>
                    ) : (
                      <p className="text-[#FF3D5E] text-sm uppercase tracking-widest font-bold mt-2">Premium Live Entertainment</p>
                    );
                  })()}
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto relative z-10">
                  <button className="h-14 px-10 bg-gradient-to-r from-[#FF3D5E] to-[#FF758C] hover:scale-105 text-white font-black rounded-full transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,61,94,0.4)] text-lg w-full sm:w-auto">
                    Book {
                      (() => {
                        try {
                          return JSON.parse(selectedVideo.user_name).name;
                        } catch(e) {
                          return selectedVideo.user_name || 'Featured Artist';
                        }
                      })()
                    }
                  </button>
                  <Link href={`/artist/${encodeURIComponent(
                    (() => {
                      try {
                        return JSON.parse(selectedVideo.user_name).name;
                      } catch(e) {
                        return selectedVideo.user_name || 'Artist';
                      }
                    })()
                  )}`} target={isMobile ? "_self" : "_blank"} className="w-full sm:w-auto">
                    <button className="h-14 px-10 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full transition-all w-full sm:w-auto flex items-center justify-center whitespace-nowrap">
                      View Profile
                    </button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
