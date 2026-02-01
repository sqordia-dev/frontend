import React, { useMemo } from 'react';
import { Shield } from 'lucide-react';
import { CoverPageSettings, DEFAULT_COVER_PAGE } from '../../types/cover-page';

interface CoverPagePreviewProps {
  settings: Partial<CoverPageSettings>;
  className?: string;
  compact?: boolean;
}

/**
 * Helper function to generate gradient CSS
 */
function getGradientCSS(settings: Partial<CoverPageSettings>): string {
  const start = settings.gradientStartColor || '#1A2B47';
  const end = settings.gradientEndColor || '#2563EB';
  const direction = settings.gradientDirection || 'diagonal-down';

  const directionMap: Record<string, string> = {
    'horizontal': 'to right',
    'vertical': 'to bottom',
    'diagonal-down': '135deg',
    'diagonal-up': '45deg',
    'radial': 'circle at center',
  };

  if (direction === 'radial') {
    return `radial-gradient(${directionMap[direction]}, ${start}, ${end})`;
  }

  return `linear-gradient(${directionMap[direction]}, ${start}, ${end})`;
}

/**
 * Helper function to format date
 */
function formatDate(dateString: string, format: string = 'MMMM yyyy'): string {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {};

    if (format.includes('yyyy') || format.includes('YYYY')) {
      options.year = 'numeric';
    }
    if (format.includes('MMMM')) {
      options.month = 'long';
    } else if (format.includes('MMM')) {
      options.month = 'short';
    } else if (format.includes('MM')) {
      options.month = '2-digit';
    }
    if (format.includes('d') || format.includes('dd')) {
      options.day = 'numeric';
    }

    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
}

/**
 * Corner decoration component
 */
function CornerDecoration({
  style,
  color,
  position
}: {
  style: string;
  color: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}) {
  if (style === 'none') return null;

  const positionClasses: Record<string, string> = {
    'top-left': 'top-0 left-0',
    'top-right': 'top-0 right-0 rotate-90',
    'bottom-left': 'bottom-0 left-0 -rotate-90',
    'bottom-right': 'bottom-0 right-0 rotate-180',
  };

  if (style === 'geometric') {
    return (
      <div className={`absolute ${positionClasses[position]} w-24 h-24`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="0" cy="0" r="80" fill={color} />
          <circle cx="0" cy="0" r="50" fill={color} opacity="0.5" />
        </svg>
      </div>
    );
  }

  if (style === 'lines') {
    return (
      <div className={`absolute ${positionClasses[position]} w-20 h-20`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {[0, 20, 40, 60, 80].map((offset) => (
            <line
              key={offset}
              x1={offset}
              y1="0"
              x2="0"
              y2={offset}
              stroke={color}
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    );
  }

  if (style === 'dots') {
    return (
      <div className={`absolute ${positionClasses[position]} w-16 h-16 p-2`}>
        <div className="grid grid-cols-3 gap-1">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/**
 * Cover Page Preview Component
 * Renders a preview of the business plan cover page with all customization options
 */
export function CoverPagePreview({ settings, className = '', compact = false }: CoverPagePreviewProps) {
  // Merge with defaults
  const mergedSettings = useMemo(() => ({
    ...DEFAULT_COVER_PAGE,
    ...settings,
  }), [settings]);

  const {
    // Background
    backgroundType,
    backgroundColor,
    backgroundImageUrl,
    backgroundImagePosition,
    backgroundOverlayColor,
    backgroundOverlayOpacity,
    // Logo
    logoUrl,
    logoPosition,
    logoSize,
    showLogo,
    // Text
    companyName,
    documentTitle,
    tagline,
    fontFamily,
    titleColor,
    titleSize,
    subtitleColor,
    subtitleSize,
    textAlignment,
    // Additional Info
    showDate,
    dateFormat,
    preparedDate,
    preparedBy,
    showPreparedBy,
    version,
    showVersion,
    showConfidentialBadge,
    confidentialText,
    // Contact
    contactName,
    contactTitle,
    contactPhone,
    contactEmail,
    website,
    showContactInfo,
    // Address
    addressLine1,
    addressLine2,
    city,
    stateProvince,
    postalCode,
    country,
    showAddress,
    // Decorative
    showAccentLine,
    accentLineColor,
    accentLineWidth,
    accentLinePosition,
    showBorder,
    borderStyle,
    borderColor,
    borderWidth,
    showCornerDecoration,
    cornerDecorationStyle,
    cornerDecorationColor,
  } = mergedSettings;

  const hasContactInfo = showContactInfo && (contactName || contactPhone || contactEmail || website);
  const hasAddress = showAddress && (addressLine1 || city || stateProvince);

  // Background styles
  const backgroundStyles = useMemo(() => {
    const styles: React.CSSProperties = {};

    if (backgroundType === 'solid') {
      styles.backgroundColor = backgroundColor;
    } else if (backgroundType === 'gradient') {
      styles.background = getGradientCSS(mergedSettings);
    } else if (backgroundType === 'image' && backgroundImageUrl) {
      styles.backgroundImage = `url(${backgroundImageUrl})`;
      styles.backgroundSize = backgroundImagePosition === 'tile' ? 'auto' : backgroundImagePosition;
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = backgroundImagePosition === 'tile' ? 'repeat' : 'no-repeat';
    }

    return styles;
  }, [backgroundType, backgroundColor, backgroundImageUrl, backgroundImagePosition, mergedSettings]);

  // Border styles
  const borderStyles = useMemo(() => {
    if (!showBorder || borderStyle === 'none') return {};

    const width = borderWidth || 1;
    const styles: React.CSSProperties = {
      borderColor: borderColor,
      borderWidth: `${width}px`,
      borderStyle: borderStyle === 'double' ? 'double' : 'solid',
    };

    if (borderStyle === 'double') {
      styles.borderWidth = `${width * 2}px`;
    }

    return styles;
  }, [showBorder, borderStyle, borderColor, borderWidth]);

  // Text alignment classes
  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end',
  };

  // Logo size classes
  const logoSizeClasses = {
    small: compact ? 'max-h-8' : 'max-h-12',
    medium: compact ? 'max-h-12' : 'max-h-20',
    large: compact ? 'max-h-16' : 'max-h-28',
  };

  // Logo position classes
  const logoPositionClasses = {
    'top-left': 'justify-start',
    'top-center': 'justify-center',
    'top-right': 'justify-end',
    'center': 'justify-center',
  };

  const baseClasses = compact
    ? 'relative p-4 shadow-sm rounded-lg overflow-hidden'
    : 'relative aspect-[8.5/11] p-8 sm:p-12 shadow-lg rounded-xl overflow-hidden';

  return (
    <div
      className={`${baseClasses} ${className}`}
      style={{
        ...backgroundStyles,
        ...borderStyles,
        fontFamily: fontFamily || 'Plus Jakarta Sans',
      }}
    >
      {/* Background overlay for images */}
      {backgroundType === 'image' && backgroundImageUrl && backgroundOverlayOpacity && backgroundOverlayOpacity > 0 && (
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundColor: backgroundOverlayColor,
            opacity: backgroundOverlayOpacity / 100,
          }}
        />
      )}

      {/* Corner decorations */}
      {showCornerDecoration && cornerDecorationStyle !== 'none' && (
        <>
          <CornerDecoration style={cornerDecorationStyle || 'none'} color={cornerDecorationColor || '#FF6B00'} position="top-left" />
          <CornerDecoration style={cornerDecorationStyle || 'none'} color={cornerDecorationColor || '#FF6B00'} position="top-right" />
          <CornerDecoration style={cornerDecorationStyle || 'none'} color={cornerDecorationColor || '#FF6B00'} position="bottom-left" />
          <CornerDecoration style={cornerDecorationStyle || 'none'} color={cornerDecorationColor || '#FF6B00'} position="bottom-right" />
        </>
      )}

      {/* Content container - above decorations */}
      <div className={`relative z-10 h-full flex flex-col ${alignmentClasses[textAlignment || 'left']}`}>
        {/* Confidential Badge */}
        {showConfidentialBadge && (
          <div className="absolute top-0 right-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-xs font-bold uppercase tracking-wider rounded-bl-lg">
            <Shield size={12} />
            {confidentialText || 'CONFIDENTIAL'}
          </div>
        )}

        {/* Logo */}
        {showLogo && logoUrl && (
          <div className={`flex w-full ${logoPositionClasses[logoPosition || 'top-left']} ${compact ? 'mb-3' : 'mb-6'}`}>
            <img
              src={logoUrl}
              alt={companyName || 'Company logo'}
              className={`object-contain ${logoSizeClasses[logoSize || 'medium']}`}
            />
          </div>
        )}

        {/* Main Title Section */}
        <div className={`flex-1 flex flex-col ${alignmentClasses[textAlignment || 'left']} ${compact ? 'mt-2' : 'mt-8 sm:mt-16'}`}>
          {/* Accent line above title */}
          {showAccentLine && accentLinePosition === 'above-title' && (
            <div
              className={`${compact ? 'mb-2' : 'mb-4'} ${textAlignment === 'center' ? 'mx-auto' : textAlignment === 'right' ? 'ml-auto' : ''}`}
              style={{
                width: compact ? '40px' : '60px',
                height: `${accentLineWidth || 4}px`,
                backgroundColor: accentLineColor,
              }}
            />
          )}

          {/* Company Name */}
          <h1
            className={`font-bold leading-tight ${compact ? 'text-lg' : ''}`}
            style={{
              color: titleColor,
              fontSize: compact ? undefined : `${(titleSize || 48) * 0.6}px`,
            }}
          >
            {companyName || 'Company Name'}
          </h1>

          {/* Document Title */}
          <h2
            className={`font-bold leading-tight ${compact ? 'text-xl mt-1' : 'mt-2'}`}
            style={{
              color: subtitleColor,
              fontSize: compact ? undefined : `${(subtitleSize || 32) * 0.6}px`,
            }}
          >
            {documentTitle || 'Business Plan'}
          </h2>

          {/* Accent line below title */}
          {showAccentLine && accentLinePosition === 'below-title' && (
            <div
              className={`${compact ? 'mt-2' : 'mt-4'} ${textAlignment === 'center' ? 'mx-auto' : textAlignment === 'right' ? 'ml-auto' : ''}`}
              style={{
                width: compact ? '40px' : '80px',
                height: `${accentLineWidth || 4}px`,
                backgroundColor: accentLineColor,
              }}
            />
          )}

          {/* Tagline */}
          {tagline && (
            <p
              className={`italic mt-3 ${compact ? 'text-xs' : 'text-sm sm:text-base'}`}
              style={{ color: subtitleColor, opacity: 0.8 }}
            >
              {tagline}
            </p>
          )}
        </div>

        {/* Metadata Section */}
        <div className={`${compact ? 'mt-3' : 'mt-6 sm:mt-8'} ${alignmentClasses[textAlignment || 'left']}`}>
          {/* Prepared Date */}
          {showDate && preparedDate && (
            <div className={compact ? 'mb-2' : 'mb-3'}>
              <p
                className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}
                style={{ color: titleColor, opacity: 0.8 }}
              >
                Prepared
              </p>
              <p
                className={compact ? 'text-xs' : 'text-sm'}
                style={{ color: titleColor, opacity: 0.7 }}
              >
                {formatDate(preparedDate, dateFormat)}
              </p>
            </div>
          )}

          {/* Prepared By */}
          {showPreparedBy && preparedBy && (
            <div className={compact ? 'mb-2' : 'mb-3'}>
              <p
                className={`font-semibold ${compact ? 'text-xs' : 'text-sm'}`}
                style={{ color: titleColor, opacity: 0.8 }}
              >
                Prepared by
              </p>
              <p
                className={compact ? 'text-xs' : 'text-sm'}
                style={{ color: titleColor, opacity: 0.7 }}
              >
                {preparedBy}
              </p>
            </div>
          )}

          {/* Version */}
          {showVersion && version && (
            <p
              className={`${compact ? 'text-xs' : 'text-sm'}`}
              style={{ color: titleColor, opacity: 0.6 }}
            >
              Version {version}
            </p>
          )}
        </div>

        {/* Contact & Address Section */}
        {!compact && (hasContactInfo || hasAddress) && (
          <div
            className={`mt-auto pt-6 grid gap-6 ${hasContactInfo && hasAddress ? 'grid-cols-2' : 'grid-cols-1'}`}
            style={{ color: titleColor }}
          >
            {/* Contact Information */}
            {hasContactInfo && (
              <div className={textAlignment === 'right' ? 'text-right' : textAlignment === 'center' ? 'text-center' : ''}>
                <h3
                  className="font-semibold mb-2 text-sm border-b pb-1"
                  style={{ borderColor: `${titleColor}30` }}
                >
                  Contact information
                </h3>
                <div className="space-y-1 text-sm opacity-80">
                  {contactName && (
                    <p className="font-medium">
                      {contactName}
                      {contactTitle && `, ${contactTitle}`}
                    </p>
                  )}
                  {contactPhone && <p>{contactPhone}</p>}
                  {contactEmail && <p>{contactEmail}</p>}
                  {website && <p>{website}</p>}
                </div>
              </div>
            )}

            {/* Business Address */}
            {hasAddress && (
              <div className={textAlignment === 'right' ? 'text-right' : textAlignment === 'center' ? 'text-center' : ''}>
                <h3
                  className="font-semibold mb-2 text-sm border-b pb-1"
                  style={{ borderColor: `${titleColor}30` }}
                >
                  Business address
                </h3>
                <div className="space-y-1 text-sm opacity-80">
                  {addressLine1 && <p>{addressLine1}</p>}
                  {addressLine2 && <p>{addressLine2}</p>}
                  <p>
                    {[city, stateProvince, postalCode]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                  {country && <p>{country}</p>}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom accent line */}
        {showAccentLine && accentLinePosition === 'bottom' && (
          <div
            className="absolute bottom-0 left-0 right-0"
            style={{
              height: `${accentLineWidth || 4}px`,
              backgroundColor: accentLineColor,
            }}
          />
        )}
      </div>
    </div>
  );
}

export default CoverPagePreview;
