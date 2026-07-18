'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function Tracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
  
    if (typeof window !== 'undefined' && !sessionStorage.getItem('analytics_session_id')) {
      sessionStorage.setItem('analytics_session_id', Math.random().toString(36).substring(2, 15));
    }

    const sessionId = typeof window !== 'undefined' ? sessionStorage.getItem('analytics_session_id') : null;
    
    fetch('/api/analytics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        path: pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : ''),
        type: 'page_view',
        userAgent: window.navigator.userAgent,
        sessionId
      }),
    }).catch(err => console.error('Failed to track:', err));

  }, [pathname, searchParams]);

  return null;
}
