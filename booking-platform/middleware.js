import { NextResponse } from 'next/server'

export function middleware(request) {
  const userAgent = request.headers.get('user-agent') || ''
  
  // Basic mobile check
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)

  // Disable mobile rewrite for now to show desktop view everywhere
  /*
  if (isMobile && request.nextUrl.pathname === '/') {
    // Rewrite to mobile home instead of redirecting so the URL remains `/`
    const url = request.nextUrl.clone()
    url.pathname = '/mobile-home'
    return NextResponse.rewrite(url)
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: '/',
}
