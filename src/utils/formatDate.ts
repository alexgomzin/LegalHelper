/**
 * Format a date into a readable string format
 * @param date - The date to format
 * @returns Formatted date string in the format "Month DD, YYYY"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 