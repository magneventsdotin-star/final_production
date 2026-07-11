import React from 'react';
import '@/app/styles/pages/MobileHomePage.css';

import MobileHero from '@/components/mobile/Hero';
import MobileTopPerformer from '@/components/mobile/TopPerformer';
import MobileCategories from '@/components/mobile/Categories';
import MobileFeaturedArtists from '@/components/mobile/FeaturedArtists';
import MobileWhyChoose from '@/components/mobile/WhyChoose';
import MobileHowToBook from '@/components/mobile/HowToBook';
import MobileContact from '@/components/mobile/Contact';

export default function MobileHomePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Magnevents",
    "url": "https://www.magnevents.in",
    "logo": "https://www.magnevents.in/logo.webp",
    "sameAs": [
      "https://www.instagram.com/magnevents.in?igsh=MXY2NmtjMm82bTFnaA==",
      "https://facebook.com/magnevents"
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <div className="mobile-hp">
        <MobileHero />
        <MobileTopPerformer />
        <MobileCategories />
        <MobileFeaturedArtists />
        <MobileWhyChoose />
        <MobileHowToBook />
        <MobileContact />
      </div>
    </>
  );
}
