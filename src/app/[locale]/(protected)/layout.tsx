import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import ProtectedLayoutClient from './ProtectedLayoutClient';

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;
  const { locale } = await params;

  // Redirect to login if no token
  if (!accessToken) {
    const loginUrl = locale === 'fr' ? '/fr/login' : '/login';
    redirect(loginUrl);
  }

  return (
    <ProtectedLayoutClient locale={locale}>
      {children}
    </ProtectedLayoutClient>
  );
}
