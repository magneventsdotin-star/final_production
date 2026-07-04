"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Nav from '@/app/components/layout/Nav';
import BottomNav from '@/app/components/layout/BottomNav';
import Footer from '@/app/components/common/Footer';
import { useMouseGlow } from '@/app/hooks/useMouseGlow';

const HIDE_CHROME_ON = ['/checkout', '/confirmed', '/login', '/signup', '/onboarding', '/chat'];

export function AppShellWrapper({ children }) {
  const pathname = usePathname();
  const hideChrome = HIDE_CHROME_ON.some(p => pathname.startsWith(p));


  useMouseGlow();

  const routeTransitionClass = ['/artists', '/services', '/gallery', '/events', '/pricing', '/book', '/blog-post', '/contact', '/search', '/markets']
    .includes(pathname)
    ? 'route-showcase'
    : 'route-default';

  return (
    <div className="flow-unify-shell">
      <div className="flow-unify-atmos" aria-hidden="true" />
      <div className="ambient-canvas" aria-hidden="true" />

      {!hideChrome && <Nav />}

      <div className={`page-enter ${routeTransitionClass}`} style={{ minHeight: '100vh', paddingTop: '72px' }}>
        <div className="flow-unify-page-wrap">
          {children}
        </div>
        {!hideChrome && <Footer />}
      </div>

      {!hideChrome && <BottomNav />}
    </div>
  );
}
