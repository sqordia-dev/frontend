import * as React from "react";
import { cn } from "@/lib/utils";

interface SkipLinkProps {
  /** The ID of the element to skip to (without #) */
  targetId?: string;
  /** Custom label for the skip link */
  children?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

/**
 * Skip Link Component
 *
 * Provides keyboard users a way to skip navigation and jump directly to main content.
 * The link is visually hidden until focused.
 *
 * Usage:
 * 1. Add <SkipLink /> at the top of your layout
 * 2. Add id="main-content" to your main content element
 *
 * @example
 * ```tsx
 * <body>
 *   <SkipLink />
 *   <header>...</header>
 *   <main id="main-content">...</main>
 * </body>
 * ```
 */
export function SkipLink({
  targetId = "main-content",
  children,
  className,
}: SkipLinkProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <a
      href={`#${targetId}`}
      onClick={handleClick}
      className={cn(
        // Visually hidden by default
        "sr-only",
        // Visible when focused
        "focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]",
        "focus:px-4 focus:py-2 focus:rounded-md",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        "focus:font-medium focus:text-sm",
        className
      )}
    >
      {children || "Skip to main content"}
    </a>
  );
}

/**
 * Skip Links Group
 *
 * Provides multiple skip links for complex layouts.
 *
 * @example
 * ```tsx
 * <SkipLinks
 *   links={[
 *     { targetId: "main-content", label: "Skip to main content" },
 *     { targetId: "sidebar", label: "Skip to sidebar" },
 *     { targetId: "footer", label: "Skip to footer" },
 *   ]}
 * />
 * ```
 */
interface SkipLinksProps {
  links: Array<{
    targetId: string;
    label: string;
  }>;
  className?: string;
}

export function SkipLinks({ links, className }: SkipLinksProps) {
  return (
    <div className={cn("sr-only focus-within:not-sr-only", className)}>
      <nav
        aria-label="Skip links"
        className="fixed top-0 left-0 z-[100] p-4 space-y-2"
      >
        {links.map((link) => (
          <SkipLink
            key={link.targetId}
            targetId={link.targetId}
            className="block"
          >
            {link.label}
          </SkipLink>
        ))}
      </nav>
    </div>
  );
}

/**
 * Visually Hidden Component
 *
 * Hides content visually but keeps it accessible to screen readers.
 * Useful for providing additional context to assistive technologies.
 *
 * @example
 * ```tsx
 * <button>
 *   <Icon />
 *   <VisuallyHidden>Close dialog</VisuallyHidden>
 * </button>
 * ```
 */
interface VisuallyHiddenProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Make the content focusable (useful for skip links) */
  focusable?: boolean;
}

export function VisuallyHidden({
  children,
  focusable = false,
  className,
  ...props
}: VisuallyHiddenProps) {
  return (
    <span
      className={cn(
        "sr-only",
        focusable && "focus:not-sr-only",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

/**
 * Announce Component
 *
 * Creates a live region for screen reader announcements.
 * Useful for dynamic content changes that should be announced.
 *
 * @example
 * ```tsx
 * <Announce>Form submitted successfully!</Announce>
 * ```
 */
interface AnnounceProps {
  children: React.ReactNode;
  /** Politeness level for the announcement */
  politeness?: "polite" | "assertive";
  /** Whether to render children visibly */
  visible?: boolean;
  className?: string;
}

export function Announce({
  children,
  politeness = "polite",
  visible = false,
  className,
}: AnnounceProps) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className={cn(!visible && "sr-only", className)}
    >
      {children}
    </div>
  );
}
