import type { Metadata } from 'next';
import GoogleCallbackContent from './GoogleCallbackContent';

export const metadata: Metadata = {
  title: 'Signing in... | Sqordia',
  robots: {
    index: false,
    follow: false,
  },
};

export default function GoogleCallbackPage() {
  return <GoogleCallbackContent />;
}
