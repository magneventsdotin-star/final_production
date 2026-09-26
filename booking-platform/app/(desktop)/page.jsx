import HeroSection from '@/app/components/home/HeroSection'
import HeroVideosSection from '@/app/components/home/HeroVideosSection'
import TopPerformerSection from '@/app/components/home/TopPerformerSection'
import CategoriesSection from '@/app/components/home/CategoriesSection'
import FeaturedArtistsSection from '@/app/components/home/FeaturedArtistsSection'
import PromotionalOfferSection from '@/app/components/home/PromotionalOfferSection'
import WhyChooseSection from '@/app/components/home/WhyChooseSection'
import TestimonialsSection from '@/app/components/home/TestimonialsSection'
import HowToBookSection from '@/app/components/home/HowToBookSection'
import FaqSection from '@/app/components/home/FaqSection'
import InfoCards from '@/app/components/home/InfoCards'
import ContactSection from '@/app/components/home/ContactSection'
import SeoCardsSection from '@/app/components/home/SeoCardsSection'
import SeoKeywordFooter from '@/app/components/home/SeoKeywordFooter'
import '@/app/styles/pages/HomePage.css'

export const metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
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
      <div className="hp">
        <HeroSection />
        <HeroVideosSection />
        <TopPerformerSection />
        <PromotionalOfferSection />
        <CategoriesSection />
        <FeaturedArtistsSection />
        <WhyChooseSection />
        <HowToBookSection />
        <TestimonialsSection />
        <FaqSection />
        <InfoCards />
        <ContactSection />
        <SeoCardsSection />
        <SeoKeywordFooter />
      </div>
    </>
  )
}
