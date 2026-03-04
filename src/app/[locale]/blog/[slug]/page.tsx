import type { Metadata } from 'next';
import Header from '@/components/nextjs/Header';
import Footer from '@/components/nextjs/Footer';
import BlogPostContent from './BlogPostContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;

  // Default metadata - the client component handles the actual blog post data
  return {
    title: locale === 'fr' ? 'Article de Blog | Sqordia' : 'Blog Post | Sqordia',
    description: locale === 'fr'
      ? 'Lisez nos articles sur la planification d\'affaires et la strategie.'
      : 'Read our articles on business planning and strategy.',
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  return (
    <>
      <Header />
      <BlogPostContent locale={locale} slug={slug} />
      <Footer />
    </>
  );
}
