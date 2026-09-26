import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const userQuery = (body.query || '').trim();
    const forcedCity = (body.city || '').trim();
    const forcedBudget = (body.budget || '').trim();
    const forcedEventType = (body.eventType || '').trim();

    if (!userQuery && !forcedCity && !forcedEventType) {
      return NextResponse.json(
        { error: 'Please provide an event description, city, or artist preference.' },
        { status: 400 }
      );
    }

    const groqApiKey = process.env.GROQ_API_KEY || '';
    const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

    // 1. Fetch live candidate artists from Supabase
    let candidateArtists = [];
    try {
      const { data: artistsData, error: dbError } = await supabase
        .from('artists')
        .select('id, artist_no, name, alias, category, sub_category, city, state, price_min, price_max, rating, successful_bookings, bio, artist_images(image_url)')
        .eq('is_live', true)
        .order('rating', { ascending: false })
        .limit(30);

      if (artistsData && !dbError) {
        candidateArtists = artistsData.map(a => {
          const alias = a.alias ? a.alias.trim() : '';
          const name = a.name ? a.name.trim() : '';
          const displayName = alias || name;
          const slug = (alias || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
          const img = a.artist_images?.[0]?.image_url || null;

          return {
            id: a.id,
            artist_no: a.artist_no,
            name: displayName,
            rawName: name,
            category: a.category || 'Singer',
            subCategory: a.sub_category || 'Bollywood, Live Music',
            city: a.city || 'India',
            state: a.state || '',
            price_min: a.price_min ? Number(a.price_min) : 10000,
            price_max: a.price_max ? Number(a.price_max) : 35000,
            rating: a.rating ? Number(a.rating) : 5.0,
            successful_bookings: a.successful_bookings ? Number(a.successful_bookings) : 25,
            bio: a.bio || '',
            img,
            slug
          };
        });
      }
    } catch (err) {
      console.error('Error fetching Supabase artists for AI search:', err);
    }

    // 2. Prepare candidates summary for Groq prompt
    const candidatesListStr = candidateArtists.slice(0, 15).map(a => 
      `- ID: ${a.id} | Name: "${a.name}" | Category: ${a.category} | Genres: ${a.subCategory} | City: ${a.city} | Price: ₹${a.price_min} - ₹${a.price_max}`
    ).join('\n');

    // 3. Call Groq AI API
    const systemPrompt = `You are the Magnevents Chief AI Event & Artist Curator.
Magnevents is India's premier verified live entertainment booking platform with 0% agency commissions, a 100% Artist Arrival Guarantee, and up to 60% OFF first booking platform fee.

Your goal is to parse the user's natural language event request and provide deeply intelligent, expert recommendations.
Analyze the user's input:
- Event type (Wedding, Sangeet, House Party, Corporate, Birthday, Cafe Launch, Anniversary, etc.)
- Target City / Location (e.g., Bhubaneswar, Delhi, Mumbai, Bangalore, Pune, etc.)
- Desired Vibe & Atmosphere
- Sound & Technical gear advice (e.g. microphones, acoustic setup, PA system, monitor)
- Curated setlist tips (classic ghazals, romantic sufi, high-energy bollywood, rock fusion, etc.)
- Realistic budget analysis (mentioning that direct booking with Magnevents saves 20-30% middleman fees)
- Select the top matching Artist IDs from the provided candidate list.

Return strictly valid JSON with this exact schema:
{
  "eventType": "string",
  "detectedCity": "string",
  "vibeSummary": "string",
  "soundAdvice": "string",
  "setlistTips": "string",
  "budgetGuidance": "string",
  "aiCuratorNote": "string",
  "recommendedArtistIds": ["id1", "id2", "id3"]
}`;

    const userPrompt = `User Event Query: "${userQuery || 'Live artist for private celebration'}"
${forcedCity ? `Preferred City: ${forcedCity}` : ''}
${forcedBudget ? `Target Budget: ${forcedBudget}` : ''}
${forcedEventType ? `Event Type: ${forcedEventType}` : ''}

Available Verified Candidate Artists in Database:
${candidatesListStr || 'No artists currently available in database.'}

Please generate the expert curation JSON.`;

    let aiResult = null;

    try {
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
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
          response_format: { type: 'json_object' },
          temperature: 0.4
        })
      });

      if (groqResponse.ok) {
        const groqData = await groqResponse.json();
        const content = groqData.choices?.[0]?.message?.content;
        if (content) {
          aiResult = JSON.parse(content);
        }
      } else {
        console.warn('Groq API error:', groqResponse.status, await groqResponse.text());
      }
    } catch (groqErr) {
      console.error('Groq fetch error:', groqErr);
    }

    // Fallback if Groq call failed or returned empty
    if (!aiResult) {
      aiResult = {
        eventType: forcedEventType || "Special Celebration",
        detectedCity: forcedCity || "Bhubaneswar / India",
        vibeSummary: "Vibrant live musical atmosphere tailored to your guests and venue.",
        soundAdvice: "Acoustic or PA vocal setup with wireless handheld mics and dynamic stage monitor.",
        setlistTips: "A versatile mix of soulful acoustic openers followed by upbeat crowd favorites.",
        budgetGuidance: "Direct booking on Magnevents eliminates middleman markup, giving you verified talent at authentic rates.",
        aiCuratorNote: "Every booking includes our 100% Artist Arrival Guarantee and personal event coordinator.",
        recommendedArtistIds: candidateArtists.slice(0, 4).map(a => a.id)
      };
    }

    // 4. Match and rank artists
    const recommendedIds = new Set(aiResult.recommendedArtistIds || []);
    let prioritizedArtists = candidateArtists.filter(a => recommendedIds.has(a.id));
    const remainingArtists = candidateArtists.filter(a => !recommendedIds.has(a.id));

    // Combine prioritized first, followed by remaining
    let finalArtists = [...prioritizedArtists, ...remainingArtists];

    // Filter by city if detected
    if (aiResult.detectedCity && aiResult.detectedCity.toLowerCase() !== 'india') {
      const cityKey = aiResult.detectedCity.toLowerCase();
      const cityMatches = finalArtists.filter(a => 
        a.city.toLowerCase().includes(cityKey) || cityKey.includes(a.city.toLowerCase())
      );
      if (cityMatches.length > 0) {
        const nonCity = finalArtists.filter(a => !cityMatches.some(m => m.id === a.id));
        finalArtists = [...cityMatches, ...nonCity];
      }
    }

    const topMatches = finalArtists.slice(0, 6);

    return NextResponse.json({
      success: true,
      query: userQuery,
      analysis: {
        eventType: aiResult.eventType,
        detectedCity: aiResult.detectedCity,
        vibeSummary: aiResult.vibeSummary,
        soundAdvice: aiResult.soundAdvice,
        setlistTips: aiResult.setlistTips,
        budgetGuidance: aiResult.budgetGuidance,
        aiCuratorNote: aiResult.aiCuratorNote
      },
      artists: topMatches,
      promoOffer: {
        discount: "60% OFF",
        code: "FIRSTEVENT60",
        tagline: "Claim up to 60% OFF the booking platform fee for your event!"
      }
    });

  } catch (error) {
    console.error('Unhandled AI Search error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing AI Search.', details: error.message },
      { status: 500 }
    );
  }
}
