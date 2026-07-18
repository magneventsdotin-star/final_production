import '@/app/styles/tokens.css';
import '@/app/styles/flow-unify.css';
import '@/app/index.css';

import { Inter } from 'next/font/google';
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

import dynamic from 'next/dynamic'
import Script from 'next/script'
import { Providers } from '@/app/layouts/Providers';
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper';

const ContactModal = dynamic(() => import('@/app/components/common/ContactModal'), { ssr: false })
const RegisterModal = dynamic(() => import('@/app/components/common/RegisterModal'), { ssr: false })
const FloatingWhatsApp = dynamic(() => import('@/app/components/common/FloatingWhatsApp'), { ssr: false })
const PWAInstallPrompt = dynamic(() => import('@/app/components/common/PWAInstallPrompt'), { ssr: false })
const Tracker = dynamic(() => import('@/app/components/common/Tracker'), { ssr: false })
export const viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.magnevents.in'),
  title: 'Book Live Singers, Bands & Artists in India | Magnevents',
  description: 'Book live singers, bands, and artists for weddings, corporate nights, and private events in India. Verified artists, direct booking, transparent pricing.',
  keywords: [
    'Magnevents',
    'book a singer for an event',
    'book live singer',
    'singer for house party in delhi',
    'book bands for events',
    'book singers for wedding',
    'book singer for house party',
    'book singer in delhi',
    'book singer for wedding',
    'live band for party'
  ],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/icon-512.png', type: 'image/png', sizes: '512x512' }
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    title: 'Magnevents',
    statusBarStyle: 'default',
  },
  alternates: {
    canonical: '/',
  },
  keywords: ['Live Artist Booking', 'Weddings', 'Corporate Nights', 'Concerts', 'Musician Booking', 'Live Singers', 'Live Bands', 'DJs', 'Comedians'],
  openGraph: {
    title: 'Book Live Singers, Bands & Artists in India | Magnevents',
    description: 'Book live singers, bands, and artists for weddings, corporate nights, and private events in India. Verified artists, direct booking, transparent pricing.',
    url: '/',
    siteName: 'Magnevents',
    images: [
      {
        url: '/icon-512.png',
        width: 512,
        height: 512,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book Live Singers, Bands & Artists in India | Magnevents',
    description: 'Book live singers, bands, and artists for weddings, corporate nights, and private events in India. Verified artists, direct booking, transparent pricing.',
    images: ['/icon-512.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('beforeinstallprompt', (e) => {
                e.preventDefault();
                window.deferredPrompt = e;
                window.dispatchEvent(new CustomEvent('pwa-installable'));
              });
            `
          }}
        />
    
        <Script 
          src="https://www.googletagmanager.com/gtag/js?id=G-F1VERBXX87"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F1VERBXX87');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "Magnevents",
              "url": "https://www.magnevents.in"
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Magnevents",
              "url": "https://www.magnevents.in",
              "logo": "https://www.magnevents.in/icon-512.png",
              "email": "magneventsdotin@gmail.com",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+91-8078515257",
                "contactType": "customer support",
                "availableLanguage": ["English", "Hindi"]
              },
              "sameAs": [
                "https://www.instagram.com/magnevents.in?igsh=MXY2NmtjMm82bTFnaA==",
                "https://x.com/magnevents94",
                "https://youtube.com/@magnevents?si=QsPkahKK-fjSUTe4"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <AppShellWrapper>
            {children}
          </AppShellWrapper>
          <ContactModal />
          <RegisterModal />
          <FloatingWhatsApp />
          <PWAInstallPrompt />
          <Tracker />
        </Providers>
      </body>
    </html>
  );
}
