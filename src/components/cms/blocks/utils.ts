/**
 * Converts a dot-separated blockKey to a human-readable label.
 *
 * Takes the last segment of the key, replaces underscores and camelCase
 * boundaries with spaces, and capitalizes the first letter of each word.
 *
 * @example
 * blockKeyToLabel("landing.hero.title")       // "Title"
 * blockKeyToLabel("global.social.facebook_url") // "Facebook Url"
 * blockKeyToLabel("landing.hero.ctaButton")    // "Cta Button"
 */
export function blockKeyToLabel(blockKey: string): string {
  const lastPart = blockKey.split('.').pop() || blockKey;
  return lastPart
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

/**
 * Safely parses a JSON metadata string into a typed object.
 * Returns an empty object if the string is null, empty, or invalid JSON.
 */
export function parseMetadata<T = Record<string, unknown>>(
  metadata: string | null
): Partial<T> {
  if (!metadata) return {};
  try {
    return JSON.parse(metadata) as Partial<T>;
  } catch {
    return {};
  }
}
