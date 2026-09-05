"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SEODynamicContent({ category, city, overviewHtml, services, faqs, relatedLinks }) {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="seo-dynamic-content" style={{ padding: '60px 20px', background: '#050505', color: '#eee' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '80px' }}>
        
        {/* Overview Section */}
        <section className="seo-overview" style={{ lineHeight: '1.8', fontSize: '1.1rem', color: 'rgba(255,255,255,0.85)' }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: '30px', color: '#fff' }}>About Hiring a {category} in {city}</h2>
          <div dangerouslySetInnerHTML={{ __html: overviewHtml }} />
        </section>

        {/* Services Section */}
        <section className="seo-services">
          <h2 style={{ fontSize: '2rem', marginBottom: '40px', color: '#fff', textAlign: 'center' }}>Popular Services for {category}s in {city}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px' }}>
            {services.map((srv, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', padding: '30px', borderRadius: '12px' }}>
                <CheckCircle size={32} style={{ color: 'var(--brand-primary, #FFE032)', marginBottom: '20px' }} />
                <h3 style={{ fontSize: '1.4rem', marginBottom: '15px', color: '#fff' }}>{srv.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>{srv.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="seo-faqs" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '40px', color: '#fff', textAlign: 'center' }}>Frequently Asked Questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {faqs.map((faq, idx) => (
              <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? -1 : idx)}
                  style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', background: 'transparent', color: '#fff', fontSize: '1.1rem', fontWeight: '500', cursor: 'pointer', border: 'none', textAlign: 'left' }}
                >
                  <span>{faq.question}</span>
                  <ChevronDown size={20} style={{ transform: openFaq === idx ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }} />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div style={{ padding: '0 20px 20px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6' }}>
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </section>

        {/* Related Links */}
        <section className="seo-related" style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '30px', color: '#fff' }}>Related Searches in {city}</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center' }}>
            {relatedLinks.map((link, idx) => (
              <Link key={idx} href={link.url} style={{ padding: '10px 20px', background: 'rgba(255,255,255,0.05)', borderRadius: '30px', color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.95rem', transition: 'background 0.3s' }}>
                {link.title}
              </Link>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
