import { notFound } from 'next/navigation';
import SEOLandingPage from '@/app/components/common/SEOLandingPage';

export async function generateMetadata({ params }) {
  // Await params in Next.js 15 before using properties
  const awaitedParams = await params;
  const { location_slug } = awaitedParams;
  
  const formattedTitle = location_slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return {
    title: `${formattedTitle} | Verified Artists | Magnevents`,
    description: `Looking for the best ${formattedTitle}? Book verified artists, musicians, and performers for your house party, wedding, or corporate event via Magnevents.`,
    alternates: {
      canonical: `/${location_slug}`,
    }
  };
}

export default async function LocationServicePage({ params }) {
  const awaitedParams = await params;
  const { location_slug } = awaitedParams;
  
  const validKeywords = ['singer', 'band', 'dj', 'comedian', 'anchor', 'dancer', 'magician', 'guitarist', 'music', 'artist'];
  const isValid = validKeywords.some(kw => location_slug.toLowerCase().includes(kw));

  if (!isValid) {
    notFound();
  }

  const formattedTitle = location_slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `Best ${formattedTitle}`,
    "description": `Book verified ${formattedTitle} for your next event.`,
    "url": `https://www.magnevents.in/${location_slug}`
  };

  return (
    <SEOLandingPage 
      heroTitle={`Top ${formattedTitle}`}
      heroSubtitle={`Book verified performers directly for your next grand event.`}
      schema={schema}
    />
  );
}
