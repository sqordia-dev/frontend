import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { SEOProps } from '../types/seo';
import { 
  getCanonicalUrl, 
  getAlternateUrls, 
  getDefaultTitle, 
  getDefaultDescription, 
  getDefaultImage,
  truncateDescription 
} from '../utils/seo';

const BASE_URL = 'https://sqordia.com';

export default function SEO({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noindex = false,
  nofollow = false,
  canonical,
  lang,
  author,
  publishedTime,
  modifiedTime,
  structuredData
}: SEOProps) {
  const location = useLocation();
  const { language } = useTheme();
  const currentLang = lang || language;

  // Get page URL
  const pageUrl = url || getCanonicalUrl(location.pathname);
  const canonicalUrl = canonical || pageUrl;
  const alternateUrls = getAlternateUrls(location.pathname);

  // Get defaults
  const pageTitle = title || getDefaultTitle(currentLang);
  const pageDescription = truncateDescription(description || getDefaultDescription(currentLang));
  const pageImage = image || getDefaultImage();
  const pageKeywords = keywords || 'business plan, strategic plan, AI business planning, financial projections, startup planning, nonprofit planning, business plan generator, automated business plan, investor-ready business plan, grant application, OBNL strategic plan';

  // Robots meta
  const robotsContent = [];
  if (noindex) robotsContent.push('noindex');
  if (nofollow) robotsContent.push('nofollow');
  if (!noindex && !nofollow) robotsContent.push('index', 'follow');
  const robotsMeta = robotsContent.join(', ');

  // Open Graph type
  const ogType = type === 'article' ? 'article' : 'website';

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <html lang={currentLang} />
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <meta name="keywords" content={pageKeywords} />
      <meta name="robots" content={robotsMeta} />
      {author && <meta name="author" content={author} />}

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Hreflang Tags */}
      <link rel="alternate" hreflang="en" href={alternateUrls.en} />
      <link rel="alternate" hreflang="fr" href={alternateUrls.fr} />
      <link rel="alternate" hreflang="x-default" href={alternateUrls.en} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={pageUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={pageImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={pageTitle} />
      <meta property="og:site_name" content="Sqordia" />
      <meta property="og:locale" content={currentLang === 'fr' ? 'fr_CA' : 'en_US'} />
      {currentLang === 'en' && <meta property="og:locale:alternate" content="fr_CA" />}
      {currentLang === 'fr' && <meta property="og:locale:alternate" content="en_US" />}
      
      {type === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {type === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {type === 'article' && author && (
        <meta property="article:author" content={author} />
      )}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={pageUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={pageImage} />
      <meta name="twitter:image:alt" content={pageTitle} />
      <meta name="twitter:creator" content="@sqordia" />
      <meta name="twitter:site" content="@sqordia" />

      {/* Structured Data */}
      {structuredData && (
        Array.isArray(structuredData) ? (
          structuredData.map((data, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(data)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        )
      )}
    </Helmet>
  );
}
