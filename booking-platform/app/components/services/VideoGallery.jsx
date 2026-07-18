"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@database/connection/supabase'
import '@/app/styles/components/VideoGallery.css'

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function VideoGallery() {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const { data, error } = await supabase
          .from('service_videos')
          .select('id, topic, video_url, user_name, category')
          .order('created_at', { ascending: false });

        if (error) {
           if (error.code === '42P01' || error.message?.includes('find the table') || error.code?.startsWith('PGRST')) {

             setTopics([]);
             return;
           }
           console.error("Error fetching service videos:", error);
           setTopics([]);
           return;
        }


        const grouped = (data || []).reduce((acc, video) => {
          const topicName = video.topic || 'Other';
          if (!acc[topicName]) {
            acc[topicName] = [];
          }
          acc[topicName].push(video);
          return acc;
        }, {});

        const topicArray = Object.keys(grouped).map(key => ({
          name: key,
          videos: grouped[key]
        }));

        setTopics(topicArray);
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <section className="video-gallery-section" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-gradient">Loading services...</div>
      </section>
    );
  }

  if (topics.length === 0) {
    return null;
  }

  return (
    <section className="video-gallery-section" id="services">
      <div className="video-gallery-header">
        <span className="accent-tag">PORTFOLIO</span>
        <h2>Our <span className="text-gradient">Services</span></h2>
        <p>Discover our specialized entertainment categories and watch featured performances.</p>
      </div>

      <div className="video-topics-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {topics.map((topic, topicIdx) => (
          <div key={topic.name} className="topic-group" style={{ marginBottom: '60px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
              <h3 style={{
                fontSize: '28px',
                color: '#fff',
                fontFamily: 'var(--font-display, serif)',
                margin: 0,
                paddingRight: '20px'
              }}>
                {topic.name}
              </h3>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(90deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 100%)' }}></div>
            </div>

            <div className="video-grid">
              {topic.videos.map((video, idx) => {
                const ytId = getYoutubeId(video.video_url);
                return (
                  <motion.div
                    key={video.id + '-' + idx}
                    className="video-card"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
                  >
                    <div className="video-wrapper">
                      {ytId ? (
                        <iframe
                          src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={video.video_url}
                          controls
                          controlsList="nodownload"
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        ></video>
                      )}
                    </div>
                    <div className="video-info">
                      <h4>{video.user_name || `Featured ${topic.name}`}</h4>
                      <div className="play-icon-overlay">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 5V19L19 12L8 5Z" fill="currentColor"/>
                        </svg>
                        <span>Play</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

