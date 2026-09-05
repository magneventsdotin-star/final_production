import { notFound } from 'next/navigation';
import { supabase } from '@database/connection/supabase';
import Link from 'next/link';
import { Mic2 } from 'lucide-react';
import SEOArtistsGrid from '@/app/components/common/SEOArtistsGrid';
import '../../seo-pages.css';

function slugToName(slug) {
  return slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

export async function generateMetadata({ params }) {
  const { city_slug } = params;
  
  const { data: city } = await supabase
    .from('seo_cities')
    .select('*')
    .eq('slug', city_slug)
    .eq('is_active', true)
    .single();

  const cityName = city?.name || slugToName(city_slug);

  return {
    title: city?.seo_title || `Hire Best Singers in ${cityName} | Magnevents`,
    description: city?.meta_description || `Find and book top-rated live singers, bands, and musicians for weddings, corporate events, and parties in ${cityName}.`,
    alternates: {
      canonical: `https://www.magnevents.in/city/${city_slug}`,
    }
  };
}

export default async function CityLandingPage({ params }) {
  const { city_slug } = params;

  // 1. Fetch City
  let { data: city } = await supabase
    .from('seo_cities')
    .select('*')
    .eq('slug', city_slug)
    .eq('is_active', true)
    .single();

  // 1b. Fallback if city not in database
  if (!city) {
    city = {
      id: null,
      name: slugToName(city_slug),
      slug: city_slug,
      seo_title: '',
      meta_description: '',
      h1: '',
      content: '',
    };
  }

  // 2. Fetch SEO Blogs for this city (only if it has a real DB ID)
  let blogs = [];
  if (city.id) {
    const { data } = await supabase
      .from('seo_blogs')
      .select('title, slug, created_at, featured_image_url')
      .eq('city_id', city.id)
      .eq('status', 'published')
      .order('created_at', { ascending: false });
    blogs = data || [];
  }

  // 3. Schema Markup
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": city.seo_title || `Hire Singers in ${city.name}`,
      "description": city.meta_description || `Book live singers in ${city.name}`,
      "url": `https://www.magnevents.in/city/${city.slug}`,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://www.magnevents.in"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": city.name,
          "item": `https://www.magnevents.in/city/${city.slug}`
        }
      ]
    }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="city-landing-page">
        <div className="city-hero">
          <h1>{city.h1 || `Book the Best Singers in ${city.name}`}</h1>
          <p className="city-subtitle">
            Make your events in {city.name} unforgettable with top live music entertainment.
          </p>
        </div>

        <div className="city-content-container">
          <div className="city-main-content">
            {city.content ? (
              <div 
                className="seo-content"
                dangerouslySetInnerHTML={{ __html: city.content }}
              />
            ) : (
              <div className="seo-content default-seo-content" style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', fontSize: '1.05rem', marginBottom: '50px' }}>
                <h2 style={{ fontSize: '1.8rem', color: '#fff', marginBottom: '20px' }}>Why Book a Live Singer in {city.name} with Magnevents?</h2>
                <p style={{ marginBottom: '16px' }}>
                  Elevate your upcoming event in {city.name} with mesmerizing live music. At <strong>Magnevents</strong>, we provide a premium roster of talented singers, bands, and musicians tailored for every occasion—from intimate house parties and grand weddings to large-scale corporate galas. 
                </p>
                <p style={{ marginBottom: '16px' }}>
                  Finding the right artist can be overwhelming, but our streamlined platform makes booking live entertainment in {city.name} effortless. Browse through verified artist profiles, check their exclusive pricing, and secure your booking with transparent terms and zero hidden fees.
                </p>
                
                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginTop: '30px', marginBottom: '16px' }}>Popular Occasions for Live Music in {city.name}</h3>
                <ul style={{ paddingLeft: '20px', marginBottom: '24px', listStyleType: 'disc' }}>
                  <li style={{ marginBottom: '8px' }}><strong>Weddings & Sangeet:</strong> Soulful acoustic singers and high-energy Bollywood bands.</li>
                  <li style={{ marginBottom: '8px' }}><strong>Corporate Events:</strong> Professional instrumentalists and sophisticated live performers to set the perfect mood.</li>
                  <li style={{ marginBottom: '8px' }}><strong>Private House Parties:</strong> Versatile vocalists and guitarists to get your guests engaged and singing along.</li>
                </ul>
                
                <p>
                  Ready to make your event unforgettable? <Link href="/artists" style={{ color: 'var(--brand-primary, #FFE032)', textDecoration: 'underline', fontWeight: 'bold' }}>Explore our top artists</Link> and book the perfect live singer in {city.name} today.
                </p>
              </div>
            )}

            <div className="blogs-section">
              <h2>Top Music & Entertainment Guides in {city.name}</h2>
              {blogs && blogs.length > 0 ? (
                <div className="blogs-grid">
                  {blogs.map((blog, idx) => (
                    <Link href={`/city/${city.slug}/blog/${blog.slug}`} key={idx} className="blog-card">
                      <div className="blog-card-img">
                         {blog.featured_image_url ? (
                           <img src={blog.featured_image_url} alt={blog.title} />
                         ) : (
                           <div className="blog-img-placeholder">
                             <Mic2 size={40} className="placeholder-icon" />
                           </div>
                         )}
                      </div>
                      <div className="blog-card-content">
                        <h3>{blog.title}</h3>
                        <span className="read-more">Read Article →</span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="no-blogs">More exciting content coming soon!</p>
              )}
            </div>

            <div style={{ marginTop: '40px' }}>
              <SEOArtistsGrid category="All" city={city.name} />
            </div>
          </div>
        </div>
      </div>

    </>
  );
}
