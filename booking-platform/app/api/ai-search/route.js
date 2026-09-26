import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

const DEFAULT_TOP_ARTISTS = [
  {
    id: "top-artist-1",
    artist_no: "MAG-001",
    name: "Aryan Sharma",
    rawName: "Aryan Sharma",
    category: "Live Singer",
    subCategory: "Bollywood, Sufi & Acoustic Live Performance",
    city: "Delhi NCR",
    state: "Delhi",
    price_min: 12000,
    price_max: 30000,
    rating: 4.9,
    successful_bookings: 85,
    bio: "Versatile Bollywood & Sufi vocalist performing soulful acoustics and upbeat party tracks.",
    img: "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp",
    slug: "aryan-sharma"
  },
  {
    id: "top-artist-2",
    artist_no: "MAG-002",
    name: "Riya Mukherjee",
    rawName: "Riya Mukherjee",
    category: "Ghazal & Sufi Artist",
    subCategory: "Classical Ghazals, Romantic Melodies & Semi-Classical",
    city: "Bhubaneswar",
    state: "Odisha",
    price_min: 15000,
    price_max: 35000,
    rating: 5.0,
    successful_bookings: 62,
    bio: "Soulful Ghazal and Sufi specialist with 10+ years of stage experience.",
    img: "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp",
    slug: "riya-mukherjee"
  },
  {
    id: "top-artist-3",
    artist_no: "MAG-003",
    name: "The Acoustic Collective",
    rawName: "The Acoustic Collective",
    category: "Live Music Band",
    subCategory: "Retro Bollywood, Pop Rock & Medleys",
    city: "Mumbai",
    state: "Maharashtra",
    price_min: 25000,
    price_max: 60000,
    rating: 4.9,
    successful_bookings: 110,
    bio: "4-piece high energy live band with complete sound and instruments.",
    img: "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp",
    slug: "the-acoustic-collective"
  },
  {
    id: "top-artist-4",
    artist_no: "MAG-004",
    name: "DJ Karan & Percussion",
    rawName: "DJ Karan & Percussion",
    category: "Club & Wedding DJ",
    subCategory: "Commercial EDM, Punjabi Dhol & Bollywood Remixes",
    city: "Bangalore",
    state: "Karnataka",
    price_min: 20000,
    price_max: 45000,
    rating: 4.8,
    successful_bookings: 95,
    bio: "Dynamic DJ with live percussionist for corporate galas and wedding sangeet.",
    img: "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp",
    slug: "dj-karan-percussion"
  },
  {
    id: "top-artist-5",
    artist_no: "MAG-005",
    name: "Kabir & Strings",
    rawName: "Kabir & Strings",
    category: "Acoustic Duo",
    subCategory: "Unplugged Bollywood, Indie & English Classics",
    city: "Varanasi",
    state: "Uttar Pradesh",
    price_min: 10000,
    price_max: 22000,
    rating: 4.9,
    successful_bookings: 48,
    bio: "Intimate acoustic guitar and vocal duo for private parties and cafe gigs.",
    img: "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-singer-session.webp",
    slug: "kabir-and-strings"
  }
];

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

      if (artistsData && !dbError && artistsData.length > 0) {
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

    // If candidateArtists is empty or has fewer than 5, supplement with DEFAULT_TOP_ARTISTS
    if (candidateArtists.length < 5) {
      const existingIds = new Set(candidateArtists.map(a => a.id));
      for (const defArtist of DEFAULT_TOP_ARTISTS) {
        if (!existingIds.has(defArtist.id)) {
          candidateArtists.push(defArtist);
          existingIds.add(defArtist.id);
        }
      }
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
- Target City / Location (e.g., Bhubaneswar, Delhi, Mumbai, Bangalore, Pune, Varanasi, etc.)
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
        detectedCity: forcedCity || "All Major Cities",
        vibeSummary: "Vibrant live musical atmosphere tailored to your guests and venue.",
        soundAdvice: "Acoustic or PA vocal setup with wireless handheld mics and dynamic stage monitor.",
        setlistTips: "A versatile mix of soulful acoustic openers followed by upbeat crowd favorites.",
        budgetGuidance: "Direct booking on Magnevents eliminates middleman markup, giving you verified talent at authentic rates.",
        aiCuratorNote: "Every booking includes our 100% Artist Arrival Guarantee and personal event coordinator.",
        recommendedArtistIds: candidateArtists.slice(0, 5).map(a => a.id)
      };
    }

    // 4. Match and rank artists
    const recommendedIds = new Set(aiResult.recommendedArtistIds || []);
    let prioritizedArtists = candidateArtists.filter(a => recommendedIds.has(a.id));
    const remainingArtists = candidateArtists.filter(a => !recommendedIds.has(a.id));

    // Combine prioritized first, followed by remaining
    let finalArtists = [...prioritizedArtists, ...remainingArtists];

    // Filter by city if detected
    if (aiResult.detectedCity && aiResult.detectedCity.toLowerCase() !== 'india' && !aiResult.detectedCity.toLowerCase().includes('all')) {
      const cityKey = aiResult.detectedCity.toLowerCase();
      const cityMatches = finalArtists.filter(a => 
        a.city.toLowerCase().includes(cityKey) || cityKey.includes(a.city.toLowerCase())
      );
      if (cityMatches.length > 0) {
        const nonCity = finalArtists.filter(a => !cityMatches.some(m => m.id === a.id));
        finalArtists = [...cityMatches, ...nonCity];
      }
    }

    // Ensure at least starting 5 profiles are always returned
    if (finalArtists.length < 5) {
      for (const def of DEFAULT_TOP_ARTISTS) {
        if (!finalArtists.some(a => a.id === def.id || a.name === def.name)) {
          finalArtists.push(def);
        }
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
