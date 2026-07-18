import React from 'react';
import { getYoutubeId } from './ReelsHero';

export default function ReelCard({ vid, category }) {
  const ytId = getYoutubeId(vid.video_url);
  const artistName = vid.userName || vid.artistName || `Performer from ${category}`;

  return (
    <div 
      className="reel-card"
      style={{ cursor: 'pointer' }}
      onClick={() => {
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
      
      {/* Book Now Overlay */}
      <div className="book-now-overlay">
        Book Now
      </div>
    </div>
  );
}
