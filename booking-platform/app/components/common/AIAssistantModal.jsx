"use client";

import React, { useState, useRef, useEffect } from 'react';
import { bookingService } from '@/app/services/bookingService';
import '@/app/styles/components/AIAssistantModal.css';

// ─── Conversational lead capture steps ────────────────────────────────────────
const BOT_SCRIPT = {
  welcome:
    "👋 Hi! I'm your **AI Search Concierge** for Magnevents.\n\nTell me about your event or required artist — e.g. _\"Ghazal singer for a 50-guest wedding in Delhi under ₹25k\"_.\n\n💬 Include your **Name & WhatsApp number** so I can find you the best verified artists & send instant 0% commission quotes!",
  need_phone: (name) =>
    `Got it, **${name || 'there'}**! 🎶 I have verified artist matches ready for your event.\n\nPlease share your **10-digit WhatsApp number** so our specialists can send you direct artist profiles & verified quotes:`,
  need_requirement: (name) =>
    `Thanks, **${name || 'there'}**! 🎉 I've saved your contact.\n\nNow tell me what kind of artist or event you need — or tap one of the popular categories below:`,
  submitting: '⚡ Finding verified artist matches & sending request to artist backend...',
  done: (name, phone) =>
    `🎊 Request Received, **${name || 'Friend'}**!\n\nYour inquiry has been submitted to our artist backend. Verified artist quotes & profiles will be sent directly to **${phone ? '+91 ' + phone.replace(/^\+91/, '') : 'your WhatsApp'}** within **15–30 minutes**.\n\n🎁 Use code **FIRSTEVENT60** for up to 60% OFF!`,
  error: "Sorry, something went wrong. Please try again or chat with us directly on WhatsApp.",
};

const QUICK_VIBES = [
  "💍 Wedding Singer",
  "🎉 House Party DJ",
  "🏢 Corporate Live Band",
  "🕌 Ghazal / Sufi Artist",
  "🎂 Birthday Singer",
  "☕ Cafe / Acoustic Singer",
  "🎸 Rock & Pop Band",
  "🪘 Punjabi & Dhol Artist",
];

export default function AIAssistantModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lead, setLead] = useState({ name: '', phone: '', requirement: '' });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [messages, setMessages] = useState([]);

  // Listen for navbar/trigger button event
  useEffect(() => {
    const handler = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-ai-chatbot', handler);
    return () => window.removeEventListener('open-ai-chatbot', handler);
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  // Start conversation when modal opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addBotMessage(BOT_SCRIPT.welcome, { showVibes: true });
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

  const showTyping = (ms = 700) =>
    new Promise(res => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        res();
      }, ms);
    });

  // Smart extractors
  const extractPhone = (text) => {
    if (!text) return null;
    const tenDigit = text.match(/(?:\+91|0)?[\s\-]?([6-9]\d{9})/);
    if (tenDigit) return tenDigit[1];

    const anyDigits = text.match(/\b\d{6,12}\b/);
    if (anyDigits) return anyDigits[0];

    const stripped = text.replace(/\D/g, '');
    if (stripped.length >= 10) return stripped.slice(-10);
    if (stripped.length >= 6) return stripped;

    return null;
  };

  const extractName = (text) => {
    if (!text) return null;
    const match = text.match(/(?:my\s+name\s+is|i\s+am|i'm|name\s+is|name:|called|myself)\s+([a-zA-Z][a-zA-Z\s]{0,25}?)(?=\s+(?:and|th|my|phone|ph|nmer|no|num|number|mob|contact|\d)|,|\.|$)/i);
    if (match && match[1].trim().length >= 2) {
      return match[1].trim();
    }

    const trimmed = text.trim();
    if (/^[a-zA-Z\s]{2,25}$/.test(trimmed) && !/(hi|hello|hey|singer|dj|band|price|quote|booking|need|want|wedding|party)/i.test(trimmed)) {
      return trimmed;
    }

    return null;
  };

  // Persist directly to backend in artist requests
  const submitToBackend = async (currentLead, note = 'AI Search Chat Request') => {
    try {
      const cleanPhone = currentLead.phone ? (currentLead.phone.startsWith('+91') ? currentLead.phone : `+91${currentLead.phone.replace(/^\+91/, '')}`) : '+910000000000';
      const eventType = (currentLead.requirement || '').toLowerCase().includes('singer') ? 'Singer Booking' 
        : (currentLead.requirement || '').toLowerCase().includes('dj') ? 'DJ Booking' 
        : (currentLead.requirement || '').toLowerCase().includes('band') ? 'Band Booking' 
        : 'AI Chatbot Inquiry';

      await bookingService.submitRequest({
        name: currentLead.name || 'AI Chat Visitor',
        phone: cleanPhone,
        message: currentLead.requirement || note,
        eventType,
        formName: 'AI Search Chatbot (Conversational Lead)',
        formType: 'lead',
        keywords: currentLead.requirement ? currentLead.requirement.slice(0, 80) : 'AI Search Artist Match',
        pageUrl: typeof window !== 'undefined' ? window.location.href : '',
        pagePath: typeof window !== 'undefined' ? window.location.pathname : '',
        referrer: typeof document !== 'undefined' ? (document.referrer || 'Direct') : '',
      });

      // Track conversion
      if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
        window.gtag('event', 'conversion', {
          send_to: 'AW-16657289873/9sBzCMry1eocEJGl6IY-',
          value: 1.0,
          currency: 'INR',
        });
      }
    } catch (err) {
      console.warn('Backend submission warning:', err);
    }
  };

  // Handle Chat Input Send
  const handleSend = async (text = null) => {
    const value = (text || inputVal).trim();
    if (!value || isSubmitted) return;

    addUserMessage(value);
    setInputVal('');

    // Extract any new name, phone, or requirement info
    const detectedPhone = extractPhone(value);
    const detectedName = extractName(value);
    
    // Determine requirement text (if it's not purely a phone number or name)
    const isJustPhone = /^(?:\+91|0)?\s*\d{10}$/.test(value.trim());
    const isJustName = detectedName && detectedName.toLowerCase() === value.trim().toLowerCase();
    
    const newName = detectedName || lead.name;
    const newPhone = (detectedPhone && detectedPhone.length >= 10 ? detectedPhone.slice(-10) : detectedPhone) || lead.phone;
    const newRequirement = (!isJustPhone && !isJustName) ? (lead.requirement ? `${lead.requirement} | ${value}` : value) : lead.requirement;

    const updatedLead = {
      name: newName,
      phone: newPhone,
      requirement: newRequirement,
    };
    setLead(updatedLead);

    // Save whatever we got to DB immediately!
    submitToBackend(updatedLead, value);

    await showTyping(700);

    // Flow Logic:
    // 1. If we have BOTH a valid 10-digit phone and a requirement: Complete and show verified matches!
    if (newPhone && newPhone.replace(/\D/g, '').length === 10 && newRequirement) {
      setIsSubmitted(true);
      await showTyping(800);
      addBotMessage(BOT_SCRIPT.done(newName, newPhone), { isDone: true });
      return;
    }

    // 2. If we have a requirement but NO phone number: Ask for WhatsApp number
    if (newRequirement && (!newPhone || newPhone.replace(/\D/g, '').length < 10)) {
      addBotMessage(BOT_SCRIPT.need_phone(newName));
      return;
    }

    // 3. If we have a phone number but NO requirement: Ask for event requirement & show vibes
    if (newPhone && newPhone.replace(/\D/g, '').length === 10 && !newRequirement) {
      addBotMessage(BOT_SCRIPT.need_requirement(newName), { showVibes: true });
      return;
    }

    // 4. If partial number (e.g. 7-9 digits):
    if (detectedPhone && detectedPhone.length < 10) {
      addBotMessage(`Thanks ${newName || 'there'}! I noted partial number (${detectedPhone}). Please share your complete **10-digit WhatsApp number** so artists can send quotes:`);
      return;
    }

    // Default friendly follow-up
    addBotMessage(`Got it, **${newName || 'there'}**! What's your **10-digit WhatsApp number** so we can send matching artist quotes? 📱`);
  };

  const handleClose = () => {
    setIsOpen(false);
    setTimeout(() => {
      setMessages([]);
      setLead({ name: '', phone: '', requirement: '' });
      setIsSubmitted(false);
      setInputVal('');
    }, 400);
  };

  const getPlaceholder = () => {
    if (isSubmitted) return 'Inquiry sent! 🚀';
    if (!lead.requirement) return 'e.g. Sufi singer in Delhi under 25k, Rahul 9876543210...';
    if (!lead.phone) return 'Type your 10-digit WhatsApp number...';
    return 'Type any additional event details...';
  };

  return (
    <>
      {/* Floating trigger button (top-right) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="lux-ai-trigger-btn"
        aria-label="Open AI Search Chatbot"
      >
        <span className="lux-ai-trigger-icon">✨</span>
        <span className="label-text">AI Search</span>
        <span className="lux-ai-pulse-dot" />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="lux-ai-chat-overlay" onClick={handleClose}>
          <div
            className="lux-ai-chat-window"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="AI Search Chatbot"
          >
            {/* Header */}
            <div className="lux-ai-chat-header">
              <div className="lux-ai-header-info">
                <div className="lux-ai-avatar-wrap">🤖</div>
                <div className="lux-ai-header-text">
                  <h3><span>AI Search Concierge</span></h3>
                  <div className="lux-ai-status-row">
                    <span className="lux-ai-status-dot" />
                    <span>⚡ Live · Verified 0% Commission Quotes</span>
                  </div>
                </div>
              </div>
              <div className="lux-ai-header-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="lux-ai-icon-btn"
                  aria-label="Close"
                >✕</button>
              </div>
            </div>

            {/* Sub-header helper indicator */}
            <div className="lux-ai-progress-bar">
              <div className="lux-ai-quick-tip">
                <span>💬 Tell me your requirement, name &amp; phone in one message to get instant matches</span>
              </div>
            </div>

            {/* Chat Body */}
            <div className="lux-ai-chat-body">
              {messages.map(msg => (
                <div key={msg.id} className={`lux-ai-msg-row ${msg.sender}`}>
                  <div className="lux-ai-msg-bubble">
                    <p style={{ margin: 0, whiteSpace: 'pre-line' }}>
                      {msg.text.replace(/\*\*(.*?)\*\*/g, '$1')}
                    </p>

                    {/* Vibe & Artist Category Chips */}
                    {msg.showVibes && (
                      <div className="lux-ai-vibe-chips">
                        {QUICK_VIBES.map(v => (
                          <button
                            key={v}
                            type="button"
                            className="lux-ai-vibe-chip"
                            onClick={() => handleSend(v)}
                          >{v}</button>
                        ))}
                      </div>
                    )}

                    {/* Done State Action CTA */}
                    {msg.isDone && (
                      <div className="lux-ai-done-actions">
                        <a
                          href={`https://wa.me/918076515257?text=Hi%20Magnevents!%20I%20requested%20an%20AI%20artist%20match.%20Name:%20${encodeURIComponent(lead.name || 'Client')}%20|%20Requirement:%20${encodeURIComponent(lead.requirement || 'Live Artist')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="lux-ai-action-btn wa"
                        >💬 Instant WhatsApp Specialist Chat</a>
                        <button
                          type="button"
                          className="lux-ai-action-btn"
                          onClick={() => { handleClose(); window.location.href = '/ai-search'; }}
                        >🚀 Explore All Verified Artists</button>
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
              onSubmit={e => { e.preventDefault(); handleSend(); }}
              className="lux-ai-chat-input-bar"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder={getPlaceholder()}
                className="lux-ai-input"
                disabled={isSubmitted}
                maxLength={400}
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || isSubmitted || isTyping}
                className="lux-ai-send-btn"
                aria-label="Send"
              >
                {isTyping ? (
                  <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                  </svg>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', fontSize: '10.5px', color: 'rgba(255,255,255,0.28)', margin: '8px 0 0', paddingBottom: '4px' }}>
              🔒 100% verified artists · 0% commission direct quotes
            </p>
          </div>
        </div>
      )}
    </>
  );
}


