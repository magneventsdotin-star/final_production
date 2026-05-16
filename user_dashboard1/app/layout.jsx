import '@/app/styles/tokens.css';
import '@/app/styles/flow-unify.css';
import '@/app/index.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

import ContactModal from '@/app/components/common/ContactModal'
import RegisterModal from '@/app/components/common/RegisterModal'
import { Providers } from '@/app/layouts/Providers';
import { AppShellWrapper } from '@/app/layouts/AppShellWrapper';

export const metadata = {
  title: 'Magnevents — Premium Live Artist Booking',
  description: 'Artist-first booking for weddings, corporate nights, and concerts.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased" suppressHydrationWarning>
        <Providers>
          <AppShellWrapper>
            {children}
          </AppShellWrapper>
          <ContactModal />
          <RegisterModal />
        </Providers>
      </body>
    </html>
  );
}
