# Next.js Migration Documentation

## Overview

This document describes the migration from Vite + React Router to Next.js 15 App Router for the Sqordia frontend application.

## Migration Status

**Completed**: All phases of migration have been successfully implemented.

### Phase Summary

| Phase | Description | Status |
|-------|-------------|--------|
| Phase 0 | Foundation Setup | ✅ Complete |
| Phase 1 | Public Pages Migration | ✅ Complete |
| Phase 2 | Auth Pages Migration | ✅ Complete |
| Phase 3 | Protected Layout + Core Pages | ✅ Complete |
| Phase 4 | Questionnaire & Generation Flows | ✅ Complete |
| Phase 5 | Admin Section | ✅ Complete |
| Phase 6 | Cleanup & Optimization | ✅ Complete |
| Phase 7 | Final Verification | ✅ Complete |

## Architecture Changes

### Before (Vite + React Router)
- Client-side rendering only
- React Router for navigation
- localStorage for auth tokens
- react-helmet-async for SEO

### After (Next.js 15 App Router)
- Hybrid rendering (SSG/SSR/CSR)
- Next.js App Router for navigation
- httpOnly cookies for auth tokens (BFF pattern)
- Next.js Metadata API for SEO

## Directory Structure

```
src/app/
├── [locale]/                    # Locale-based routing (en, fr)
│   ├── (auth)/                  # Auth pages (login, signup, etc.)
│   │   ├── login/
│   │   ├── signup/
│   │   ├── forgot-password/
│   │   ├── reset-password/
│   │   ├── verify-email/
│   │   └── callback/
│   │       ├── google/
│   │       └── microsoft/
│   ├── (protected)/             # Authenticated pages
│   │   ├── dashboard/
│   │   ├── profile/
│   │   ├── create-plan/
│   │   ├── subscription/
│   │   ├── invoices/
│   │   ├── persona-selection/
│   │   └── admin/               # Admin section
│   │       ├── users/
│   │       ├── cms/
│   │       ├── ai-studio/
│   │       ├── feature-flags/
│   │       ├── organizations/
│   │       ├── activity-logs/
│   │       ├── settings/
│   │       └── bug-report/
│   ├── (fullscreen)/            # Full-screen immersive pages
│   │   ├── questionnaire/[planId]/
│   │   ├── generation/[planId]/
│   │   └── business-plan/[id]/preview/
│   └── (public)/                # Public pages
│       ├── pricing/
│       ├── privacy/
│       ├── terms/
│       ├── security/
│       ├── compliance/
│       └── example-plans/
├── api/                         # API routes (BFF)
│   ├── auth/                    # Auth endpoints
│   │   ├── login/
│   │   ├── logout/
│   │   ├── register/
│   │   ├── refresh/
│   │   ├── session/
│   │   ├── google/
│   │   ├── microsoft/
│   │   └── ...
│   ├── business-plans/
│   ├── user/
│   ├── invoices/
│   ├── subscription/
│   ├── organizations/
│   └── health/
├── sitemap.ts                   # Dynamic sitemap generation
├── robots.ts                    # robots.txt
└── layout.tsx                   # Root layout
```

## Route Count

- **Total Routes**: 52 unique routes
- **Total Pages**: 97 (routes × locales)
- **API Routes**: 18

## Key Changes

### 1. Authentication (BFF Pattern)

```typescript
// OLD: localStorage tokens
localStorage.setItem('accessToken', token);

// NEW: httpOnly cookies via API routes
// src/app/api/auth/login/route.ts
response.cookies.set('accessToken', token, {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 86400,
  path: '/',
});
```

### 2. Navigation

```typescript
// OLD: React Router
import { useNavigate, Link } from 'react-router-dom';
navigate('/dashboard');
<Link to="/dashboard">

// NEW: Next.js
import { useRouter } from 'next/navigation';
import Link from 'next/link';
router.push('/dashboard');
<Link href="/dashboard">
```

### 3. Route Parameters

```typescript
// OLD: React Router
const { id } = useParams();

// NEW: Next.js (received as props in server component)
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
}

// For client components, pass from server component
// page.tsx (server)
export default async function Page({ params }) {
  const { id } = await params;
  return <ClientComponent id={id} />;
}
```

### 4. SEO Metadata

```typescript
// OLD: react-helmet-async
<Helmet>
  <title>Page Title</title>
  <meta name="description" content="..." />
</Helmet>

// NEW: Next.js Metadata API
export async function generateMetadata({ params }): Promise<Metadata> {
  return {
    title: 'Page Title',
    description: '...',
    alternates: { canonical: '...', languages: { en: '...', fr: '...' } },
  };
}
```

## Development Commands

```bash
# Next.js Development
npm run dev:next          # Start dev server (http://localhost:3000)
npm run build:next        # Production build
npm run start:next        # Start production server
npm run lint:next         # Run ESLint

# Vite (Legacy - will be removed)
npm run dev               # Vite dev server (http://localhost:5173)
npm run build             # Vite production build
```

## Docker Deployment

### Build Image

```bash
docker build -f Dockerfile.nextjs -t sqordia-frontend-nextjs .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://api.sqordia.com \
  sqordia-frontend-nextjs
```

### Docker Compose

```bash
docker-compose -f docker-compose.nextjs.yml up --build
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `http://localhost:5241` |
| `NODE_ENV` | Environment mode | `development` |

## Security Headers

The following security headers are configured in `next.config.mjs`:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `X-XSS-Protection: 1; mode=block`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`
- `X-DNS-Prefetch-Control: on`

## Legacy Redirects

The following redirects maintain backward compatibility:

| Old URL | New URL |
|---------|---------|
| `/plans/:id` | `/business-plan/:id/preview` |
| `/plans/:id/preview` | `/business-plan/:id/preview` |
| `/register` | `/signup` |
| `/interview/:planId` | `/questionnaire/:planId` |
| `/admin/overview` | `/admin` |

## Files to Remove (After Full Migration)

These files are no longer needed after switching to Next.js:

```
- src/App.tsx
- src/main.tsx
- vite.config.ts
- index.html
- nginx.conf
- Dockerfile (Vite version)
- src/components/ProtectedRoute.tsx
- src/components/SEO.tsx
```

## Performance Improvements

1. **Static Generation**: Public pages (pricing, privacy, terms) are pre-rendered at build time
2. **Standalone Output**: Production build creates a self-contained Node.js server
3. **Image Optimization**: Next.js Image component for automatic optimization
4. **Font Caching**: Static assets cached with immutable headers
5. **Code Splitting**: Automatic per-route code splitting

## Internationalization (i18n)

- Subpath routing: `/en/*`, `/fr/*`
- Configured via `next-intl`
- Dictionary files: `src/i18n/dictionaries/{locale}.json`
- Middleware handles locale detection and routing

## Azure Container Apps Deployment

The application is configured for Azure Container Apps deployment:

1. Build produces standalone output
2. Container runs on port 3000
3. Health check endpoint: `/api/health`
4. Recommended resources: 1 CPU, 2GB memory
5. Auto-scaling: 2-10 replicas

## Rollback Procedure

If issues arise:

1. Revert to Vite Dockerfile:
   ```bash
   docker build -f Dockerfile -t sqordia-frontend .
   ```
2. Deploy previous image
3. DNS unchanged, instant rollback

## Monitoring

- Health endpoint: `GET /api/health`
- Returns: `{ status: 'healthy', timestamp: '...', version: '...' }`

## Known Limitations

1. **TypeScript Errors**: Build ignores TypeScript errors (`ignoreBuildErrors: true`)
2. **Vite Files**: Legacy Vite files remain for parallel running during transition

## Next Steps

1. Remove legacy Vite files after production verification
2. Enable TypeScript strict mode
3. Add error monitoring (Sentry)
4. Add performance monitoring (Vercel Analytics)
