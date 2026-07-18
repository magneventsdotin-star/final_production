"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RoleSelector, ArtistForm, EventForm, SuccessView } from './register'
import '@/app/styles/components/ContactModal.css'

export default function RegisterModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState('selection')
  const [submitted, setSubmitted] = useState(false)

  const copyToClipboard = (path) => {
    const url = window.location.origin + path;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  useEffect(() => {
    const handleOpen = (e) => {
      setIsOpen(true)
      setSubmitted(false)
      setView(e?.detail?.view || 'selection')
    }
    window.addEventListener('open-register-modal', handleOpen)
    return () => window.removeEventListener('open-register-modal', handleOpen)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      document.body.classList.add('modal-open')
    } else {
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
    }
    return () => {
      document.body.style.overflow = ''
      document.body.classList.remove('modal-open')
    }
  }, [isOpen])



  return (
    <AnimatePresence>
      {isOpen && (
        <div className="lux-modal-root">
          <div className="lux-modal-backdrop" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`lux-modal-content register ${view === 'selection' ? 'selection-view' : ''}`}
            style={{ position: 'relative' }}
          >
            <div className="modal-glow-bg" style={{ background: 'radial-gradient(ellipse at center, rgba(255, 224, 50, 0.06) 0%, transparent 70%)' }} />
            
            <button className="lux-modal-close" onClick={() => setIsOpen(false)} aria-label="Close modal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
            </button>

            {view !== 'selection' && !submitted && (
              <button 
                onClick={() => setView('selection')} 
                style={{
                  position: 'absolute',
                  top: '16px',
                  left: '16px',
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: 'rgba(255, 255, 255, 0.7)',
                  borderRadius: '20px',
                  padding: '5px 12px',
                  fontSize: '10px',
                  fontWeight: '700',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.2s ease',
                  zIndex: 10
                }}
                className="lux-modal-back-btn"
              >
                <span>← Back</span>
              </button>
            )}

            {view === 'selection' && <RoleSelector setView={setView} />}
            {submitted && <SuccessView view={view} setIsOpen={setIsOpen} />}
            {view === 'artist' && !submitted && <ArtistForm copyToClipboard={copyToClipboard} setSubmitted={setSubmitted} />}
            {view === 'event' && !submitted && <EventForm copyToClipboard={copyToClipboard} setSubmitted={setSubmitted} />}

          </motion.div>
        </div>
      )}

      <style jsx global>{`
        /* Avoid top/bottom truncation on mobile viewports */
        .lux-modal-root {
          position: fixed;
          inset: 0;
          z-index: 10000;
          display: flex;
          align-items: flex-start !important;
          justify-content: center;
          padding: 24px 8px !important;
          overflow-y: auto !important;
        }

        .lux-modal-content.selection-view {
          max-width: 680px !important;
          padding: 40px !important;
          margin-top: 20px;
        }

        .registration-options-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
          margin-top: 32px;
        }

        .registration-option-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          padding: 32px 24px;
          cursor: pointer;
          transition: all 0.35s cubic-bezier(0.23, 1, 0.32, 1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 16px;
          position: relative;
          overflow: hidden;
        }

        .option-glow {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }

        .glow-event {
          background: radial-gradient(circle at center, rgba(255, 224, 50, 0.08) 0%, transparent 70%);
        }

        .glow-artist {
          background: radial-gradient(circle at center, rgba(0, 212, 255, 0.08) 0%, transparent 70%);
        }

        .option-icon {
          font-size: 54px;
          line-height: 1;
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.4));
          transition: transform 0.3s ease;
        }

        .registration-option-card h4 {
          font-size: 20px;
          font-weight: 800;
          color: #fff;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .registration-option-card p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.55);
          line-height: 1.6;
          margin: 0;
          min-height: 60px;
        }

        .option-cta-btn {
          width: 100%;
          padding: 12px 20px;
          border-radius: 12px;
          font-size: 13px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border: none;
          cursor: pointer;
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .btn-event {
          background: var(--brand-primary);
          color: var(--bg-main);
          box-shadow: 0 4px 15px rgba(255, 224, 50, 0.15);
        }

        .btn-artist {
          background: linear-gradient(135deg, #00d4ff 0%, #0072ff 100%);
          color: #fff;
          box-shadow: 0 4px 15px rgba(0, 212, 255, 0.2);
        }

        /* Hover Actions */
        .registration-option-card:hover {
          transform: translateY(-8px);
          background: rgba(255, 255, 255, 0.04);
        }

        .registration-option-card:hover .option-icon {
          transform: scale(1.1) rotate(4deg);
        }

        .registration-option-card:hover .option-glow {
          opacity: 1;
        }

        .registration-option-card.card-event:hover {
          border-color: var(--brand-gold, #FFE032);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(255, 224, 50, 0.12);
        }

        .registration-option-card.card-artist:hover {
          border-color: #00d4ff;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 20px rgba(0, 212, 255, 0.15);
        }

        .registration-option-card:hover .option-cta-btn.btn-event {
          background: var(--brand-primary-hover);
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(255, 224, 50, 0.3);
        }

        .registration-option-card:hover .option-cta-btn.btn-artist {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 212, 255, 0.4);
        }

        /* Mobile specific style overrides - Increase width, decrease height, remove long text */
        @media (max-width: 680px) {
          .lux-modal-content.selection-view {
            padding: 24px 16px !important;
            margin: 10px 4px !important;
            max-width: calc(100% - 8px) !important;
            width: calc(100% - 8px) !important;
            border-radius: 20px !important;
          }

          .registration-options-grid {
            grid-template-columns: 1fr;
            gap: 12px;
            margin-top: 18px;
            width: 100%;
          }

          .registration-option-card {
            padding: 16px 14px;
            gap: 8px;
            border-radius: 16px;
          }

          .option-icon {
            font-size: 36px;
          }

          .registration-option-card h4 {
            font-size: 18px;
          }

          .registration-option-card p {
            font-size: 12px;
            min-height: auto;
            line-height: 1.4;
            color: rgba(255, 255, 255, 0.65);
          }

          .option-cta-btn {
            padding: 10px 16px;
            font-size: 12px;
            margin-top: 4px;
          }

          .lux-modal-back-btn {
            top: 12px !important;
            left: 12px !important;
            padding: 4px 10px !important;
          }
        }
      `}</style>
    </AnimatePresence>
  )
}
