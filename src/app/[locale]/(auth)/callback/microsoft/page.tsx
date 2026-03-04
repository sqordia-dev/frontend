import type { Metadata } from 'next';
import MicrosoftCallbackContent from './MicrosoftCallbackContent';

export const metadata: Metadata = {
  title: 'Signing in... | Sqordia',
  robots: {
    index: false,
    follow: false,
  },
};

export default function MicrosoftCallbackPage() {
  return <MicrosoftCallbackContent />;
}
