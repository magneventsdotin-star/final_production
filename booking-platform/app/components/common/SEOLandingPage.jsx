"use client";

import CategoriesSection from '@/app/components/home/CategoriesSection'
import SEOArtistsGrid from '@/app/components/common/SEOArtistsGrid'
import SEODynamicContent from '@/app/components/common/SEODynamicContent'
import VideoGridSection from '@/app/components/home/VideoGridSection'
import ContactSection from '@/app/components/home/ContactSection'
import '@/app/seo-pages.css'

export default function SEOLandingPage({ 
  heroTitle, 
  heroSubtitle, 
  schema, 
  category, 
  city,
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
      <div className="city-landing-page">
        <div className="city-hero">
          <h1>{heroTitle}</h1>
          <p className="city-subtitle">
            {heroSubtitle}
          </p>
        </div>

        <div className="city-content-container">
          <div className="city-main-content">
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

            <div style={{ marginTop: '40px' }}>
              <SEOArtistsGrid category={category} city={city} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
