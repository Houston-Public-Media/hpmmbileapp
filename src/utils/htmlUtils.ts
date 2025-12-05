/**
 * Utility functions for handling HTML entities and text formatting
 */

/**
 * Decodes common HTML entities in a string
 * @param str - The string containing HTML entities
 * @returns The decoded string
 */
export const decodeHtmlEntities = (str: string): string => {
  if (!str) return str;
  
  // Handle numeric HTML entities (like &#8217;, &#8216;, etc.)
  const numericEntities: { [key: string]: string } = {
    '&#8217;': "'",
    '&#8216;': "'",
    '&#8220;': '"',
    '&#8221;': '"',
    '&#8211;': '–',
    '&#8212;': '—',
    '&#8230;': '…',
    '&#x27;': "'",
    '&#x2F;': '/',
    '&#x60;': '`',
    '&#x3D;': '='
  };
  
  // Replace numeric entities first
  let result = str.replace(/&#?\w+;/g, (entity) => {
    return numericEntities[entity] || entity;
  });
  
  // Then handle named entities
  return result
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&deg;/g, '°')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&copy;/g, '©')
    .replace(/&reg;/g, '®')
    .replace(/&trade;/g, '™')
    .replace(/&hellip;/g, '…')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&lsquo;/g, '\'')
    .replace(/&rsquo;/g, '\'')
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"');
};

/**
 * Cleans and formats text by decoding HTML entities and trimming whitespace
 * @param str - The string to clean
 * @returns The cleaned string
 */
export const cleanText = (str: string): string => {
  if (!str) return str;
  return decodeHtmlEntities(str).trim();
};
