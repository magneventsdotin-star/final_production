"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import '@/app/styles/components/PWAInstallPrompt.css';

export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);

  useEffect(() => {
    // Safety check for server rendering environment
    if (typeof window === 'undefined') return;

    // 1. Detect if the app is already running in standalone/installed mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;
    if (isStandalone) {
      return;
    }

    // 2. Check if the user has previously dismissed the install prompt persistently
    const isDismissed = localStorage.getItem('magnevents-pwa-dismissed');
    if (isDismissed === 'true') {
      return;
    }

    // 3. Identify iOS users
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
    
    if (isAppleDevice) {
      setIsIOS(true);
    }

    // 4. Always show the gorgeous banner automatically 2 seconds after the user visits the page!
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    // Try to retrieve the native install prompt
    let promptEvent = window.deferredPrompt;

    if (!promptEvent) {
      // Small delay to capture event if hydration triggered it
      await new Promise(resolve => setTimeout(resolve, 100));
      promptEvent = window.deferredPrompt;
    }

    if (promptEvent) {
      try {
        // Trigger Chrome/Android native installation automatically!
        promptEvent.prompt();
        
        // Wait for the user to resolve the prompt
        const { outcome } = await promptEvent.userChoice;
        
        if (outcome === 'accepted') {
          localStorage.setItem('magnevents-pwa-dismissed', 'true');
          window.deferredPrompt = null;
          setShowPrompt(false);
        }
      } catch (err) {
        console.error("Error launching native PWA install prompt:", err);
        setShowAndroidGuide(true);
      }
    } else {
      // Streamlined backup guidance with brand logo if native engine is still caching
      setShowAndroidGuide(true);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('magnevents-pwa-dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <>
      <AnimatePresence>
        {showPrompt && !showIOSGuide && !showAndroidGuide && (
          <motion.div 
            className="pwa-floating-card"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          >
            <div className="pwa-card-glow" />
            <div className="pwa-card-content">
              <div className="pwa-app-logo" style={{ overflow: 'hidden', position: 'relative' }}>
                <Image 
                  src="/assets/magnevents-logo.jpg" 
                  alt="Magnevents Logo" 
                  fill
                  sizes="48px"
                  style={{ objectFit: 'cover' }}
                />
              </div>
              <div className="pwa-text-block">
                <h4>Install Magnevents App</h4>
                <p>Enjoy offline bookings, rapid touch load times, and premium full-screen interface.</p>
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

      {/* iOS Step-by-Step Interactive Guide */}
      <AnimatePresence>
        {showIOSGuide && (
          <motion.div 
            className="pwa-ios-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowIOSGuide(false)}
          >
            <motion.div 
              className="pwa-ios-modal-card"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ios-modal-indicator" />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 20px rgba(214, 80, 80, 0.3)' }}>
                  <Image 
                    src="/assets/magnevents-logo.jpg" 
                    alt="Magnevents Logo" 
                    fill
                    sizes="64px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '20px', fontWeight: '700' }}>Install Magnevents App</h3>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.5)', fontSize: '13.5px', textAlign: 'center' }}>
                  Run Magnevents as a native full-screen app in 3 quick steps:
                </p>
              </div>

              <div className="ios-steps-list">
                <div className="ios-step-row">
                  <span className="ios-step-badge">1</span>
                  <p>Tap the **Share** icon <code>📤</code> at the bottom of Safari.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">2</span>
                  <p>Scroll down the share list and select **"Add to Home Screen"** <code>➕</code>.</p>
                </div>
                <div className="ios-step-row">
                  <span className="ios-step-badge">3</span>
                  <p>Tap **"Add"** in the top right corner of your screen!</p>
                </div>
              </div>

              <button className="ios-modal-btn-close" onClick={() => { setShowIOSGuide(false); setShowPrompt(false); localStorage.setItem('magnevents-pwa-dismissed', 'true'); }}>
                Got It, Thanks!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Android/Desktop Streamlined Instruction Modal */}
      <AnimatePresence>
        {showAndroidGuide && (
          <motion.div 
            className="pwa-ios-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAndroidGuide(false)}
          >
            <motion.div 
              className="pwa-ios-modal-card"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 250 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ios-modal-indicator" />
              
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '12px 0' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '16px', overflow: 'hidden', position: 'relative', boxShadow: '0 8px 20px rgba(214, 80, 80, 0.3)' }}>
                  <Image 
                    src="/assets/magnevents-logo.jpg" 
                    alt="Magnevents Logo" 
                    fill
                    sizes="64px"
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                
                <h3 style={{ margin: '8px 0 0', color: '#fff', fontSize: '20px', fontWeight: '700' }}>Install Magnevents App</h3>
                
                <p style={{ margin: 0, color: '#eee', fontSize: '14.5px', textAlign: 'center', lineHeight: '1.6', maxWidth: '380px' }}>
                  Tap the browser menu icon <code>⋮</code> or look at your address bar, then select <strong>"Install app"</strong> or <strong>"Add to Home Screen"</strong> to enjoy the full offline-booking premium experience!
                </p>
              </div>

              <button className="ios-modal-btn-close" onClick={() => { setShowAndroidGuide(false); setShowPrompt(false); localStorage.setItem('magnevents-pwa-dismissed', 'true'); }}>
                Got It, Let's Do It!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
