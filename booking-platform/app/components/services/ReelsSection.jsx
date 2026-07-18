"use client";

/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@database/connection/supabase';


import { ReelsHero, ReelsGroup, HowToBook, ReelsSkeleton } from './reels';

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
          const groups = {};
          
          // Set background video first if available
          const bgVideo = data.find(v => v.topic === 'Live Performance Background');
          if (bgVideo) setBackgroundVideo(bgVideo);

          data.forEach((video) => {
            if (video.topic === 'Live Performance Background') {
              return;
            }

            const key = video.topic || 'Featured Showcases';
            if (!groups[key]) {
              groups[key] = [];
            }
            groups[key].push(video);
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
    return <ReelsSkeleton />;
  }

  const finalGroups = groupedVideos;

  return (
    <div>
      <ReelsHero backgroundVideo={backgroundVideo} />

      <section className="reels-content-section" style={{ padding: '60px 0', background: '#050505' }}>
      
      {(() => {
        const categoryDescriptions = {
          'Singers': 'Looking to hire a singer for a party or wedding? Our solo singers for hire are handpicked for their talent, stage presence, and ability to light up any event. Whether you need an acoustic guitarist singer for hire or a powerhouse vocalist, we’ve got you covered.',
          'Live Solo Singers': 'Book Solo Singers for Hire Near You',
          'Live Bands': 'Hire a Band for Your Party or Event',
          'Sufi Bands': 'Book Soulful Sufi Bands & Live Musicians for Events',
          'Club DJs': 'Looking to hire a DJ for an unforgettable night? Our club DJs bring high-energy beats and keep the dance floor packed.',
          'Anchors & Talents': 'Hire professional anchors, emcees, and talents to host your event and keep your audience fully engaged.',
          'Featured Showcases': 'Discover our premium selection of top-tier talent and exclusive performances curated just for you.'
        };
        
        return Object.entries(finalGroups).map(([category, videos]) => {
          const visibleVideos = [...videos].filter((vid) => vid.main_headingvideo === true);

          if (visibleVideos.length === 0) return null;

          let customMainHeading = null;
          let customSubHeading = null;
          try {
             if (visibleVideos[0]?.user_name && visibleVideos[0].user_name.startsWith('{')) {
                const parsed = JSON.parse(visibleVideos[0].user_name);
                if (parsed.mainHeading) customMainHeading = parsed.mainHeading;
                if (parsed.subHeading) customSubHeading = parsed.subHeading;
             }
          } catch(e) {}
          
          const displayHeading = customMainHeading || category;
          const displaySubHeading = customSubHeading || categoryDescriptions[category];

          return (
            <ReelsGroup 
              key={category}
              category={category}
              videos={videos}
              displayHeading={displayHeading}
              displaySubHeading={displaySubHeading}
            />
          );
        });
      })()}

      <HowToBook />

      </section>
    </div>
  );
}
