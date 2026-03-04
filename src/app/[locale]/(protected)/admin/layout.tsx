import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import AdminLayoutClient from './AdminLayoutClient';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({
  children,
  params,
}: AdminLayoutProps) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('accessToken')?.value;

  // Redirect to login if not authenticated
  const loginUrl = locale === 'fr' ? '/fr/login' : '/login';
  if (!accessToken) {
    redirect(loginUrl);
  }

  // TODO: Verify admin role from token/session
  // For now, we trust the middleware to have verified authentication
  // and the client component will check for admin role

  return (
    <AdminLayoutClient locale={locale}>
      {children}
    </AdminLayoutClient>
  );
}
