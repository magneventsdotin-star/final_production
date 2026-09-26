import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const VIBE_TEMPLATES = {
  sufi: "Looking for a soulful Sufi and Bollywood live band for an evening gathering with ~100 guests. Need a 2-hour set with sound & mic setup included.",
  sangeet: "Looking for a high-energy live singer and band for a Wedding Sangeet in Delhi/NCR. Need Bollywood dance anthems and live dhol for 200+ guests.",
  acoustic: "Looking for a versatile acoustic singer-guitarist for an intimate cocktail party. English & Hindi pop favorites for ~40 guests.",
  dj: "Looking for a premier Bollywood & commercial club DJ with sound console and intelligent dance lighting for a 3-hour private celebration.",
  celebrity: "Inquiring for a celebrity playback singer / renowned headline artist for a luxury wedding reception with full stage production."
};

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const vibe = (body.vibe || '').toLowerCase();
    const city = (body.city || 'Delhi NCR').trim();
    const keywords = (body.keywords || '').trim();

    const groqApiKey = process.env.GROQ_API_KEY || '';
    const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    let generatedText = '';

    if (groqApiKey) {
      try {
        const systemPrompt = `You are Magnevents AI Event Planner. 
Your goal is to generate a natural, realistic, professional 1-to-2 sentence live artist booking requirement (under 35 words).
Include event type, city (${city}), music style/vibe, and sound equipment.
Do NOT use quotes, bullet points, greetings, or conversational preambles. Output ONLY the requirement description.`;

        const userPrompt = keywords 
          ? `User note: "${keywords}". Vibe: ${vibe || 'live music'}. Location: ${city}. Write a concise artist requirement brief.`
          : `Generate a concise artist requirement brief for vibe: ${vibe || 'live musician'} in ${city}.`;

        const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqApiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: groqModel,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.6,
            max_tokens: 100
          })
        });

        if (groqRes.ok) {
          const data = await groqRes.json();
          const raw = data.choices?.[0]?.message?.content?.trim();
          if (raw) {
            // Remove any accidental quotation marks wrapping the whole string
            generatedText = raw.replace(/^["']|["']$/g, '').trim();
          }
        }
      } catch (err) {
        console.warn('Groq AI draft error, using template:', err.message);
      }
    }

    if (!generatedText) {
      if (vibe.includes('sufi') || vibe.includes('ghazal')) {
        generatedText = VIBE_TEMPLATES.sufi;
      } else if (vibe.includes('sangeet') || vibe.includes('wedding')) {
        generatedText = VIBE_TEMPLATES.sangeet;
      } else if (vibe.includes('acoustic') || vibe.includes('singer')) {
        generatedText = VIBE_TEMPLATES.acoustic;
      } else if (vibe.includes('dj') || vibe.includes('club')) {
        generatedText = VIBE_TEMPLATES.dj;
      } else if (vibe.includes('celebrity')) {
        generatedText = VIBE_TEMPLATES.celebrity;
      } else if (keywords) {
        generatedText = `Looking for a verified live performer in ${city} for "${keywords}". Need 2 hours performance with sound equipment setup.`;
      } else {
        generatedText = `Looking for a top-rated live singer / band for an upcoming celebration in ${city} with sound setup included.`;
      }
    }

    return NextResponse.json({
      success: true,
      text: generatedText
    });
  } catch (error) {
    console.error('AI draft API error:', error);
    return NextResponse.json({
      success: true,
      text: "Looking for a verified live artist for an upcoming event with sound and mic setup included."
    });
  }
}
