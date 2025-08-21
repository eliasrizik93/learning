// Utility functions for formatting data consistently across the application

/**
 * Formats a date string to a localized date format
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '—';

  try {
    return new Date(dateString).toLocaleDateString();
  } catch {
    return '—';
  }
};

/**
 * Formats a number with proper pluralization
 */
export const formatCount = (
  count: number,
  singular: string,
  plural?: string
): string => {
  const pluralForm = plural || `${singular}s`;
  return `${count} ${count === 1 ? singular : pluralForm}`;
};

/**
 * Truncates text to a specified length with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

/**
 * Capitalizes the first letter of a string
 */
export const capitalize = (text: string): string => {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};
