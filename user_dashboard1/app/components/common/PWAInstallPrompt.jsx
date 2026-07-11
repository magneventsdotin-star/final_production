"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import '@/app/styles/components/PWAInstallPrompt.css';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/') return;

    // Only show on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent);
    if (!isMobile) return;

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    const hasBeenDismissed = localStorage.getItem('magnevents-pwa-dismissed');
    if (hasBeenDismissed === 'true') {
      return;
    }

    const hasBeenShownThisSession = sessionStorage.getItem('magnevents-pwa-shown-session');
    if (hasBeenShownThisSession === 'true') {
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      
      if (localStorage.getItem('magnevents-pwa-dismissed') === 'true') return;

      setDeferredPrompt(e);
      window.deferredPrompt = e;
      setShowPrompt(true);
      sessionStorage.setItem('magnevents-pwa-shown-session', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    if (window.deferredPrompt) {
      if (localStorage.getItem('magnevents-pwa-dismissed') !== 'true') {
        setDeferredPrompt(window.deferredPrompt);
        setShowPrompt(true);
        sessionStorage.setItem('magnevents-pwa-shown-session', 'true');
      }
    } else {
      const timer = setTimeout(() => {
        if (localStorage.getItem('magnevents-pwa-dismissed') !== 'true' && sessionStorage.getItem('magnevents-pwa-shown-session') !== 'true') {
          setShowPrompt(true);
          sessionStorage.setItem('magnevents-pwa-shown-session', 'true');
        }
      }, 3000);
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        clearTimeout(timer);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    const promptEvent = deferredPrompt || window.deferredPrompt;

    if (promptEvent) {
      try {
        promptEvent.prompt();
        const { outcome } = await promptEvent.userChoice;
        if (outcome === 'accepted') {
          localStorage.setItem('magnevents-pwa-dismissed', 'true');
          setDeferredPrompt(null);
          window.deferredPrompt = null;
        }
      } catch (err) {
        console.error("Error triggering native install prompt:", err);
      }
    }
    
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('magnevents-pwa-dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div 
          className="pwa-floating-card"
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 50, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
        >
          <div className="pwa-card-glow" />
          <div className="pwa-card-content">
            <div className="pwa-app-logo" style={{ overflow: 'hidden', position: 'relative', width: '80px', height: '48px', flexShrink: 0, backgroundColor: 'transparent' }}>
              <Image 
                src="/logo.webp" 
                alt="Magnevents Logo" 
                fill
                sizes="80px"
                style={{ objectFit: 'contain', filter: 'invert(1) brightness(2)' }}
              />
            </div>
            <div className="pwa-text-block">
              <h4>Install Magnevents App</h4>
              <p>Book live artists instantly. Enjoy faster load times and native app experiences.</p>
            </div>
          </div>
          
          <div className="pwa-action-buttons">
            <button className="pwa-btn-dismiss" onClick={handleDismiss}>
              Maybe Later
            </button>
            <button className="pwa-btn-install" onClick={handleInstallClick}>
              Install App
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
