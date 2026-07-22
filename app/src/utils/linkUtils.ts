/**
 * Utility functions for crafting external links & deep links.
 */

/**
 * Generates a Google Maps search URL / deep link given a query string and optional city context.
 *
 * @param query Location name, address, or search term (e.g. "Shinjuku Station", "Sejong-daero 100")
 * @param city Optional city name to refine the search (e.g. "Tokyo", "Seoul")
 * @returns Google Maps search URL string
 */
export function getMapDeepLink(query: string, city?: string): string {
  const trimmedQuery = query ? query.trim() : '';
  const trimmedCity = city ? city.trim() : '';

  if (!trimmedQuery && !trimmedCity) {
    return 'https://www.google.com/maps';
  }

  let fullQuery = trimmedQuery;

  if (trimmedCity) {
    if (!trimmedQuery) {
      fullQuery = trimmedCity;
    } else if (!trimmedQuery.toLowerCase().includes(trimmedCity.toLowerCase())) {
      fullQuery = `${trimmedQuery}, ${trimmedCity}`;
    }
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;
}
