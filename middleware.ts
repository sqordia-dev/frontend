import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, defaultLocale } from './src/i18n/config';

// Paths that require authentication
const protectedPaths = [
  '/dashboard',
  '/profile',
  '/create-plan',
  '/subscription',
  '/invoices',
  '/questionnaire',
  '/generation',
  '/business-plan',
  '/onboarding',
  '/persona-selection',
  '/admin',
  '/bug-report',
];

// Paths that should redirect authenticated users away
const authPaths = ['/login', '/signup', '/forgot-password'];

// Public paths that don't need auth check
const publicPaths = [
  '/',
  '/privacy',
  '/terms',
  '/security',
  '/compliance',
  '/pricing',
  '/subscription-plans',
  '/example-plans',
  '/blog',
  '/template',
  '/checkout',
  '/reset-password',
  '/verify-email',
  '/auth',
];

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed', // Only add locale prefix for non-default locale
});

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // Static files like .ico, .svg, etc.
  ) {
    return NextResponse.next();
  }

  // Extract locale from pathname
  const pathnameLocale = locales.find(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  const locale = pathnameLocale || defaultLocale;

  // Remove locale prefix to get the actual path
  const pathWithoutLocale = pathnameLocale
    ? pathname.replace(`/${pathnameLocale}`, '') || '/'
    : pathname;

  // Check if path requires authentication
  const isProtectedPath = protectedPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );

  // Check if path is an auth page (login, signup, etc.)
  const isAuthPath = authPaths.some(
    (path) => pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`)
  );

  // Get auth token from cookies
  const accessToken = request.cookies.get('accessToken')?.value;
  const isAuthenticated = !!accessToken;

  // Redirect unauthenticated users from protected routes to login
  if (isProtectedPath && !isAuthenticated) {
    const loginUrl = new URL(`/${locale}/login`, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth pages to dashboard
  if (isAuthPath && isAuthenticated) {
    return NextResponse.redirect(new URL(`/${locale}/dashboard`, request.url));
  }

  // Apply i18n middleware for locale handling
  return intlMiddleware(request);
}

export const config = {
  // Match all paths except static files and API routes
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
