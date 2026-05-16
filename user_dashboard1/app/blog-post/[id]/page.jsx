"use client"

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { defaultBlogs } from '../data'
import '@/app/styles/pages/BlogPost.css'

export default function BlogDetailPage() {
  const { id } = useParams();
  
  const blogIndex = defaultBlogs.findIndex(b => b.slug === id || b.id === id);
  const blog = defaultBlogs[blogIndex];

  if (!blog) {
    return (
      <div className="blog-error-page">
        <h1>Article Not Found</h1>
        <Link href="/blog-post" className="back-btn">Back to Blog</Link>
      </div>
    );
  }

  // Helper to render simple markdown-like content
  const renderContent = (content) => {
    return content.split('\n').map((line, i) => {
      let trimmed = line.trim();
      if (!trimmed) return <br key={i} />;
      
      // Headers
      if (trimmed.startsWith('###')) return <h3 key={i} className="blog-h3">{trimmed.replace('###', '').trim()}</h3>;
      
      // Bold
      let parts = trimmed.split('**');
      let renderedLine = parts.map((part, index) => {
        return index % 2 === 1 ? <strong key={index}>{part}</strong> : part;
      });

      // Lists
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
      
      {/* HERO SECTION */}
      <section className="blog-detail-hero">
        <div className="blog-hero-image">
          <img src={blog.img} alt={blog.title} />
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

      {/* CONTENT & SIDEBAR */}
      <section className="blog-detail-main">
        <div className="lux-container blog-flex-layout">
          
          {/* ARTICLE BODY */}
          <article className="blog-article-body">
            {blog.subtitle && <h2 className="blog-lead-text">{blog.subtitle}</h2>}
            
            <div className="blog-rich-content">
              {renderContent(blog.content)}
            </div>

            {/* FINAL FOOTER ACTIONS */}
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

              {/* MOVED TO BOTTOM AS REQUESTED */}
              <div className="back-to-last-section">
                <Link href="/blog-post" className="final-back-btn">
                  ← BACK TO BLOG MAIN PAGE
                </Link>
              </div>
            </div>
          </article>

          {/* STICKY SIDEBAR */}
          <aside className="blog-sidebar">
            <div className="sidebar-sticky-wrap">
              <h4 className="sidebar-title">Must Read</h4>
              <div className="sidebar-articles">
                {defaultBlogs.filter(b => b.id !== blog.id).map(item => (
                  <Link key={item.id} href={`/blog-post/${item.slug}`} className="sidebar-card">
                    <div className="side-img">
                      <img src={item.img} alt={item.title} />
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
