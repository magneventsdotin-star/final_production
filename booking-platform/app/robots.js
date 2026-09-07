export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.magnevents.in';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/', 
        '/admin/', 
        '/private/', 
        '/preview/', 
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
