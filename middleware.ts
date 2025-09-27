import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isRole } from './src/lib/roles';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const rp = url.searchParams.get('role');

  if (rp && isRole(rp)) {
    const res = NextResponse.next();
    res.cookies.set('role', rp, { path: '/', sameSite: 'lax' });
    // URL’i temiz tutmak istersen ?role’i silip redirect et
    url.searchParams.delete('role');
    return NextResponse.redirect(url, { headers: res.headers });
  }
  return NextResponse.next();
}

// _next ve statikleri hariç tut
export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
};
