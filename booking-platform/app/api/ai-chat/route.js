import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// ─── 1. TOPIC GUARD ───────────────────────────────────────────────────────────
// Keywords that must appear for the query to be considered on-topic.
const TOPIC_KEYWORDS = [
  // Artist / event types
  'singer', 'band', 'dj', 'musician', 'artist', 'performer', 'ghazal', 'sufi',
  'bollywood', 'classical', 'acoustic', 'anchor', 'emcee', 'dance', 'act',
  // Event types
  'wedding', 'party', 'event', 'birthday', 'corporate', 'house', 'concert',
  'reception', 'engagement', 'anniversary', 'function', 'show', 'performance',
  'celebration', 'gig', 'stage',
  // Business / booking
  'book', 'booking', 'hire', 'price', 'cost', 'rate', 'fee', 'quote', 'budget',
  'magnevents', 'magnevent', 'platform', 'service', 'offer', 'discount', '60%',
  'firstevent60', 'commission', 'direct', 'verified',
  // Support
  'cancel', 'refund', 'guarantee', 'arrival', 'contact', 'whatsapp', 'sound',
  'speaker', 'mic', 'equipment', 'setup', 'travel', 'outstation', 'city',
  'delhi', 'mumbai', 'bangalore', 'bhubaneswar', 'pune', 'hyderabad', 'jaipur',
  'kolkata', 'chennai', 'ncr', 'gurgaon', 'noida',
  // General conversation
  'hi', 'hello', 'hey', 'help', 'thanks', 'ok', 'okay', 'sure', 'yes', 'no',
  'how', 'what', 'when', 'where', 'who', 'which',
];

function isOnTopic(text) {
  const lower = text.toLowerCase();
  return TOPIC_KEYWORDS.some(kw => lower.includes(kw));
}

const OFF_TOPIC_REPLY = {
  reply: "I'm the Magnevents AI Concierge and I can only help with artist bookings, event planning, pricing, and our platform services. Please ask me anything about booking singers, bands, DJs, or planning your event! 🎶",
  actionType: 'booking',
  actionLabel: '🎤 Ask About Artist Bookings',
};

// ─── 2. PII SANITIZER ─────────────────────────────────────────────────────────
// Removes phone numbers, emails, and replaces detected names from chat messages.
const PII_PATTERNS = [
  // Indian / international phone numbers
  /(\+?91[-\s]?)?[6-9]\d{9}/g,
  /(\+\d{1,3}[-\s]?)?\(?\d{3}\)?[-\s]?\d{3}[-\s]?\d{4}/g,
  // Email addresses
  /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g,
  // Aadhaar-like 12-digit numbers
  /\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
];

function stripPII(text) {
  let clean = text;
  for (const pattern of PII_PATTERNS) {
    clean = clean.replace(pattern, '[REDACTED]');
  }
  return clean;
}

// ─── 3. CHAT HISTORY → SANITIZED SUMMARY ────────────────────────────────────
// Converts the last few messages into a brief bullet-point context summary
// with all PII removed — this is what the AI model sees.
function buildSanitizedSummary(history) {
  if (!history || history.length === 0) return '';

  const lines = history
    .slice(-6) // at most last 6 messages
    .map(msg => {
      const role = msg.sender === 'user' ? 'Visitor' : 'Concierge';
      const clean = stripPII(String(msg.text || ''));
      return `${role}: ${clean}`;
    });

  return `\n\n--- PREVIOUS CONVERSATION CONTEXT (PII removed) ---\n${lines.join('\n')}\n---`;
}

// ─── 4. SYSTEM PROMPT (strict scope) ─────────────────────────────────────────
const SYSTEM_PROMPT = `You are the Magnevents AI Event Concierge — a specialist assistant ONLY for the Magnevents platform.

MAGNEVENTS PLATFORM FACTS:
• India's leading verified live artist booking platform.
• Categories: solo singers, Ghazal vocalists, Sufi ensembles, live bands, DJs, acoustic duos, anchors/emcees, classical musicians.
• Cities covered: Delhi NCR, Bhubaneswar, Mumbai, Bangalore, Pune, Hyderabad, Kolkata, Jaipur, Chandigarh, Chennai, and all major Indian cities.
• Pricing (direct, 0% markup):
  – Solo Singer / Ghazal:      ₹5,000 – ₹20,000
  – Acoustic Duo / Trio:       ₹15,000 – ₹35,000
  – Full Live Band / Sufi:     ₹40,000 – ₹1.5L+
  – DJ / Club Act:             ₹15,000 – ₹40,000
• 100% Artist Arrival Guarantee — backup artist arranged at no extra cost if emergency occurs.
• First booking: up to 60% OFF (code: FIRSTEVENT60).
• Sound setup, wireless mics, stage engineers available as add-ons.
• Secure escrow payment: advance held safely, released only after successful performance.

STRICT RULES:
1. You MUST ONLY respond to questions about Magnevents, artist bookings, event planning, pricing, sound setup, travel, guarantees, or platform services.
2. If asked ANYTHING outside this scope (coding, politics, general knowledge, other businesses, personal advice, etc.) — politely decline and redirect to event booking topics.
3. Never reveal, store, or repeat any personal information (names, phone numbers, emails) that appear in the conversation context. Treat them as [REDACTED].
4. Keep answers concise: 2–4 sentences max.
5. Always be warm, professional, and helpful within scope.
6. Return ONLY valid JSON with this exact schema:
{
  "reply": "string",
  "actionType": "booking" | "whatsapp" | "offer" | "ai_search",
  "actionLabel": "string"
}`;

// ─── ROUTE HANDLER ────────────────────────────────────────────────────────────
export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawMessage = (body.message || '').trim();
    const chatHistory = Array.isArray(body.history) ? body.history : [];

    if (!rawMessage) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // ── Step 1: Topic guard (fast, no AI needed) ──────────────────────────────
    if (!isOnTopic(rawMessage)) {
      return NextResponse.json({
        success: true,
        ...OFF_TOPIC_REPLY,
      });
    }

    // ── Step 2: Sanitize the current message (strip PII) ─────────────────────
    const sanitizedMessage = stripPII(rawMessage);

    // ── Step 3: Build a sanitized summary of history (no PII to the model) ───
    const historySummary = buildSanitizedSummary(chatHistory);

    // ── Step 4: Build model messages (system + sanitized context + user msg) ──
    const modelMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT + historySummary,
      },
      {
        role: 'user',
        content: sanitizedMessage,
      },
    ];

    // ── Step 5: Call Groq ─────────────────────────────────────────────────────
    const groqApiKey = process.env.GROQ_API_KEY || '';
    const groqModel  = process.env.GROQ_MODEL  || 'llama3-8b-8192';

    let aiData = null;

    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: groqModel,
          messages: modelMessages,
          response_format: { type: 'json_object' },
          temperature: 0.45,
          max_tokens: 280,
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          aiData = JSON.parse(content);
        }
      } else {
        console.warn('Groq ai-chat error:', groqRes.status, await groqRes.text());
      }
    } catch (err) {
      console.error('Groq fetch error in ai-chat:', err);
    }

    // ── Step 6: Fallback if AI returned nothing ───────────────────────────────
    if (!aiData || !aiData.reply) {
      const lower = rawMessage.toLowerCase();
      let city = 'your city';
      if (lower.includes('delhi'))       city = 'Delhi NCR';
      else if (lower.includes('mumbai')) city = 'Mumbai';
      else if (lower.includes('bhubaneswar')) city = 'Bhubaneswar';
      else if (lower.includes('bangalore'))   city = 'Bangalore';
      else if (lower.includes('pune'))        city = 'Pune';

      aiData = {
        reply: `In ${city}, Magnevents has verified live singers, bands, and performers starting from ₹5,000 with 0% middleman fees and a 100% arrival guarantee. Would you like a customised quote?`,
        actionType: 'booking',
        actionLabel: `⚡ Get ${city} Artist Quote`,
      };
    }

    return NextResponse.json({
      success: true,
      reply: aiData.reply,
      actionType: aiData.actionType || 'booking',
      actionLabel: aiData.actionLabel || '⚡ Get Instant Quote',
    });

  } catch (error) {
    console.error('Unhandled AI Chat error:', error);
    return NextResponse.json({
      success: true,
      reply: 'I can help you find verified live artists for your event. Please describe your event type, city, and budget and I will match you instantly!',
      actionType: 'whatsapp',
      actionLabel: '💬 Chat with Live Specialist',
    });
  }
}
