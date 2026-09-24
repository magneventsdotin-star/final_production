"use client";

import CategoriesSection from '@/app/components/home/CategoriesSection';
import SEOArtistsGrid from '@/app/components/common/SEOArtistsGrid';
import SEODynamicContent from '@/app/components/common/SEODynamicContent';
import SEOLandingHero from '@/app/components/common/SEOLandingHero';
import VideoGridSection from '@/app/components/home/VideoGridSection';
import ContactSection from '@/app/components/home/ContactSection';
import '@/app/styles/pages/HomePage.css';

export default function SEOLandingPage({ 
  heroTitle, 
  heroSubtitle, 
  schema, 
  category, 
  city,
  subCategory,
  topArtists = [],
  overviewHtml,
  services,
  faqs,
  relatedLinks
}) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="hp">
        {/* Luxury Hero with Interactive Booking Engine & Top 5 Verified Artists Showcase */}
        <SEOLandingHero
          heroTitle={heroTitle}
          heroSubtitle={heroSubtitle}
          category={category}
          city={city}
          subCategory={subCategory}
          topArtists={topArtists}
        />

        {overviewHtml && services && faqs && relatedLinks ? (
          <SEODynamicContent 
            category={category}
            city={city}
            overviewHtml={overviewHtml}
            services={services}
            faqs={faqs}
            relatedLinks={relatedLinks}
          />
        ) : null}

        <VideoGridSection />
        <CategoriesSection />
        <SEOArtistsGrid category={category} city={city} fallbackArtists={topArtists} />

        <ContactSection />
      </div>
    </>
  );
}
