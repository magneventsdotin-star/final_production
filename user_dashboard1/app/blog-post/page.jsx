"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase } from '@/app/lib/supabase'
import { defaultBlogs } from './data'
import '@/app/styles/pages/BlogPost.css'

export default function BlogPostPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (error) {
          if (error.code === '42P01' || error.message?.includes('find the table') || error.code?.startsWith('PGRST')) {
            console.warn('Table hero_slides does not exist yet.');
            setBlogs([]);
          } else {
            throw error;
          }
        } else {
          setBlogs(data || []);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  const featuredPost = defaultBlogs[0];
  const remainingPosts = defaultBlogs.slice(1);

  return (
    <main className="blog-page-wrapper">


      <section className="blog-modern-hero">
        <div className="lux-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="hero-badge"
          >
            THE MAGNEVENTS JOURNAL
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Insights into the <span className="text-gradient">Live Music</span> Scene
          </motion.h1>
          <p className="hero-subtext">Discover expert advice, artist highlights, and booking tips for your next big event.</p>
        </div>
      </section>

      <div className="lux-container">


        {featuredPost && (
          <section className="featured-section">
            <Link href={`/blog-post/${featuredPost.slug}`} className="featured-card">
              <div className="featured-image" style={{ position: 'relative', overflow: 'hidden' }}>
                <img
                  src={typeof featuredPost.img === "object" ? featuredPost.img?.src : featuredPost.img}
                  alt={featuredPost.title} style={{ objectFit: 'cover' }}
                 />
                <div className="featured-tag">FEATURED STORY</div>
              </div>
              <div className="featured-content">
                <span className="blog-cat">EXPERT GUIDE</span>
                <h2>{featuredPost.title}</h2>
                <p>{featuredPost.content.substring(0, 220)}...</p>
                <div className="featured-footer">
                  <span className="read-more">KEEP READING →</span>
                </div>
              </div>
            </Link>
          </section>
        )}


        <section className="recent-articles">
          <div className="section-header">
            <h3>Latest From The Blog</h3>
            <div className="header-line" />
          </div>

          <div className="blog-modern-grid">
            {remainingPosts.map((blog) => (
              <Link key={blog.id} href={`/blog-post/${blog.slug}`} className="modern-card-link">
                <motion.div
                  className="modern-blog-card"
                  whileHover={{ y: -10 }}
                >
                  <div className="card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                    <img
                      src={typeof blog.img === "object" ? blog.img?.src : blog.img}
                      alt={blog.title} style={{ objectFit: 'cover' }}  />
                    <div className="card-overlay" />
                  </div>
                  <div className="card-body">
                    <span className="card-tag">{blog.subtitle}</span>
                    <h4>{blog.title}</h4>
                    <p>{blog.content.substring(0, 120)}...</p>
                    <div className="card-footer">
                      <span className="cta-link">READ ARTICLE</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}


            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skel-blog-${i}`} className="modern-blog-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="skeleton-pulse" style={{ height: '260px', width: '100%', background: 'rgba(255,255,255,0.03)' }}></div>
                  <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '30px' }}>
                    <div className="skeleton-pulse" style={{ height: '12px', width: '30%', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '16px' }}></div>
                    <div className="skeleton-pulse" style={{ height: '24px', width: '80%', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', marginBottom: '16px' }}></div>
                    <div className="skeleton-pulse" style={{ height: '14px', width: '100%', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: '8px' }}></div>
                    <div className="skeleton-pulse" style={{ height: '14px', width: '70%', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', marginBottom: 'auto' }}></div>
                    
                    <div className="card-footer" style={{ marginTop: '30px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                      <div className="skeleton-pulse" style={{ height: '14px', width: '100px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              blogs.map((blog) => (
                <Link key={blog.id} href={`/blog-post/${blog.id}`} className="modern-card-link">
                  <motion.div className="modern-blog-card" whileHover={{ y: -10 }}>
                    {blog.image_url && (
                      <div className="card-image" style={{ position: 'relative', overflow: 'hidden' }}>
                        <img
                          src={typeof blog.image_url === "object" ? blog.image_url?.src : blog.image_url}
                          alt={blog.title} style={{ objectFit: 'cover' }}  />
                      </div>
                    )}
                    <div className="card-body">
                      <h4>{blog.title}</h4>
                      <p>{blog.subtitle}</p>
                      <div className="card-footer">
                        <span className="cta-link">READ ARTICLE</span>
                      </div>
                    </div>
                  </motion.div>
                </Link>
              ))
            )}
          </div>
        </section>


        <section className="modern-values">
          <div className="section-header centered">
            <h3>Why Choose Magnevents?</h3>
            <p>Setting the standard for luxury entertainment booking.</p>
          </div>

          <div className="values-grid">
            <ModernValueCard
              num="01"
              title="Handpicked for You"
              desc="Every singer and band is carefully selected to match your unique event style, vibe, and budget."
            />
            <ModernValueCard
              num="02"
              title="Hassle-Free Booking"
              desc="From your first call to the final song, our team takes care of every detail. Enjoy a smooth service."
            />
            <ModernValueCard
              num="03"
              title="Complete Setup"
              desc="We provide great artists plus professional sound engineers and equipment—so you enjoy music without zero hassle."
            />
          </div>
        </section>


        <section className="blog-cta-banner">
          <div className="cta-inner">
            <div className="cta-text">
              <h2>Ready to make some noise?</h2>
              <p>Consult with our entertainment experts today and get a curated list of artists for your event.</p>
            </div>
            <div className="cta-actions">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
                className="primary-cta-btn"
              >
                BOOK YOUR ARTIST
              </button>
              <Link href="/artists" className="secondary-red-btn">EXPLORE TALENT</Link>
            </div>
          </div>
        </section>

      </div>
    </main>
  )
}

function ModernValueCard({ num, title, desc }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="modern-value-card"
    >
      <div className="value-num">{num}</div>
      <h4>{title}</h4>
      <p>{desc}</p>
      <div className="card-accent" />
    </motion.div>
  )
}
