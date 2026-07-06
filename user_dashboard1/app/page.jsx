import HeroSection from '@/app/components/home/HeroSection'
import TopPerformerSection from '@/app/components/home/TopPerformerSection'
import CategoriesSection from '@/app/components/home/CategoriesSection'
import FeaturedArtistsSection from '@/app/components/home/FeaturedArtistsSection'
import WhyChooseSection from '@/app/components/home/WhyChooseSection'
import TestimonialsSection from '@/app/components/home/TestimonialsSection'
import HowToBookSection from '@/app/components/home/HowToBookSection'
import FaqSection from '@/app/components/home/FaqSection'
import InfoCards from '@/app/components/home/InfoCards'
import ContactSection from '@/app/components/home/ContactSection'
import '@/app/styles/pages/HomePage.css'

export default function HomePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Magnevents",
    "url": "https://www.magnevents.in",
    "logo": "https://www.magnevents.in/icon-512.png",
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
        <TopPerformerSection />
        <CategoriesSection />
        <FeaturedArtistsSection />
        <WhyChooseSection />
        <HowToBookSection />
        <TestimonialsSection />
        <FaqSection />
        <InfoCards />
        <ContactSection />
      </div>
    </>
  )
}
