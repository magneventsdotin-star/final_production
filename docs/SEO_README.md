# SEO Configuration and Usage in Magnevents

This file documents all SEO-related implementations, keywords, and metadata configurations across the `magnevents-platform` codebase.

## 1. Global Metadata & Keywords
Found in `user_dashboard1/app/layout.jsx`

The global metadata provides the default SEO settings for the entire application.
- **Title:** Magnevents — Premium Live Artist Booking
- **Description:** Artist-first booking for weddings, corporate nights, and concerts.
- **Canonical URL:** `/`
- **Target Keywords / Themes:** "Live Artist Booking", "Weddings", "Corporate Nights", "Concerts", "Musician Booking"
- **OpenGraph:** Configured for rich social sharing (Facebook, LinkedIn, etc.) with title, description, and the `icon-512.png` image.
- **Twitter Cards:** Configured with `summary_large_image`, title, and description.

## 2. Dynamic SEO Generation (`generateMetadata`)
Used in individual pages to generate SEO data dynamically based on the content (e.g., specific artists or blog posts):
- **Artist Pages** (`app/artist/[id]/layout.jsx`): Fetches artist details to set the page title dynamically to the artist's name and description.
- **Blog Posts** (`app/blog-post/[id]/layout.jsx`): Fetches blog post content to dynamically set title and descriptions for better search engine ranking for specific articles.

## 3. Schema Markup (JSON-LD)
Schema markup helps search engines understand the structure of the content. Implemented as `<script type="application/ld+json">`.
Found in:
- `app/(desktop)/page.jsx` & `app/mobile-home/page.jsx`: Typically uses `Organization` or `WebSite` schema for the homepage.
- `app/components/common/SEOLandingPage.jsx`: Used for targeted SEO landing pages.
- `app/artist/[id]/layout.jsx`: Used to provide `Person` or `MusicGroup` schema for the artist.
- `app/blog-post/[id]/layout.jsx`: Used to provide `Article` schema.

## 4. Robots & Sitemap
- **Robots.txt** (`app/robots.js`): Programmatically generates the `robots.txt` rules, allowing search engine crawlers to index the site while restricting sensitive paths.
- **Sitemap.xml** (`app/sitemap.js`): Dynamically generates the sitemap containing all important URLs, helping search engines discover and crawl pages efficiently.

## 5. SEO Specialized Components
- **`SEOLandingPage.jsx`**: A reusable component designed specifically to render landing pages optimized for search engines, taking a `heroTitle`, `heroSubtitle`, and a custom `schema` object.

## 6. Keywords Extracted from Content & Constants
From `constants/index.js` and `HeroSection.jsx`:
- **Headings & Copy:** "Book A Musician For Your Grand Event!", "Events Celebrated", "Verified Artists".
- **Category Target Queries:** Singers, Live Bands, DJs, Comedians, Anchors, Dancers, Magicians. (Using specific queries like "Singer", "Band", "Dj", "Comedian", "Emcee", "Dancer", "Magician").

## Best Practices for Future Enhancements
To continue increasing SEO ranking, ensure that:
1. Every new page exports its own `metadata` object or uses `generateMetadata` for dynamic routes.
2. Alt tags for all images are highly descriptive.
3. JSON-LD schema remains valid according to Google's Rich Results Test.
4. Continue expanding the blog posts to target long-tail keywords (e.g., "Best live band for weddings in Jaipur").
