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
const QuickBookingModal = dynamic(() => import('@/app/components/common/QuickBookingModal'), { ssr: false })
const FloatingWhatsApp = dynamic(() => import('@/app/components/common/FloatingWhatsApp'), { ssr: false })
const PWAInstallPrompt = dynamic(() => import('@/app/components/common/PWAInstallPrompt'), { ssr: false })
const Tracker = dynamic(() => import('@/app/components/common/Tracker'), { ssr: false })
const LeadCaptureModal = dynamic(() => import('@/app/components/common/LeadCaptureModal'), { ssr: false })
export const viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.magnevents.in'),
  title: 'Book a Singer for House Party in Delhi-NCR, Weddings & Events | Magnevents',
  description: 'Book a live singer, bands, and artists for house parties in Delhi-NCR, weddings, corporate nights, and private events in India. Verified artists, direct booking, transparent pricing.',
  keywords: [
    'live singers in delhi',
    'live singer for house party',
    'book singer for house party',
    'singer for house party',
    'guitarist near me',
    'book live singer',
    'sufi singers in delhi',
    'guitarist for house party',
    'live bands for wedding in delhi',
    'singer in delhi',
    'guitarist at home',
    'live singer for house party near me',
    'live singer near me',
    'live bands in delhi',
    'singer for birthday party',
    'live singer',
    'guitarist for birthday party in delhi',
    'live music at home',
    'live music singers near me',
    'singer for home party',
    'live band for wedding',
    'singer near me',
    'singers for wedding',
    'singer at home',
    'singer for house party in gurgaon',
    'local singers near me'
  ],
  alternates: {
    canonical: '/',
  },
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
  openGraph: {
    title: 'Book a Singer for House Party in Delhi-NCR, Weddings & Events | Magnevents',
    description: 'Book a live singer, bands, and artists for house parties in Delhi-NCR, weddings, corporate nights, and private events in India. Verified artists, direct booking, transparent pricing.',
    url: '/',
    siteName: 'Magnevents',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Magnevents - Premium Live Artist Booking'
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Book a Singer for House Party in Delhi-NCR, Weddings & Events | Magnevents',
    description: 'Book a live singer, bands, and artists for house parties in Delhi-NCR, weddings, corporate nights, and private events in India. Verified artists, direct booking, transparent pricing.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-IN" className={inter.variable}>
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
          src="https://www.googletagmanager.com/gtag/js?id=G-VBP8HRFLFG"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-VBP8HRFLFG');
            gtag('config', 'G-F1VERBXK87');
          `}
        </Script>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-KRH84LZ5');
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
        <noscript>
          <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-KRH84LZ5" height="0" width="0" style={{ display: 'none', visibility: 'hidden' }}></iframe>
        </noscript>
        <Providers>
          <AppShellWrapper>
            {children}
          </AppShellWrapper>
          <ContactModal />
          <RegisterModal />
          <QuickBookingModal />
          <FloatingWhatsApp />
          <LeadCaptureModal />
          <PWAInstallPrompt />
          <Tracker />
        </Providers>
      </body>
    </html>
  );
}
