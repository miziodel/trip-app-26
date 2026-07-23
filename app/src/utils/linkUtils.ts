import type { ItemOrario, MapsProvider, Paese } from '../types/viaggio';

/**
 * Normalizes query string for map searches
 */
export function formatMapQuery(query?: string, city?: string): string {
  const q = (query || '').replace(/\[.*?\]|\(.*?\)/g, '').trim();
  const c = (city || '').trim();

  if (!q && !c) return '';
  if (!q) return c;
  if (!c) return q;

  // Avoid duplicating city name if already present in query
  if (q.toLowerCase().includes(c.toLowerCase())) {
    return q;
  }

  return `${q}, ${c}`;
}

/**
 * Returns deep link for map navigation using explicit provider or country context
 */
export function getMapDeepLink(
  query?: string,
  city?: string,
  explicitProvider?: MapsProvider,
  paese?: Paese
): string {
  const fullQuery = formatMapQuery(query, city);

  if (!fullQuery) {
    return 'https://www.google.com/maps';
  }

  const isKorea = paese === 'KR' ||
    explicitProvider === 'naver' ||
    city?.toLowerCase().includes('seoul') ||
    city?.toLowerCase().includes('busan') ||
    fullQuery.toLowerCase().includes('seoul') ||
    fullQuery.toLowerCase().includes('busan') ||
    fullQuery.toLowerCase().includes('korea');

  if (isKorea) {
    return `https://map.naver.com/v5/search/${encodeURIComponent(fullQuery)}`;
  }

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullQuery)}`;
}

/**
 * Returns deep link directly from ItemOrario
 */
export function getMapUrlFromItem(item: ItemOrario, currentCity?: string, countryContext?: Paese): string {
  const query = item.maps_query || item.luogo_nome || item.attivita;
  return getMapDeepLink(query, currentCity, item.maps_provider, countryContext);
}
