// Note: Since you're using dynamic data, you would normally fetch your list of artists and blog posts here.
// I've added placeholders for how you would fetch them. 

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.magnevents.in';

  // Example of how you would fetch dynamic routes:
  // const artists = await fetch('.../api/artists').then((res) => res.json());
  // const artistUrls = artists.map((artist) => ({
  //   url: `${baseUrl}/artist/${artist.id}`,
  //   lastModified: new Date(),
  // }));

  const staticRoutes = [
    '',
    '/about',
    '/artists',
    '/gallery',
    '/services',
    '/pricing',
    '/how-to-book',
    '/testimonials',
    '/why-choose',
    '/search',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly',
    priority: route === '' ? 1 : 0.8,
  }));

  // Return staticRoutes. In production, spread in ...artistUrls and ...blogUrls as well.
  return [...staticRoutes];
}
