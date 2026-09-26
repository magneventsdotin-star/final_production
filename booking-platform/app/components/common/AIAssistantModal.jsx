"use client";

import React, { useState, useRef, useEffect } from 'react';
import { bookingService } from '@/app/services/bookingService';
import { AIIcon } from '@/app/components/icons/NavigationIcons';
import '@/app/styles/components/AIAssistantModal.css';

const QUICK_VIBES = [
  "🌹 Ghazal & Sufi Singer",
  "💍 Bollywood Wedding Band",
  "🎧 Corporate Party DJ",
  "🎸 Acoustic Duo for House Party",
  "🎂 Birthday Live Performer",
  "💰 Pricing in my city",
];

const BOT_INTRO = 
  "👋 Hi there! I'm your **Magnevents AI Event Concierge**.\n\nTell me about your event — e.g. *\"Looking for a Ghazal singer in Varanasi under ₹25k\"* or *\"Bollywood live band for a wedding in Delhi\"*.\n\nI'll find verified artists, check pricing, and help you get direct 0% commission quotes!";

export default function AIAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lead, setLead] = useState({ name: '', phone: '', requirement: '', city: '' });
  const [messages, setMessages] = useState([]);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Listen for open events from anywhere on the page
  useEffect(() => {
    const handler = (e) => {
      setIsOpen(true);
      if (e?.detail?.prompt) {
        setTimeout(() => handleSend(e.detail.prompt), 400);
      }
    };
    window.addEventListener('open-ai-chatbot', handler);
    return () => window.removeEventListener('open-ai-chatbot', handler);
  }, []);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen]);

  // Welcome message when opened the first time
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(BOT_INTRO, { showVibes: true });
    }
  }, [isOpen]);

  const addBotMessage = (text, extra = {}) => {
    const msg = {
      id: `bot-${Date.now()}-${Math.random()}`,
      sender: 'bot',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      ...extra,
    };
    setMessages(prev => [...prev, msg]);
  };

  const addUserMessage = (text) => {
    const msg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, msg]);
  };

  // Smart extractors
  const extractPhone = (text) => {
    if (!text) return null;
    const tenDigit = text.match(/(?:\+91|0)?[\s\-]?([6-9]\d{9})/);
    if (tenDigit) return tenDigit[1];
    const stripped = text.replace(/\D/g, '');
    if (stripped.length >= 10) return stripped.slice(-10);
    return null;
  };

  const extractName = (text) => {
    if (!text) return null;
    const match = text.match(/(?:my\s+name\s+is|i\s+am|i'm|name\s+is|name:|called|myself)\s+([a-zA-Z][a-zA-Z\s]{0,25}?)(?=\s+(?:and|th|my|phone|ph|nmer|no|num|number|mob|contact|\d)|,|\.|$)/i);
    if (match && match[1].trim().length >= 2) {
      return match[1].trim();
    }
    return null;
  };

  // Submit lead to backend
  const submitToBackend = async (currentLead, note) => {
    try {
      const cleanPhone = currentLead.phone ? (currentLead.phone.startsWith('+91') ? currentLead.phone : `+91${currentLead.phone.replace(/^\+91/, '')}`) : '+910000000000';
      const eventType = (currentLead.requirement || '').toLowerCase().includes('singer') ? 'Singer Booking' 
        : (currentLead.requirement || '').toLowerCase().includes('dj') ? 'DJ Booking' 
        : (currentLead.requirement || '').toLowerCase().includes('band') ? 'Band Booking' 
        : 'AI Chatbot Inquiry';

      await bookingService.submitRequest({
        name: currentLead.name || 'AI Chat Visitor',
        phone: cleanPhone,
        message: currentLead.requirement || note || 'AI Chat Lead',
        eventType,
        formName: 'AI Search Bottom-Right Bar (Conversational Lead)',
        formType: 'lead',
        keywords: currentLead.requirement ? currentLead.requirement.slice(0, 80) : 'AI Concierge Inquiry',
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
        referrer: typeof document !== 'undefined' ? (document.referrer || 'Direct') : '',
      });

      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          send_to: 'AW-16657289873/9sBzCMry1eocEJGl6IY-',
          value: 1.0,
          currency: 'INR',
        });
      }
    } catch (err) {
      console.warn('Backend submission error:', err);
    }
  };

  const handleSend = async (text = null) => {
    const rawVal = (text || inputVal).trim();
    if (!rawVal || isTyping) return;

    addUserMessage(rawVal);
    setInputVal('');
    setIsTyping(true);

    const detectedPhone = extractPhone(rawVal);
    const detectedName = extractName(rawVal);

    const newName = detectedName || lead.name;
    const newPhone = detectedPhone || lead.phone;
    const newRequirement = lead.requirement ? `${lead.requirement} | ${rawVal}` : rawVal;

    const updatedLead = {
      name: newName,
      phone: newPhone,
      requirement: newRequirement,
    };
    setLead(updatedLead);

    // Save lead data in background
    submitToBackend(updatedLead, rawVal);

    try {
      const res = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: rawVal,
          history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
        }),
      });

      const data = await res.json().catch(() => ({}));
      setIsTyping(false);

      if (data && data.reply) {
        let replyText = data.reply;
        if (!newPhone && !replyText.toLowerCase().includes('whatsapp') && !replyText.toLowerCase().includes('phone')) {
          replyText += `\n\n📱 *Share your WhatsApp number below to get matching artist profiles & 0% markup quotes sent directly to your phone!*`;
        }

        addBotMessage(replyText, {
          actionType: data.actionType || (newPhone ? 'whatsapp' : 'booking'),
          actionLabel: data.actionLabel || (newPhone ? '💬 Connect on WhatsApp' : '⚡ Get Verified Artist Quotes'),
          phone: newPhone,
          name: newName,
        });
      } else {
        // Fallback friendly reply
        addBotMessage(
          `Got it! I found verified artist profiles matching your requirement. Share your 10-digit WhatsApp number to receive direct video samples and exact pricing with 0% middleman fees! 🎶`,
          {
            actionType: 'whatsapp',
            actionLabel: '💬 Chat with Specialist on WhatsApp',
            phone: newPhone,
            name: newName,
          }
        );
      }
    } catch (err) {
      setIsTyping(false);
      addBotMessage(
        "I've noted your request! Magnevents has verified live singers, bands, and DJs ready for your date. You can also chat directly with our specialist on WhatsApp for instant confirmation.",
        {
          actionType: 'whatsapp',
          actionLabel: '💬 WhatsApp Booking Specialist',
          phone: newPhone,
          name: newName,
        }
      );
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const toggleOpen = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <>
      {/* Floating trigger button (Bottom Right) */}
      <button
        type="button"
        onClick={toggleOpen}
        className={`lux-ai-trigger-btn ${isOpen ? 'is-active' : ''}`}
        aria-label={isOpen ? "Close AI Search Bar" : "Open AI Search Bar"}
        title="Open Magnevents AI Concierge"
      >
        <span className="lux-ai-trigger-icon">
          {isOpen ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          ) : (
            <AIIcon color="#ffffff" size={24} />
          )}
        </span>
        <span className="label-text">AI Search</span>
        <span className="lux-ai-pulse-dot" />
      </button>

      {/* AI Bar / Drawer in Bottom Right */}
      {isOpen && (
        <>
          {/* Subtle click-outside backdrop */}
          <div 
            className="lux-ai-chat-backdrop" 
            onClick={handleClose} 
            aria-hidden="true"
          />

          <div
            className="lux-ai-chat-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="AI Search Assistant"
          >
            {/* Header */}
            <div className="lux-ai-chat-header">
              <div className="lux-ai-header-info">
                <div className="lux-ai-avatar-wrap">
                  <AIIcon color="#ffffff" size={22} />
                </div>
                <div className="lux-ai-header-text">
                  <h3>AI Search Concierge</h3>
                  <div className="lux-ai-status-row">
                    <span className="lux-ai-status-dot" />
                    <span>Live AI · 0% Markup Guarantee</span>
                  </div>
                </div>
              </div>
              <div className="lux-ai-header-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="lux-ai-icon-btn"
                  aria-label="Close AI Bar"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Sub-header Trust Signals */}
            <div className="lux-ai-drawer-trust-bar">
              <span className="trust-pill">🛡️ 100% Arrival Guarantee</span>
              <span className="trust-pill">⚡ Direct Artist Rates</span>
            </div>

            {/* Chat Body */}
            <div className="lux-ai-chat-body">
              {messages.map((msg) => (
                <div key={msg.id} className={`lux-ai-msg-row ${msg.sender}`}>
                  <div className="lux-ai-msg-bubble">
                    <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                      {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>

                    {/* Vibe / Prompt Chips */}
                    {msg.showVibes && (
                      <div className="lux-ai-vibe-chips">
                        {QUICK_VIBES.map((v) => (
                          <button
                            key={v}
                            type="button"
                            className="lux-ai-vibe-chip"
                            onClick={() => handleSend(v)}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Action CTA Button */}
                    {msg.actionLabel && (
                      <div className="lux-ai-action-buttons">
                        {msg.actionType === 'whatsapp' ? (
                          <a
                            href={`https://wa.me/918076515257?text=Hi%20Magnevents!%20I'm%20inquiring%20about%20booking%20an%20artist.%20My%20requirement:%20${encodeURIComponent(lead.requirement || 'Live Singer')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lux-ai-action-btn wa"
                          >
                            <span>💬</span>
                            <span>{msg.actionLabel}</span>
                          </a>
                        ) : (
                          <button
                            type="button"
                            className="lux-ai-action-btn"
                            onClick={() => {
                              window.location.href = `/ai-search?q=${encodeURIComponent(lead.requirement || 'Top live singers')}`;
                            }}
                          >
                            <span>⚡</span>
                            <span>{msg.actionLabel}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                  <span className="lux-ai-msg-time">{msg.time}</span>
                </div>
              ))}

              {isTyping && (
                <div className="lux-ai-msg-row bot">
                  <div className="lux-ai-msg-bubble lux-ai-typing">
                    <span className="lux-ai-typing-dot" />
                    <span className="lux-ai-typing-dot" />
                    <span className="lux-ai-typing-dot" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="lux-ai-chat-input-bar"
            >
              <div className="lux-ai-input-container">
                <span className="lux-ai-sparkle-prefix">✨</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={lead.phone ? "Ask anything about artists, songs, sound..." : "e.g. Sufi singer in Varanasi, or 9876543210..."}
                  className="lux-ai-input"
                  maxLength={400}
                />
                <button
                  type="submit"
                  disabled={!inputVal.trim() || isTyping}
                  className="lux-ai-send-btn"
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <span className="lux-send-spinner" />
                  ) : (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </form>

            <div className="lux-ai-drawer-footer">
              <span>🔒 100% Verified Artists · 0% Middleman Commission</span>
            </div>
          </div>
        </>
      )}
    </>
  );
}



