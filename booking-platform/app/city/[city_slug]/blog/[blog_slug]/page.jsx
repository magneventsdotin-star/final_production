import { notFound } from 'next/navigation';
import { supabase } from '@database/connection/supabase';
import Link from 'next/link';
import '../../../../seo-pages.css';

export async function generateMetadata({ params }) {
  const awaitedParams = await params;
  const { city_slug, blog_slug } = awaitedParams;
  
  const { data: blog } = await supabase
    .from('seo_blogs')
    .select('*, seo_cities!inner(slug, name)')
    .eq('slug', blog_slug)
    .eq('seo_cities.slug', city_slug)
    .single();

  if (!blog) {
    return { title: 'Blog Not Found - Magnevents' };
  }

  return {
    title: blog.seo_title || blog.title,
    description: blog.meta_description,
    alternates: {
      canonical: `/city/${city_slug}/blog/${blog.slug}`,
    }
  };
}

export default async function CityBlogPage({ params }) {
  const awaitedParams = await params;
  const { city_slug, blog_slug } = awaitedParams;

  const { data: blog } = await supabase
    .from('seo_blogs')
    .select('*, seo_cities!inner(slug, name)')
    .eq('slug', blog_slug)
    .eq('seo_cities.slug', city_slug)
    .single();

  if (!blog) {
    notFound();
  }

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://www.magnevents.in/city/${city_slug}/blog/${blog.slug}`
    },
    "headline": blog.seo_title || blog.title,
    "description": blog.meta_description,
    "image": blog.featured_image_url || "https://www.magnevents.in/logo.webp",
    "datePublished": blog.published_at || blog.created_at,
    "dateModified": blog.updated_at,
    "author": {
      "@type": "Organization",
      "name": "Magnevents",
      "url": "https://www.magnevents.in"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      
      <div className="seo-blog-page">
        <div className="blog-container">
          <nav className="breadcrumb">
            <Link href="/">Home</Link>
            <span className="separator">/</span>
            <Link href={`/city/${city_slug}`}>{blog.seo_cities.name}</Link>
            <span className="separator">/</span>
            <span className="current">{blog.title}</span>
          </nav>

          <article className="blog-content">
            {blog.featured_image_url && (
              <img 
                src={blog.featured_image_url} 
                alt={blog.title}
                className="featured-image"
              />
            )}
            
            <div 
              className="blog-html-content"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
            
            <div className="cta-section">
              <h3>Ready to book a singer in {blog.seo_cities.name}?</h3>
              <p>Explore verified artists and live bands for your next event.</p>
              <Link href="/artists" className="cta-btn">Browse Artists</Link>
            </div>
          </article>
        </div>
      </div>

    </>
  );
}
