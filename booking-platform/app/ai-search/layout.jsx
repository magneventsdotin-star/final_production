export const metadata = {
  title: "AI Event & Artist Search — Smart Musician Matcher | Magnevents",
  description: "Find and book verified live singers, bands, DJs, and performers in seconds with Magnevents AI Search powered by deep reasoning. Instant matches, direct pricing, and 0% agency fees.",
  keywords: [
    "AI artist search",
    "book singer AI",
    "hire live band online",
    "wedding singer match",
    "ghazal singer search",
    "Magnevents AI",
    "live musicians booking India",
    "Bhubaneswar live music",
    "corporate event entertainment AI"
  ],
  alternates: {
    canonical: "https://www.magnevents.in/ai-search"
  },
  openGraph: {
    title: "Magnevents AI Event & Artist Search — Instant Musician Matching",
    description: "Describe your event in your own words. Our AI recommends verified live performers, custom setlists, and direct pricing with up to 60% OFF booking fees.",
    url: "https://www.magnevents.in/ai-search",
    siteName: "Magnevents",
    images: [
      {
        url: "https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-live-band-concert.webp",
        width: 1200,
        height: 630,
        alt: "Magnevents AI Event & Musician Search"
      }
    ],
    locale: "en_IN",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Event & Artist Search | Magnevents",
    description: "Match verified singers, bands & DJs in seconds with deep AI reasoning and direct pricing.",
    images: ["https://pub-1802bb19214743ffa99aa227f25e7ede.r2.dev/assets/lux-live-band-concert.webp"]
  }
};

export default function AISearchLayout({ children }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Magnevents AI Event & Artist Matcher",
        "url": "https://www.magnevents.in/ai-search",
        "applicationCategory": "EntertainmentApplication",
        "operatingSystem": "All",
        "browserRequirements": "Requires JavaScript. Requires HTML5.",
        "description": "Next-generation AI live entertainment matcher for booking verified singers, live bands, DJs, and stage performers across India.",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "INR"
        }
      },
      {
        "@type": "WebSite",
        "@id": "https://www.magnevents.in/#website",
        "url": "https://www.magnevents.in",
        "name": "Magnevents",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://www.magnevents.in/ai-search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
