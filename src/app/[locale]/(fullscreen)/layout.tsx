import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

interface FullscreenLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function FullscreenLayout({
  children,
  params,
}: FullscreenLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  // Redirect to login if not authenticated
  const loginUrl = locale === 'fr' ? '/fr/login' : '/login';
  if (!accessToken) {
    redirect(loginUrl);
  }

  // Fullscreen layout - no sidebar, minimal chrome
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {children}
    </div>
  );
}
