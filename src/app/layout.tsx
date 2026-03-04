import type { Metadata, Viewport } from 'next';
import { Inter, DM_Sans } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-dm-sans',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://sqordia.com'),
  title: {
    default: 'Sqordia - AI-Powered Business Planning in Under 60 Minutes',
    template: '%s | Sqordia',
  },
  description:
    'Create professional, bank-ready business plans in under 60 minutes with AI-powered guidance. Perfect for entrepreneurs, consultants, and non-profits.',
  keywords: [
    'business plan',
    'strategic plan',
    'AI business planning',
    'business plan generator',
    'startup planning',
    'entrepreneur tools',
    'Quebec business',
    'Canadian business',
  ],
  authors: [{ name: 'Sqordia' }],
  creator: 'Sqordia',
  publisher: 'Sqordia',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    alternateLocale: 'fr_CA',
    siteName: 'Sqordia',
    title: 'Sqordia - AI-Powered Business Planning in Under 60 Minutes',
    description:
      'Create professional, bank-ready business plans in under 60 minutes with AI-powered guidance.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sqordia - AI-Powered Business Planning',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@sqordia',
    creator: '@sqordia',
    title: 'Sqordia - AI-Powered Business Planning',
    description:
      'Create professional, bank-ready business plans in under 60 minutes.',
    images: ['/og-image.jpg'],
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: '/favicon.svg',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#FF6B00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${dmSans.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
