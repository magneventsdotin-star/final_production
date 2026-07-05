"use client"

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { supabase } from '@/app/lib/supabase';
import { motion, useScroll, useTransform } from 'framer-motion';
import { 
  MapPin, BadgeCheck, Languages, FileText, 
  Camera, Film, ZoomIn, Play, Quote 
} from 'lucide-react';
import '@/app/styles/pages/ArtistProfile.css';

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.165, 0.84, 0.44, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const SectionHeader = ({ icon: Icon, title, subtitle }) => (
  <motion.div 
    className="section-header-modern"
    variants={fadeInUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true, margin: "-100px" }}
  >
    <h2 className="section-title">
      {Icon && <Icon className="section-title-icon" strokeWidth={1.5} />}
      {title}
    </h2>
    {subtitle && <div className="section-subtitle">{subtitle}</div>}
    <div className="animated-underline" />
  </motion.div>
);

export default function ArtistProfilePage({ params }) {
  const [artist, setArtist] = useState(null);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const heroRef = useRef(null);

  // Parallax scroll effect for hero background
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 1000], [0, 300]);

  const decodedId = decodeURIComponent(params.id);

  useEffect(() => {
    if (selectedImage) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
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
          query = query.or(`alias.ilike.%${decodedId}%,name.ilike.%${decodedId}%`);
        }

        let { data } = await query.limit(1).single();

        if (data) {
          setArtist(data);
          const { data: vids } = await supabase
            .from('service_videos')
            .select('*')
            .or(`userName.ilike.%${data.alias || data.name}%,artistName.ilike.%${data.alias || data.name}%`);
          
          if (vids && vids.length > 0) {
            setVideos(vids);
          } else if (data.video_url) {
            const urls = data.video_url.split(',').map(u => u.trim());
            setVideos(urls.map((url, idx) => ({ id: idx, video_url: url })));
          }
        } else {
          // Fallback if no main artist found, check service_videos directly
          const { data: svData } = await supabase
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
              performing_language: 'English, Regional',
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
      <div className="artist-profile-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontFamily: 'Playfair Display', fontSize: '24px', color: '#E0BFB8', letterSpacing: '0.2em', textTransform: 'uppercase' }}
        >
          Curating Profile...
        </motion.div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="artist-profile-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <h1 style={{ fontFamily: 'Playfair Display', color: 'white', fontSize: '32px' }}>Artist Not Found</h1>
      </div>
    );
  }

  const name = artist.alias || artist.name;
  const categories = [artist.category, artist.sub_category].filter(Boolean).join(', ');
  const coverImage = artist.artist_images && artist.artist_images.length > 0 
    ? artist.artist_images[0].image_url 
    : 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=2070&auto=format&fit=crop'; 

  return (
    <main className="artist-profile-wrapper">
      {/* Cinematic Hero */}
      <section className="artist-hero-card" ref={heroRef}>
        <motion.div 
          className="hero-bg-image" 
          style={{ backgroundImage: `url(${coverImage})`, y: heroY }} 
        />
        <div className="hero-gradient-overlay" />
        
        <motion.div 
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <div className="hero-text-area">
            <motion.div className="artist-badges" variants={fadeInUp}>
              <span className="badge-item glass-badge"><BadgeCheck size={14} style={{ display: 'inline', marginRight: 4, marginBottom: 2 }} /> Premium Artist</span>
              {artist.city && <span className="badge-item glass-badge"><MapPin size={14} style={{ display: 'inline', marginRight: 4, marginBottom: 2 }} /> {artist.city}</span>}
              {artist.performing_language && <span className="badge-item glass-badge"><Languages size={14} style={{ display: 'inline', marginRight: 4, marginBottom: 2 }} /> {artist.performing_language}</span>}
            </motion.div>
            
            <motion.h1 className="artist-name" variants={fadeInUp}>
              {name}
            </motion.h1>
            
            <motion.div className="artist-genres" variants={fadeInUp}>
              {categories ? categories.split(',').map((cat, i) => (
                <span key={i} className="genre-pill">{cat.trim()}</span>
              )) : (
                <span className="genre-pill">Live Performer</span>
              )}
            </motion.div>

            <motion.div className="hero-actions" variants={fadeInUp}>
              <button 
                className="btn-primary-elegant" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: { name } } }))}
              >
                Book Performance
              </button>
              <button 
                className="btn-secondary-elegant" 
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal', { detail: { type: 'booking', artist: { name } } }))}
              >
                Contact Now
              </button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      <div className="artist-container">
        
        {/* Floating Booking / Stats Card */}
        <motion.div 
          className="booking-float-card"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="stat-block">
            <span className="stat-label-lux">Original Price</span>
            <span className="stat-value-lux" style={{ textDecoration: 'line-through', opacity: 0.5, fontSize: '24px' }}>
              ₹{artist.price_min ? (artist.price_min + 5000).toLocaleString() : '15,000'}
            </span>
          </div>
          <div className="stat-block">
            <span className="stat-label-lux">Exclusive Price</span>
            <span className="stat-value-lux accent">
              ₹{artist.price_min ? artist.price_min.toLocaleString() : '10,000'}
            </span>
          </div>
          <div className="stat-block">
            <span className="stat-label-lux">Rating</span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span className="stat-value-lux">{(artist.rating || 5.0).toFixed(1)}</span>
              <span style={{ color: '#E0BFB8' }}>★★★★★</span>
            </div>
          </div>
          <div className="stat-block">
            <span className="stat-label-lux">Total Shows</span>
            <span className="stat-value-lux">{artist.successful_bookings || '150+'}</span>
          </div>
        </motion.div>

        {/* Professional Bio Quote Card */}
        <section className="info-section">
          <SectionHeader 
            icon={FileText}
            title="Professional Bio" 
            subtitle="The artist's journey and repertoire."
          />
          <motion.div 
            className="luxury-quote-card"
            variants={fadeInUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <Quote className="quote-mark" />
            <p className="bio-text-lux">
              {artist.bio || "A spectacular performer known for bringing high energy and unforgettable moments to every stage. Whether it's a corporate event, a private wedding, or a grand festival, their versatile talent ensures the crowd is always engaged and amazed."}
            </p>
          </motion.div>
        </section>

        {/* Photo Gallery - Pinterest Masonry */}
        {artist.artist_images && artist.artist_images.length > 0 && (
          <section className="info-section">
            <SectionHeader 
              icon={Camera}
              title="Photo Gallery" 
              subtitle="Captured luxury moments from exclusive events."
            />
            <motion.div 
              className="masonry-gallery"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {artist.artist_images.map((img, idx) => (
                <motion.div 
                  key={idx} 
                  className="masonry-item" 
                  variants={fadeInUp}
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <img src={img.image_url} alt={`${name} performance ${idx + 1}`} loading="lazy" />
                  <div className="masonry-item-overlay">
                    <div className="zoom-icon-wrapper">
                      <ZoomIn size={24} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </section>
        )}

        {/* Video Formats */}
        <section className="info-section" style={{ paddingBottom: '100px' }}>
          <SectionHeader 
            icon={Film}
            title="Cinematic Performances" 
            subtitle="Live videos and exclusive showcases."
          />
          
          <motion.div 
            className="video-grid-lux"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {videos.length > 0 ? videos.map((vid, idx) => {
              const url = vid.video_url;
              const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
              const match = url?.match(regExp);
              const ytId = (match && match[2].length === 11) ? match[2] : null;

              return (
                <motion.div key={idx} className="lux-video-card" variants={fadeInUp}>
                  {ytId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1&controls=1&autoplay=1&mute=0&playsinline=1&iv_load_policy=3&fs=0`}
                      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 'none', objectFit: 'contain' }}
                      allow="autoplay; encrypted-media"
                    />
                  ) : (
                    <>
                      <div style={{ position: 'absolute', inset: -20, background: 'linear-gradient(45deg, #000, #111)', filter: 'blur(20px)', zIndex: 0 }} />
                      <video 
                        src={url}
                        controls
                        autoPlay
                        playsInline
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'contain', zIndex: 1 }}
                      />
                    </>
                  )}
                  {/* Decorative Gradient Shadow */}
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)', zIndex: 20 }} />
                </motion.div>
              )
            }) : (
              <p style={{ color: 'rgba(255,255,255,0.5)', fontFamily: 'Playfair Display', fontSize: '20px' }}>No cinematic performances available yet.</p>
            )}
          </motion.div>
        </section>

      </div>

      {/* Lightbox Modal */}
      {selectedImage && typeof document !== 'undefined' && createPortal(
        <motion.div 
          className="lightbox-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="lightbox-close"
            onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
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

          <motion.img 
            src={selectedImage} 
            alt="Expanded luxury view" 
            className="lightbox-image"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()} 
          />
          
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
        </motion.div>,
        document.body
      )}
    </main>
  );
}
