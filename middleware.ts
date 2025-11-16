import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

// Allowed origins for CORS
const ALLOWED_ORIGINS = [
  'https://awesome-stick-193250.framer.app',
  'https://stellar-room-885268.framer.app',
  'https://www.fertilityflowmethod.com',
  'https://fertilityflowmethod.com',
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
];

export default withAuth(
  function middleware(req: NextRequest) {
    const origin = req.headers.get('origin');
    const pathname = req.nextUrl.pathname;

    // Add CORS headers for newsletter API endpoint
    if (pathname.startsWith('/api/newsletter')) {
      const isAllowedOrigin = ALLOWED_ORIGINS.some(
        allowed => origin && origin.includes(allowed)
      );

      if (isAllowedOrigin) {
        const response = NextResponse.next();
        response.headers.set('Access-Control-Allow-Origin', origin || '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        return response;
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const pathname = req.nextUrl.pathname;

        // Allow newsletter API without auth
        if (pathname.startsWith('/api/newsletter')) {
          return true;
        }

        // Require auth for protected routes
        if (pathname.startsWith('/dashboard') || pathname.includes('/access')) {
          return !!token;
        }

        return true;
      },
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/programs/:path*/access',
    '/api/newsletter/:path*',
  ],
};
