/**
 * Check if a published date falls within the allowed time window.
 * @param {number} publishedTimestamp - Unix timestamp in seconds
 * @param {number} maxAgeSeconds - Maximum age in seconds (e.g. 86400 = 24h)
 * @returns {boolean}
 */
export function isWithinTimeWindow(publishedTimestamp, maxAgeSeconds) {
  const now = Math.floor(Date.now() / 1000);
  return now - publishedTimestamp < maxAgeSeconds;
}
