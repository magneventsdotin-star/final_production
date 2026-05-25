import '@/app/styles/tokens.css';
import '@/app/styles/flow-unify.css';
import '@/app/index.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import dynamic from 'next/dynamic'
import { Providers } from '@/app/layouts/Providers';
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper';

const ContactModal = dynamic(() => import('@/app/components/common/ContactModal'), { ssr: false })
const RegisterModal = dynamic(() => import('@/app/components/common/RegisterModal'), { ssr: false })
const FloatingWhatsApp = dynamic(() => import('@/app/components/common/FloatingWhatsApp'), { ssr: false })
const PWAInstallPrompt = dynamic(() => import('@/app/components/common/PWAInstallPrompt'), { ssr: false })

export const viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  title: 'Magnevents — Premium Live Artist Booking',
  description: 'Artist-first booking for weddings, corporate nights, and concerts.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192.png',
    apple: '/icon-192.png',
  },
  appleWebApp: {
    capable: true,
    title: 'Magnevents',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
        </Providers>
      </body>
    </html>
  );
}
