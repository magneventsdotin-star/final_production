import { notFound, redirect } from 'next/navigation';
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
  const isValidKeyword = validKeywords.some(kw => location_slug.toLowerCase().includes(kw));

  const majorCities = [
    'delhi', 'new-delhi', 'noida', 'gurgaon', 'gurugram', 'faridabad', 'ghaziabad',
    'mumbai', 'bangalore', 'bengaluru', 'pune', 'hyderabad', 'chennai', 'kolkata', 'ahmedabad',
    'chandigarh', 'jaipur', 'lucknow', 'surat', 'indore', 'patna', 'bhopal', 'agra',
    'kanpur', 'nagpur', 'thane', 'visakhapatnam', 'vadodara', 'ludhiana', 'nashik',
    'meerut', 'rajkot', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar',
    'allahabad', 'ranchi', 'howrah', 'coimbatore', 'jabalpur', 'gwalior', 'vijayawada',
    'jodhpur', 'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh', 'thiruvananthapuram'
  ];

  if (majorCities.includes(location_slug.toLowerCase())) {
    redirect(`/city/${location_slug.toLowerCase()}`);
  }

  if (!isValidKeyword) {
    notFound();
  }

  const formattedTitle = location_slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  let parsedCategory = 'All';
  let parsedCity = 'All Cities';
  const slugLower = location_slug.toLowerCase();
  
  if (slugLower.includes('band')) parsedCategory = 'Live band';
  else if (slugLower.includes('musician') || slugLower.includes('music')) parsedCategory = 'Musician';
  else if (slugLower.includes('dj')) parsedCategory = 'Dj';
  else if (slugLower.includes('comedian')) parsedCategory = 'Comedian';
  else if (slugLower.includes('singer') || slugLower.includes('artist')) parsedCategory = 'Singer';

  const parts = slugLower.split('-in-');
  if (parts.length > 1) {
    const cityStr = parts[1].replace(/-/g, ' ');
    parsedCity = cityStr.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }

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
      category={parsedCategory}
      city={parsedCity}
    />
  );
}
