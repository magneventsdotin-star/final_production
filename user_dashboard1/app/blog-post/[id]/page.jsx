"use client"

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { supabase } from '@/app/lib/supabase'
import { defaultBlogs } from '../data'
import '@/app/styles/pages/BlogPost.css'

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlog = async () => {

      const staticBlog = defaultBlogs.find(b => b.slug === id || b.id === id);
      if (staticBlog) {
        setBlog(staticBlog);
        setLoading(false);
        return;
      }


      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          if (error.code === 'PGRST116' || error.code === '42P01') {

            setBlog(null);
          } else {
            console.error("Error fetching dynamic blog:", error);
          }
        } else if (data) {
          setBlog({
            id: data.id,
            slug: data.id,
            title: data.title,
            subtitle: data.subtitle,
            img: data.image_url,
            content: data.content || '',
          });
        }
      } catch (err) {
        console.error("Failed to load dynamic blog:", err);
      } finally {
        setLoading(false);
      }
    };

    loadBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="blog-error-page" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Loading Article...</h2>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="blog-error-page">
        <h1>Article Not Found</h1>
        <p className="error-sub" style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '0.5rem', marginBottom: '1.5rem' }}>The article you are looking for does not exist or has been removed.</p>
        <Link href="/blog-post" className="back-btn">Back to Blog</Link>
      </div>
    );
  }

  const renderContent = (content) => {
    return content.split('\n').map((line, i) => {
      let trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      if (trimmed.startsWith('###')) return <h3 key={i} className="blog-h3">{trimmed.replace('###', '').trim()}</h3>;


      let parts = trimmed.split('**');
      let renderedLine = parts.map((part, index) => {
        return index % 2 === 1 ? <strong key={index}>{part}</strong> : part;
      });

      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        return <li key={i} className="blog-li">{renderedLine.slice(1)}</li>;
      }
      if (/^\d+\./.test(trimmed)) {
        return <li key={i} className="blog-li numbered">{renderedLine}</li>;
      }

      return <p key={i}>{renderedLine}</p>;
    });
  };

  return (
    <main className="blog-detail-layout">


      <section className="blog-detail-hero">
        <div className="blog-hero-image" style={{ position: 'relative', overflow: 'hidden' }}>
          <img
            src={typeof blog.img === "object" ? blog.img?.src : blog.img}
            alt={blog.title} style={{ objectFit: 'cover' }}
           />
          <div className="blog-hero-overlay">
            <div className="lux-container">
              <span className="blog-cat-pill">ARTIST INSIGHTS</span>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="blog-main-title"
              >
                {blog.title}
              </motion.h1>
            </div>
          </div>
        </div>
      </section>


      <section className="blog-detail-main">
        <div className="lux-container blog-flex-layout">


          <article className="blog-article-body">
            {blog.subtitle && <h2 className="blog-lead-text">{blog.subtitle}</h2>}

            <div className="blog-rich-content">
              {renderContent(blog.content)}
            </div>


            <div className="blog-article-footer">
              <div className="footer-divider" />

              <div className="consult-box">
                <h3>Want a similar vibe for your event?</h3>
                <p>Our experts can help you book the perfect artist based on this article.</p>

                <div className="consult-actions">
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('open-contact-modal'))}
                    className="consult-btn"
                  >
                    CONSULT WITH AN EXPERT
                  </button>
                  <Link href="/blog-post" className="consult-back-btn">
                    BACK TO BLOG MAIN
                  </Link>
                </div>
              </div>


              <div className="back-to-last-section">
                <Link href="/blog-post" className="final-back-btn">
                  ← BACK TO BLOG MAIN PAGE
                </Link>
              </div>
            </div>
          </article>


          <aside className="blog-sidebar">
            <div className="sidebar-sticky-wrap">
              <h4 className="sidebar-title">Must Read</h4>
              <div className="sidebar-articles">
                {defaultBlogs.filter(b => b.id !== blog.id).map(item => (
                  <Link key={item.id} href={`/blog-post/${item.slug}`} className="sidebar-card">
                    <div className="side-img" style={{ position: 'relative', overflow: 'hidden' }}>
                      <img
                        src={typeof item.img === "object" ? item.img?.src : item.img}
                        alt={item.title} style={{ objectFit: 'cover' }}  />
                    </div>
                    <div className="side-info">
                      <h5>{item.title}</h5>
                      <span className="side-link">READ MORE →</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

        </div>
      </section>

    </main>
  );
}
